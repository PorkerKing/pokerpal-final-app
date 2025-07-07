# PokerPal 开发笔记

## 项目概述

PokerPal 是一个多语言的扑克俱乐部管理系统，支持四个不同地区的俱乐部，每个俱乐部都有独特的AI助手和文化特色。

### 技术栈
- **前端**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: PostgreSQL (Supabase)
- **认证**: NextAuth.js
- **AI**: X.AI (Grok3-mini)
- **国际化**: next-intl
- **部署**: Vercel

### 支持的俱乐部
1. **上海扑克会所** - 专业严谨，金融圈玩家
2. **台北德州俱乐部** - 亲和友好，注重社交
3. **大阪ポーカーハウス** - 传统礼仪，日式服务
4. **吉隆坡扑克联盟** - 多元文化，国际化

## 开发历程

### 阶段一：初始问题解决 (部署错误修复)

**问题描述**: 用户报告Vercel部署持续失败，错误信息为"E.map is not a function"，已经卡了一天。

**解决过程**:
1. 发现是TypeScript模板字符串语法错误
2. 将 `${变量}` 改为 `[变量]` 格式
3. 修复了多个文件中的类似问题

### 阶段二：UI/UX 改进

**用户需求**:
- 移除demo俱乐部，显示真实俱乐部
- 显示AI的具体名字而不是通用名称
- 修复翻译键显示问题
- 添加个性化欢迎消息
- 优化访客模式体验

**实施内容**:
1. 创建 `/lib/defaultClubs.ts` 配置文件，定义4个真实俱乐部
2. 为每个俱乐部设计独特的AI人设：
   - 上海：雅茜（金融专家）
   - 台北：心怡妹妹（温馨调酒师）
   - 大阪：美ちゃん（传统服务员）
   - 吉隆坡：Aisha（多语言文化大使）

### 阶段三：聊天功能问题修复

**报告的问题**:
1. 聊天按钮不固定，清除功能缺失
2. 无法切换俱乐部
3. AI回复过于通用，缺乏个性
4. 选择大阪俱乐部但上海AI回复

**根本原因分析**: 俱乐部切换时缺乏状态隔离

**解决方案**:
```typescript
// 实现俱乐部特定的缓存键
const getClubSpecificKey = (clubId: string, key: string) => {
  return `pokerpal-${key}-${clubId}`;
};

// 俱乐部切换时清理状态
useEffect(() => {
  if (!selectedClub) return;
  setMessages([]);
  setShowWelcome(true);
  // 加载俱乐部特定的历史记录
}, [selectedClub?.id]);
```

### 阶段四：AI集成演进

**AI服务迁移历程**:
1. **SiliconFlow (DeepSeek-R1)** → 频繁报错
2. **Qwen模型** → 稳定性问题
3. **X.AI (Grok3-mini)** → 最终选择，稳定可靠

**关键配置**:
```javascript
const xaiRequest = {
  model: "grok-3-mini",
  messages: xaiMessages,
  stream: false,
  max_tokens: 8000, // 无限制
  temperature: 0.7,
  top_p: 0.9
};
```

### 阶段五：自动翻译功能实现

**需求**: AI用母语回答后自动翻译成用户界面语言

**实现逻辑**:
```typescript
// 判断是否需要翻译
if (aiNativeLanguage !== locale) {
  // 1. 用AI母语完整回答
  // 2. 添加翻译标题
  // 3. 提供用户语言的完整翻译
}
```

### 阶段六：UI布局重构

**改进内容**:
1. 将俱乐部切换器和语言切换器移至侧边栏
2. 美化登录按钮
3. 改善整体布局响应性

### 阶段七：时区功能添加

**功能描述**: AI能够感知并使用俱乐部所在时区的准确时间

**实现方式**:
```typescript
function getCurrentTimeByTimezone(timezone: string, locale: string): string {
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
  return timeFormatter.format(new Date());
}
```

### 阶段八：内容安全过滤

**添加的限制**:
- 🚫 政治话题
- 🚫 敏感社会议题
- 🚫 投资建议
- 🚫 医疗/法律咨询

**专业服务范围**:
- ✅ 德州扑克规则和策略
- ✅ 俱乐部活动和锦标赛
- ✅ 会员服务和福利
- ✅ 积分系统和奖励机制

### 阶段九：登录功能修复

**问题**:
1. 点击登录直接显示错误
2. 登录页面显示翻译键而非文本
3. 输入正确账号密码无响应

**修复内容**:
1. 修复 `signIn()` 调用，添加正确参数
2. 添加缺失的Auth国际化翻译
3. 增强错误处理和状态反馈

## 测试账号

| 邮箱 | 密码 | 角色 | 权限说明 |
|------|------|------|----------|
| admin@pokerpal.com | password123 | OWNER | 俱乐部拥有者，最高权限 |
| player1@pokerpal.com | password123 | MEMBER | 普通会员 |
| player2@pokerpal.com | password123 | MEMBER | 普通会员 |
| dealer@pokerpal.com | password123 | DEALER | 荷官 |
| cashier@pokerpal.com | password123 | CASHIER | 出纳 |

## 环境变量配置

```env
# 数据库
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# 认证
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AI服务
XAI_API_KEY="xai-..."

# 备用AI服务
SILICONFLOW_API_KEY="sk-..."
```

## 重要文件结构

```
/app
  /[locale]
    /page.tsx              # 主页面（聊天界面）
    /auth
      /signin/page.tsx     # 登录页面
      /error/page.tsx      # 错误页面
  /api
    /chat/route.ts         # AI聊天API
    /auth/[...nextauth]    # NextAuth配置

/lib
  /auth.ts                 # 认证配置
  /defaultClubs.ts         # 俱乐部配置
  /prisma.ts              # 数据库客户端

/components
  /Header.tsx             # 顶部导航
  /Sidebar.tsx            # 侧边栏
  /ClubSwitcher.tsx       # 俱乐部切换器
  /LanguageSwitcher.tsx   # 语言切换器

/messages
  /zh.json                # 简体中文翻译
  /zh-TW.json            # 繁体中文翻译
  /en.json               # 英文翻译
  /ja.json               # 日文翻译
```

## 已解决的关键问题

### 1. 俱乐部切换机制
- **问题**: 切换俱乐部时AI身份混乱
- **解决**: 实现状态隔离和独立的localStorage缓存

### 2. AI稳定性
- **问题**: 复杂问题频繁报错
- **解决**: 迁移到Grok3-mini，增加token限制到8000

### 3. 多语言支持
- **问题**: 翻译键显示、语言不匹配
- **解决**: 完善国际化配置，实现自动翻译功能

### 4. 构建错误
- **问题**: TypeScript类型错误、变量重复定义
- **解决**: 添加明确类型定义，修复命名冲突

## 待优化事项

1. **性能优化**
   - 实现消息虚拟滚动
   - 优化大量历史记录的加载

2. **功能扩展**
   - 添加语音输入支持
   - 实现消息搜索功能
   - 添加导出聊天记录

3. **用户体验**
   - 添加打字指示器
   - 实现消息已读状态
   - 优化移动端体验

## 部署注意事项

### Vercel配置
1. 环境变量必须在Vercel dashboard中配置
2. Build命令: `prisma generate && next build`
3. 函数超时设置: 45秒（chat API）

### 数据库迁移
```bash
# 生成迁移
npx prisma migrate dev

# 部署到生产
npx prisma migrate deploy

# 运行种子数据
npx prisma db seed
```

## 调试技巧

### 常见错误排查
1. **"E.map is not a function"** - 检查数据类型和数组操作
2. **TypeScript错误** - 运行 `npx tsc --noEmit`
3. **国际化键缺失** - 检查所有语言文件的完整性

### 本地测试
```bash
# 开发模式
npm run dev

# 类型检查
npx tsc --noEmit

# 构建测试
npm run build
```

## 项目亮点

1. **多文化AI人设** - 每个俱乐部都有独特的AI个性
2. **完整的国际化** - 支持4种语言的无缝切换
3. **智能时区感知** - AI知道当地时间并相应调整问候
4. **状态隔离设计** - 不同俱乐部的聊天记录完全独立
5. **安全内容过滤** - 自动过滤敏感话题，专注扑克服务

## 总结

PokerPal项目成功实现了一个多语言、多文化的智能扑克俱乐部管理系统。通过不断的迭代和优化，解决了部署、UI/UX、AI集成、国际化等多个技术挑战，最终交付了一个稳定、易用、富有特色的产品。

---

*最后更新: 2025年1月7日*
*开发者: Claude & User*