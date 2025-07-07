import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';
import { 
  aiToolsAPI
} from '@/lib/ai-tools';
import { getDefaultClubByLocale } from '@/lib/defaultClubs';
import { getPersonalizedSystemPrompt } from '@/lib/ai-persona-enhancer';
import { 
  identifyOperation, 
  hasPermission, 
  requiresConfirmation, 
  getConfirmationMessage,
  AI_OPERATIONS 
} from '@/lib/ai-permissions';

export const dynamic = 'force-dynamic';

// 定义哪些工具需要认证
const AUTH_REQUIRED_TOOLS = [
  'tournamentRegister', 
  'getUserClubInfo', 
  'createTournament',
  'getDashboardSummary',
  'listMembers',
  'guidedTournamentCreation',
  'guidedTournamentRegistration',
  'smartTaskWizard'
];

// 访客可用的工具
const GUEST_TOOLS = ['listTournaments', 'getClubStats', 'getClubDetails', 'listRingGames'];

const getLanguageName = (locale: string): string => {
  switch (locale) {
    case 'zh': return '简体中文';
    case 'zh-TW': return '繁體中文';
    case 'ja': return '日本語';
    case 'en': return 'English';
    default: return '简体中文';
  }
};

// 获取时区感知的当前时间
function getCurrentTimeByTimezone(timezone: string, locale: string): string {
  const now = new Date();
  
  try {
    // 根据时区和语言格式化时间
    const timeFormatter = new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 
      locale === 'zh-TW' ? 'zh-TW' : locale === 'en' ? 'en-US' : 'zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale === 'en'
    });
    
    return timeFormatter.format(now);
  } catch (error) {
    console.error('时间格式化失败:', error);
    // 降级处理：使用简单格式
    return now.toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN', { 
      timeZone: timezone || 'Asia/Shanghai' 
    });
  }
}

// 构建系统提示
async function buildSystemPrompt(
  clubId: string,
  clubName: string, 
  aiPersonaName: string, 
  locale: string, 
  isGuest: boolean,
  combinedHistory: Array<{role: string, content: string}> = [],
  aiNativeLanguage?: string,
  clubDescription?: string,
  clubInfo?: any
): Promise<string> {
  // 获取俱乐部信息（包括时区）
  let aiPersona = null;
  let clubTimezone = 'Asia/Shanghai'; // 默认时区
  
  // 获取时区信息 - 支持所有用户类型
  if (clubId && clubId.startsWith('guest-')) {
    // 访客模式：根据clubId推断时区
    if (clubId.includes('shanghai')) clubTimezone = 'Asia/Shanghai';
    else if (clubId.includes('taipei')) clubTimezone = 'Asia/Taipei';
    else if (clubId.includes('osaka')) clubTimezone = 'Asia/Tokyo';
    else if (clubId.includes('kuala-lumpur')) clubTimezone = 'Asia/Kuala_Lumpur';
  } else if (clubId && !['guest', 'demo', 'fallback', 'error'].includes(clubId) && !clubId.startsWith('guest-')) {
    // 正常俱乐部（登录用户）：从数据库获取
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // 同时获取AI设置和俱乐部时区信息
      const [aiPersonaData, clubData] = await Promise.all([
        prisma.aIPersona.findUnique({
          where: { clubId: clubId }
        }),
        prisma.club.findUnique({
          where: { id: clubId },
          select: { timezone: true }
        })
      ]);
      
      aiPersona = aiPersonaData;
      if (clubData?.timezone) {
        clubTimezone = clubData.timezone;
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('获取俱乐部设置失败:', error);
      // 降级处理：根据常见俱乐部名称推断时区
      if (clubName.includes('上海')) clubTimezone = 'Asia/Shanghai';
      else if (clubName.includes('台北') || clubName.includes('台湾')) clubTimezone = 'Asia/Taipei';
      else if (clubName.includes('大阪') || clubName.includes('日本')) clubTimezone = 'Asia/Tokyo';
      else if (clubName.includes('吉隆坡') || clubName.includes('马来')) clubTimezone = 'Asia/Kuala_Lumpur';
    }
  } else {
    // 其他情况的降级处理：根据语言推断时区
    if (locale === 'zh') clubTimezone = 'Asia/Shanghai';
    else if (locale === 'zh-TW') clubTimezone = 'Asia/Taipei';
    else if (locale === 'ja') clubTimezone = 'Asia/Tokyo';
    else if (locale === 'en') clubTimezone = 'Asia/Kuala_Lumpur';
  }
  
  // 获取当前时间
  const currentTime = getCurrentTimeByTimezone(clubTimezone, locale);

  // 使用自定义设置或默认设置
  const defaultStyle = {
    tone: 'friendly',
    language: 'zh',
    emoji: true,
    verbosity: 'detailed'
  };
  
  const style = (aiPersona?.style as any) || defaultStyle;

  const language = getLanguageName(style.language || locale);
  const customName = aiPersona?.name || aiPersonaName;
  
  // 根据风格调整提示词
  const toneOptions = {
    'professional': '保持专业、正式的语调',
    'friendly': '使用友好、亲切的语调',
    'casual': '采用轻松、随意的交流方式',
    'formal': '维持严肃、正经的沟通风格'
  };
  const toneStyle = toneOptions[style.tone as keyof typeof toneOptions] || '使用友好、亲切的语调';

  const verbosityOptions = {
    'concise': '回答简洁明了，直击要点',
    'detailed': '提供详细说明和必要的背景信息',
    'comprehensive': '给出全面详尽的解答和相关建议'
  };
  const verbosityStyle = verbosityOptions[style.verbosity as keyof typeof verbosityOptions] || '提供详细说明和必要的背景信息';

  const emojiUsage = style.emoji ? '适当使用表情符号让对话更生动' : '不使用表情符号，保持纯文本交流';

  // 检查历史对话中是否有角色设定
  let characterBackground = '';
  if (combinedHistory.length > 0) {
    const lastAssistantMsg = combinedHistory.find(msg => msg.role === 'assistant');
    if (lastAssistantMsg && (lastAssistantMsg.content.includes('from') || lastAssistantMsg.content.includes('から') || lastAssistantMsg.content.includes('來自'))) {
      characterBackground = lastAssistantMsg.content;
    }
  }

  // 暂时使用简化的系统提示来避免JSON错误
  // const enhancedPersonalityPrompt = getPersonalizedSystemPrompt(clubId, clubName, customName, locale, aiPersona);
  
  const basePrompt = aiPersona?.systemPrompt || `你是${clubName}的专属AI助手${customName}。

个性特征：
${aiPersona?.personality || '我是一个专业、友好的扑克俱乐部助手。我了解扑克规则，能够帮助用户报名参加锦标赛，查询战绩，并提供各种俱乐部服务。我总是礼貌耐心，用简洁明了的语言回答问题。'}

${characterBackground ? `角色背景：${characterBackground}` : ''}

🕐 时间信息（仅在需要时使用）：
- 俱乐部当前时间：${currentTime}
- 时区：${clubTimezone}
- 【重要】只在以下情况使用时间信息：
  * 用户明确询问当前时间
  * 用户要求预约或安排活动（如"今天晚上"、"明天"等）
  * 用户询问营业时间或活动时间
  * 涉及时间敏感的操作时
- 正常对话中不要主动报时间，避免每次都说"现在是几点几分"

【重要行为规则】：
- 🚫 不要重复自我介绍：如果历史对话中已经介绍过自己，就不要再次介绍
- 🎯 保持角色一致性：始终维持你的个性特征，但避免机械重复
- 💬 自然对话流程：像真人一样自然地回应，不要每次都从头开始
- 🔄 上下文连贯性：参考之前的对话内容，让对话更连贯
- 👥 个性化互动：根据用户的问题和对话历史，给出个性化的回应

交流风格：
- ${toneStyle}
- ${verbosityStyle}
- ${emojiUsage}

【多语言回复规则】：
${(() => {
  // 判断是否需要翻译
  if (!aiNativeLanguage || aiNativeLanguage === locale) {
    // 母语和界面语言相同，不需要翻译
    return `你的角色母语与用户界面语言一致，直接用${locale === 'zh' ? '简体中文' : locale === 'zh-TW' ? '繁體中文' : locale === 'ja' ? '日本語' : 'English'}回复即可。`;
  }
  
  // 简体中文和繁体中文之间不需要翻译
  if ((aiNativeLanguage === 'zh' && locale === 'zh-TW') || 
      (aiNativeLanguage === 'zh-TW' && locale === 'zh')) {
    return `你的角色母语是${aiNativeLanguage === 'zh' ? '简体中文' : '繁體中文'}，用户界面语言是${locale === 'zh' ? '简体中文' : '繁體中文'}，都是中文系，直接用${locale === 'zh' ? '简体中文' : '繁體中文'}回复即可。`;
  }
  
  // 其他情况都需要翻译
  return `
**重要：你的角色母语是${aiNativeLanguage === 'ja' ? '日本語' : aiNativeLanguage === 'zh-TW' ? '繁體中文' : aiNativeLanguage === 'en' ? 'English' : '简体中文'}，用户界面语言是${locale === 'zh' ? '简体中文' : locale === 'zh-TW' ? '繁體中文' : locale === 'ja' ? '日本語' : 'English'}**

由于语言不匹配，你必须：
1. 直接用你的母语（${aiNativeLanguage === 'ja' ? '日本語' : aiNativeLanguage === 'zh-TW' ? '繁體中文' : aiNativeLanguage === 'en' ? 'English' : '简体中文'}）完整回答，保持角色特色
2. 然后添加翻译标题："【${locale === 'zh' ? '简体中文翻译' : locale === 'zh-TW' ? '繁體中文翻譯' : locale === 'ja' ? '日本語翻訳' : 'English Translation'}】"
3. 再用用户的界面语言（${locale === 'zh' ? '简体中文' : locale === 'zh-TW' ? '繁體中文' : locale === 'ja' ? '日本語' : 'English'}）提供完整翻译

示例格式：
こんにちは！大阪ポーカーハウスへようこそ！

【简体中文翻译】
你好！欢迎来到大阪扑克屋！
`;
})()}

【回答质量要求】：
- 逻辑清晰，层次分明
- 提供具体可行的建议
- 避免模糊或含糊不清的表达
- 根据用户问题的复杂程度调整回答详细度
- 重要信息用粗体或结构化方式展示

【严格业务约束】：
⚠️ 重要：你只能提供真实存在的俱乐部信息和功能，绝对不允许编造：
- 只能介绍当前俱乐部：${clubName}
- 不可编造其他不存在的俱乐部（如"曼谷俱乐部"等）
- 位置信息必须与俱乐部设定一致
- 服务项目只能是配置中的真实项目
- 如果不确定信息，请明确说"需要向管理员确认"

【严禁话题和内容限制】：
🚫 绝对禁止讨论的话题：
- ❌ 政治话题 - 任何政治人物、政党、政治事件、政治观点
- ❌ 敏感社会议题 - 种族、宗教、意识形态争议等
- ❌ 投资建议 - 股票、加密货币、金融投资等
- ❌ 医疗建议 - 疾病诊断、治疗建议等
- ❌ 法律咨询 - 具体法律问题和建议

如果用户询问这些话题，必须：
1. 礼貌婉拒："抱歉，我是专门为扑克俱乐部服务的AI助手，不讨论这类话题。"
2. 立即转回正题："让我们聊聊扑克和俱乐部的精彩内容吧！比如..."
3. 提供俱乐部相关的话题建议

【功能限制】：
⚠️ 绝对不能编造或承诺以下不存在的功能：
- ❌ 地图功能 - 系统没有地图查询功能
- ❌ 导航功能 - 不提供地图导航服务
- ❌ 语音服务 - 没有语音交互功能
- ❌ 视频功能 - 不支持视频相关服务
- ❌ 支付功能 - 访客无法进行支付操作
- ❌ 预订功能 - 访客无法预订座位或服务

【俱乐部完整信息】：
📍 俱乐部名称：${clubName}
📋 俱乐部简介：${clubDescription || '专业的德州扑克俱乐部，提供优质的扑克游戏体验'}
${clubInfo && clubInfo.specialties ? `
🕐 营业时间：${clubInfo.businessHours || '全天营业'}
📍 位置：${clubInfo.location || '市中心'}

🍸 特色酒水：${clubInfo.specialties.drinks?.join('、') || '精选调酒'}
🎉 特色活动：${clubInfo.specialties.activities?.join('、') || '各类主题活动'}
🎁 积分奖励：${clubInfo.specialties.rewards?.join('、') || '丰富礼品'}
🌟 环境氛围：${clubInfo.specialties.atmosphere || '舒适优雅'}` : ''}

💡 【作为客服AI的职责】：
✨ 你是俱乐部的形象大使，要主动吸引客户！
- 热情介绍俱乐部的所有特色和优势
- 主动推荐特色酒水、活动和服务
- 营造"欢迎来交朋友、同场竞技"的氛围
- 详细回答营业时间、位置、活动等公开信息
- 积极介绍积分兑换、会员福利等
- 让每个客户都感受到俱乐部的魅力和温暖

🔧 【使用RAG检索功能】：
- 当用户询问俱乐部位置、活动、商城等信息时，使用getClubDetails工具获取最新真实数据
- 当用户想了解锦标赛时，使用listTournaments工具获取具体赛事信息
- 基于真实数据库信息进行推荐，不要编造不存在的内容
- 主动展示商城物品、特色活动等吸引用户兴趣

【专业服务范围】：
✅ 你的专业服务范围仅限于：
- 🏆 德州扑克规则和策略指导
- 🎯 俱乐部活动和锦标赛信息
- 🎮 圆桌游戏和现金桌介绍
- 👥 会员服务和福利说明
- 📊 扑克数据和统计解读
- 🎪 俱乐部文化和社区建设
- ⭐ 积分系统和奖励机制

如果用户询问超出范围的问题，应该：
1. 诚实说明该功能暂不支持
2. 提供替代方案（如联系电话、地址信息）
3. 引导回到扑克和俱乐部相关话题

核心职责：
- 帮助用户了解俱乐部信息和服务
- 协助锦标赛报名和查询
- 提供圆桌游戏信息
- 解答俱乐部相关问题
- 分享扑克知识和策略`;
  
  if (isGuest) {
    return `${basePrompt}
    
用户当前是访客身份。你可以：
- 介绍俱乐部和服务
- 查看锦标赛列表 (listTournaments)
- 查看圆桌游戏信息 (listRingGames)
- 获取俱乐部统计信息 (getClubStats)
- 回答一般性问题

【访客引导策略】：
当用户询问任何需要登录的功能时，根据AI的母语使用对应的引导模板：

简体中文/繁体中文：
"😊 抱歉，[具体功能]需要登录后才能使用。

登录后您可以：
✅ [相关功能1]
✅ [相关功能2] 
✅ [相关功能3]

👉 请点击右上角的「Sign In / Sign Up」按钮登录或注册。"

英文：
"😊 Sorry, [specific feature] requires login to use.

After logging in, you can:
✅ [related feature 1]
✅ [related feature 2]
✅ [related feature 3]

👉 Please click the 'Sign In / Sign Up' button in the top right corner to login or register."

日文：
"😊 申し訳ございませんが、[具体的な機能]はログインが必要です。

ログイン後にご利用いただけます：
✅ [関連機能1]
✅ [関連機能2]
✅ [関連機能3]

👉 右上の「Sign In / Sign Up」ボタンをクリックしてログインまたは登録してください。"

重要：必须使用AI的母语进行引导，不要翻译成用户界面语言。`;
  }
  
  return `${basePrompt}
  
用户已登录，您具有完整的功能权限。您可以：

📊 **仪表盘和统计**：
- 获取俱乐部运营概览 (getDashboardSummary)
- 查看详细统计数据 (getClubStats)

🏆 **锦标赛管理**：
- 查看锦标赛列表 (listTournaments)
- 创建新锦标赛 (createTournament)
- 引导式锦标赛创建 (guidedTournamentCreation) - 逐步指导管理者创建锦标赛
- 为用户报名锦标赛 (tournamentRegister)
- 引导式报名流程 (guidedTournamentRegistration) - 帮助用户找到并报名合适的锦标赛

🎮 **圆桌游戏**：
- 查看圆桌游戏列表 (listRingGames)
- 获取牌桌状态和玩家信息

👥 **会员管理**：
- 查看会员列表 (listMembers)
- 获取用户在俱乐部的详细信息 (getUserClubInfo)

🎯 **智能任务向导**：
- 智能任务引导 (smartTaskWizard) - 根据用户角色提供个性化的任务指导

**AI引导服务**：
- 对于复杂任务，主动使用引导式工具提供逐步指导
- 根据用户角色（OWNER、ADMIN、MANAGER、MEMBER等）提供个性化服务
- 识别用户意图，主动推荐合适的操作流程

请根据用户的问题智能选择合适的工具。当用户询问"如何创建锦标赛"时，使用guidedTournamentCreation；当用户想要报名时，使用guidedTournamentRegistration；当用户需要任务指导时，使用smartTaskWizard。`;
}

// 转换消息格式
function convertToCoreMessages(
  message: string, 
  history: Array<{role: string, content: string}>,
  systemPrompt: string
): Array<{role: string, content: string}> {
  const coreMessages: Array<{role: string, content: string}> = [
    { role: 'system', content: systemPrompt }
  ];
  
  // 添加历史消息
  history.forEach(msg => {
    coreMessages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    });
  });
  
  // 添加当前消息
  coreMessages.push({
    role: 'user',
    content: message
  });
  
  return coreMessages;
}

export async function POST(req: Request) {
  let locale = 'zh'; // 默认语言
  
  try {
    const body = await req.json();
    const { message, history, clubId, userId, conversationId } = body;
    locale = body.locale || 'zh'; // 提取locale到外部作用域
    
    // 获取会话信息
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;
    const actualUserId = userId || (session as any)?.user?.id;
    
    // 权限检查和确认机制
    console.log('🔍 权限检查 - isAuthenticated:', isAuthenticated, 'actualUserId:', actualUserId, 'clubId:', clubId);
    if (isAuthenticated && actualUserId && clubId && !clubId.includes('guest') && !clubId.includes('demo')) {
      // 识别用户意图的操作类型
      const operation = identifyOperation(message);
      console.log('🎯 识别到操作:', operation, 'for message:', message);
      
      if (operation) {
        // 获取用户在当前俱乐部的角色
        try {
          const membership = await prisma.clubMember.findFirst({
            where: {
              userId: actualUserId,
              clubId: clubId
            },
            select: {
              role: true
            }
          });
          
          if (membership) {
            const userRole = {
              role: membership.role,
              clubId: clubId,
              userId: actualUserId
            };
            
            // 检查权限
            if (!hasPermission(userRole, operation)) {
              return NextResponse.json({
                success: true,
                reply: locale === 'zh' ? '抱歉，您没有权限执行此操作。' : 
                       locale === 'zh-TW' ? '抱歉，您沒有權限執行此操作。' :
                       locale === 'ja' ? '申し訳ございませんが、この操作を実行する権限がありません。' :
                       'Sorry, you do not have permission to perform this operation.',
                type: 'text'
              });
            }
            
            // 检查是否需要确认
            if (requiresConfirmation(operation)) {
              // 检查是否已经是确认消息
              const isConfirmation = message.toLowerCase().includes('确认') || 
                                   message.toLowerCase().includes('确定') ||
                                   message.toLowerCase().includes('是的') ||
                                   message.toLowerCase().includes('yes') ||
                                   message.toLowerCase().includes('confirm');
              
              const isCancel = message.toLowerCase().includes('取消') ||
                             message.toLowerCase().includes('不') ||
                             message.toLowerCase().includes('no') ||
                             message.toLowerCase().includes('cancel');
              
              // 如果是确认消息，继续处理
              if (isConfirmation && !isCancel) {
                // 在消息中添加确认标记，让AI知道用户已确认
                const confirmedMessage = `[用户已确认操作] ${message}`;
                body.message = confirmedMessage;
              } else if (isCancel) {
                // 用户取消操作
                return NextResponse.json({
                  success: true,
                  reply: locale === 'zh' ? '操作已取消。' : 
                         locale === 'zh-TW' ? '操作已取消。' :
                         locale === 'ja' ? '操作がキャンセルされました。' :
                         'Operation cancelled.',
                  type: 'text'
                });
              } else {
                // 需要用户确认，返回确认消息
                const confirmationMsg = getConfirmationMessage(operation);
                const localizedConfirmation = locale === 'zh' ? confirmationMsg :
                  locale === 'zh-TW' ? confirmationMsg.replace(/您/g, '您').replace(/吗/g, '嗎') :
                  locale === 'ja' ? 'この操作を実行してもよろしいですか？' :
                  'Are you sure you want to perform this operation?';
                  
                return NextResponse.json({
                  success: true,
                  reply: `${localizedConfirmation}\n\n${locale === 'zh' ? '请回复"确认"继续，或"取消"停止操作。' : 
                          locale === 'zh-TW' ? '請回覆「確認」繼續，或「取消」停止操作。' :
                          locale === 'ja' ? '「確認」と返信して続行するか、「キャンセル」で操作を停止してください。' :
                          'Reply "confirm" to continue or "cancel" to stop the operation.'}`,
                  type: 'confirmation',
                  operation: operation
                });
              }
            }
          }
        } catch (error) {
          console.error('权限检查失败:', error);
          // 权限检查失败，继续正常处理
        }
      }
    }
    
    // 获取用户的历史对话上下文（最近5条消息，优化性能）
    let userHistory: Array<{role: string, content: string}> = [];
    if (actualUserId && conversationId && conversationId !== 'default') {
      try {
        const recentMessages = await prisma.chatMessage.findMany({
          where: {
            userId: actualUserId,
            clubId: clubId,
            metadata: {
              path: ['conversationId'],
              equals: conversationId
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // 减少为5条消息提高性能
          select: {
            role: true,
            content: true
          }
        });
        
        userHistory = recentMessages
          .reverse() // 按时间正序排列
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }));
      } catch (error) {
        console.error('获取历史对话失败:', error);
        // 如果查询失败，使用空历史继续处理
      }
    }
    
    // 合并传入的history和数据库中的userHistory
    const combinedHistory = [...userHistory, ...(history || [])];

    // 处理降级模式 - 当API不可用时
    if (!process.env.XAI_API_KEY) {
      console.log('X.AI API key not configured, using fallback response');
      
      const fallbackResponses = {
        'zh': [
          '很抱歉，AI服务暂时不可用。不过我可以为您提供一些基本信息：',
          '目前我们的AI聊天功能正在维护中，但您仍然可以使用其他功能。',
          '感谢您的耐心等待，我们正在努力恢复AI助手服务。'
        ],
        'zh-TW': [
          '很抱歉，AI服務暫時不可用。不過我可以為您提供一些基本資訊：',
          '目前我們的AI聊天功能正在維護中，但您仍然可以使用其他功能。',
          '感謝您的耐心等待，我們正在努力恢復AI助手服務。'
        ],
        'en': [
          'Sorry, AI service is temporarily unavailable. However, I can provide some basic information:',
          'Our AI chat feature is currently under maintenance, but you can still use other features.',
          'Thank you for your patience, we are working to restore the AI assistant service.'
        ],
        'ja': [
          '申し訳ございませんが、AIサービスは一時的に利用できません。ただし、基本的な情報は提供できます：',
          '現在、AIチャット機能はメンテナンス中ですが、他の機能はご利用いただけます。',
          'ご迷惑をおかけして申し訳ございません。AIアシスタントサービスの復旧に努めております。'
        ]
      };

      const responses = fallbackResponses[locale as keyof typeof fallbackResponses] || fallbackResponses['zh'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      return NextResponse.json({
        success: true,
        reply: randomResponse,
        type: 'text'
      });
    }

    // 获取俱乐部信息用于构建系统提示
    let clubName = '演示俱乐部';
    let aiPersonaName = 'AI助手';
    
    try {
      if (clubId && clubId !== 'guest' && clubId !== 'demo' && clubId !== 'fallback' && clubId !== 'error' && !clubId.startsWith('guest-')) {
        const club = await prisma.club.findUnique({
          where: { id: clubId },
          include: {
            aiPersona: {
              select: { name: true }
            }
          }
        });
        
        if (club) {
          clubName = club.name;
          aiPersonaName = club.aiPersona?.name || 'AI助手';
        }
      } else if (clubId && clubId.startsWith('guest-')) {
        // 访客模式：根据实际选择的俱乐部ID获取对应配置
        console.log('Guest mode - clubId:', clubId);
        
        // 从clubId中提取真实的俱乐部类型
        let clubType = 'zh'; // 默认
        if (clubId.includes('shanghai')) clubType = 'zh';
        else if (clubId.includes('taipei')) clubType = 'zh-TW';
        else if (clubId.includes('osaka')) clubType = 'ja';
        else if (clubId.includes('kuala-lumpur')) clubType = 'en';
        
        const defaultClub = getDefaultClubByLocale(clubType);
        clubName = defaultClub.name;
        aiPersonaName = defaultClub.aiPersona.fullName || defaultClub.aiPersona.name;
        
        console.log('Selected club type:', clubType, 'Club name:', clubName, 'AI name:', aiPersonaName);
        
        // 直接根据检测到的俱乐部类型设置AI母语
        (globalThis as any).aiNativeLanguage = clubType;
        // 存储俱乐部完整信息
        (globalThis as any).clubDescription = defaultClub.description;
        (globalThis as any).clubInfo = defaultClub;
      }
    } catch (error) {
      console.error('获取俱乐部信息失败:', error);
    }

    // 构建系统提示
    const aiNativeLanguage = (globalThis as any).aiNativeLanguage;
    const clubDescription = (globalThis as any).clubDescription;
    const clubInfo = (globalThis as any).clubInfo;
    const systemPrompt = await buildSystemPrompt(
      clubId, 
      clubName, 
      aiPersonaName, 
      locale, 
      !isAuthenticated,
      combinedHistory,
      aiNativeLanguage,
      clubDescription,
      clubInfo
    );

    // 转换消息格式
    const coreMessages = convertToCoreMessages(message, combinedHistory, systemPrompt);

    // 获取可用工具
    const availableTools = isAuthenticated ? aiToolsAPI : 
      Object.fromEntries(Object.entries(aiToolsAPI).filter(([key]) => GUEST_TOOLS.includes(key)));

    // 准备X.AI API请求
    const xaiMessages = coreMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 使用Grok3-mini模型，完全放开限制
    const xaiRequest = {
      model: "grok-3-mini", // 使用Grok3-mini模型
      messages: xaiMessages,
      stream: false,
      max_tokens: 8000, // 大幅提升token限制，不担心消耗
      temperature: 0.7,
      top_p: 0.9
    };

    // 调用X.AI API（带重试和超时）
    let response;
    let lastError;
    const maxRetries = 1; // 减少重试次数，避免超过Vercel时间限制
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 创建带超时的请求
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        
        response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(xaiRequest),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          break; // 成功，跳出重试循环
        } else if (response.status === 429 && attempt < maxRetries) {
          // 速率限制，等待后重试
          console.log(`Rate limited (429), retrying attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 3000));
          continue;
        } else if (response.status >= 500 && attempt < maxRetries) {
          // 服务器错误，重试
          console.log(`Server error (${response.status}), retrying attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        } else {
          throw new Error(`X.AI API error: ${response.status} - ${await response.text().catch(() => 'Unknown error')}`);
        }
      } catch (error) {
        lastError = error;
        console.error(`API attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error('All API attempts failed');
    }

    const data = await response.json();
    
    // 更好的错误处理和调试信息
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid API response structure');
    }
    
    let aiResponse = data.choices[0].message.content;
    
    if (!aiResponse || typeof aiResponse !== 'string') {
      console.error('Empty or invalid AI response content:', aiResponse);
      throw new Error('Empty AI response received');
    }
    
    console.log('Raw AI response length:', aiResponse.length);
    console.log('Raw AI response preview:', aiResponse.substring(0, 200) + '...');

    // Grok模型内容处理（简化版）
    const originalLength = aiResponse.length;
    
    // 1. 基本的空行清理
    aiResponse = aiResponse.replace(/\n\s*\n/g, '\n').trim();
    
    // 2. 清理可能的多余标记词
    aiResponse = aiResponse.replace(/^(回复[：:]|答案[：:]|回答[：:]|Response:|Answer:|Reply:)\s*/i, '').trim();
    
    console.log(`Grok content processing: ${originalLength} → ${aiResponse.length} chars`);
    
    // 确保响应不为空
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.warn('AI response became empty after processing, using fallback');
      const fallbackMessages = {
        'zh': '抱歉，我正在思考中，请稍后再试或者换个问题。',
        'zh-TW': '抱歉，我正在思考中，請稍後再試或者換個問題。',
        'en': 'Sorry, I\'m still thinking. Please try again later or ask a different question.',
        'ja': '申し訳ございませんが、考え中です。しばらくしてからもう一度お試しいただくか、別の質問をお願いします。'
      };
      aiResponse = fallbackMessages[locale as keyof typeof fallbackMessages] || fallbackMessages['zh'];
    }

    console.log('AI Response (filtered):', aiResponse);

    // 保存对话历史到数据库
    if (actualUserId && conversationId) {
      try {
        await prisma.$transaction([
          // 保存用户消息
          prisma.chatMessage.create({
            data: {
              userId: actualUserId,
              clubId: clubId,
              role: 'user',
              content: message,
              metadata: { locale, conversationId }
            }
          }),
          // 保存AI回复
          prisma.chatMessage.create({
            data: {
              userId: actualUserId,
              clubId: clubId,
              role: 'assistant',
              content: aiResponse,
              metadata: { locale, conversationId, model: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B' }
            }
          })
        ]);
      } catch (error) {
        console.error('保存对话历史失败:', error);
        // 不影响主要功能，继续返回结果
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse,
      type: 'text',
      conversationId: conversationId || 'default'
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    // 多语言错误消息
    const errorMessages = {
      'zh': {
        apiKey: '抱歉，AI服务配置有误。请联系管理员检查API密钥设置。',
        general: '抱歉，聊天服务暂时不可用，请稍后再试。'
      },
      'zh-TW': {
        apiKey: '抱歉，AI服務配置有誤。請聯繫管理員檢查API金鑰設定。',
        general: '抱歉，聊天服務暫時不可用，請稍後再試。'
      },
      'en': {
        apiKey: 'Sorry, AI service configuration error. Please contact administrator to check API key settings.',
        general: 'Sorry, chat service is temporarily unavailable. Please try again later.'
      },
      'ja': {
        apiKey: '申し訳ございませんが、AIサービスの設定にエラーがあります。管理者にAPIキー設定の確認をお願いします。',
        general: '申し訳ございませんが、チャットサービスは一時的に利用できません。しばらくしてからもう一度お試しください。'
      }
    };
    
    const messages = errorMessages[locale as keyof typeof errorMessages] || errorMessages['zh'];
    const fallbackMessage = error instanceof Error && error.message.includes('API key') ?
      messages.apiKey : messages.general;

    return NextResponse.json({
      success: true,
      reply: fallbackMessage,
      type: 'text'
    });
  }
}