"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import ChatInput from '@/components/ChatInput';
import { Spade, User, LoaderCircle, LogIn, Diamond } from 'lucide-react';
import { PokerBackground } from '@/components/PokerBackground';
import { useSession, signIn } from 'next-auth/react';
import { useUserStore } from '@/stores/userStore';
import { useTranslations, useLocale } from 'next-intl';
import { TournamentCard } from '@/components/TournamentCard';
import { useRouter } from '@/navigation';
import { getDefaultClubByLocale, getGuestSuggestions, getPersonalizedWelcome } from '@/lib/defaultClubs';

// ==================== 组件已移至独立文件 ====================

interface Message {
  role: 'user' | 'assistant';
  content: string | any[];
  type: 'text' | 'tournaments' | 'auth-required';
}

// 访客引导消息组件
const GuestPrompt = ({ onSignIn }: { onSignIn: () => void }) => {
  const t = useTranslations('HomePage');
  
  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 space-y-3">
      <p className="text-gray-300">
        此功能需要登录才能使用。登录后您可以：
      </p>
      <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
        <li>查看个人战绩和统计数据</li>
        <li>报名参加锦标赛</li>
        <li>管理俱乐部余额</li>
        <li>获得专属会员服务</li>
      </ul>
      <button
        onClick={onSignIn}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <LogIn size={16} />
        立即登录
      </button>
    </div>
  );
};

const SpadeShape = () => (
  <Spade
    className="absolute h-12 w-12 text-zinc-500/20"
    style={{ shapeRendering: "crispEdges" }} 
  />
);

const DiamondShape = () => (
  <Diamond
    className="absolute h-12 w-12 text-red-500/20"
    style={{ shapeRendering: "crispEdges" }}
  />
);

export default function HomePage() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const { data: session, status } = useSession();
  const { selectedClub, setClubs, setSelectedClub } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // 加载保存的对话记录 - 只在访客模式下加载
  useEffect(() => {
    if (!session?.user) {
      const savedMessages = localStorage.getItem('pokerpal-chat-history');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          // 只加载最近的几条消息，避免首页被聊天记录占满
          if (parsed.length > 6) {
            setMessages(parsed.slice(-6));
            setShowWelcome(false);
          } else if (parsed.length > 0) {
            setMessages(parsed);
            setShowWelcome(false);
          }
        } catch (error) {
          console.error('Failed to parse saved messages:', error);
        }
      }
    }
  }, [session?.user]);

  // 保存对话记录
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('pokerpal-chat-history', JSON.stringify(messages));
    }
  }, [messages]);
  const router = useRouter();

  // 初始化俱乐部列表和重定向逻辑
  useEffect(() => {
    const initializeClubs = async () => {
      if (!selectedClub) {
        if (session) {
          // 已登录用户：获取真实俱乐部数据
          try {
            const response = await fetch('/api/user/get-clubs');
            if (response.ok) {
              const data = await response.json();
              if (data.clubs && data.clubs.length > 0) {
                setClubs(data.clubs);
                setSelectedClub(data.clubs[0]);
                // 如果用户已登录且有俱乐部，重定向到仪表盘
                router.push('/dashboard');
              } else {
                // 如果没有俱乐部，创建一个默认的
                const defaultClubConfig = getDefaultClubByLocale(locale);
                const defaultClub = {
                  ...defaultClubConfig,
                  id: 'demo-' + defaultClubConfig.id
                } as any;
                setClubs([defaultClub]);
                setSelectedClub(defaultClub);
              }
            } else {
              console.error("Failed to fetch clubs:", response.status);
              // 数据库连接失败时的降级处理
              const fallbackClubConfig = getDefaultClubByLocale(locale);
              const fallbackClub = {
                ...fallbackClubConfig,
                id: 'fallback-' + fallbackClubConfig.id,
                description: '数据库连接中，请稍后再试'
              } as any;
              setClubs([fallbackClub]);
              setSelectedClub(fallbackClub);
            }
          } catch (error) {
            console.error("Failed to initialize clubs:", error);
            // 网络错误时的降级处理
            const errorClubConfig = getDefaultClubByLocale(locale);
            const fallbackClub = {
              ...errorClubConfig,
              id: 'error-' + errorClubConfig.id,
              description: '网络连接中，请稍后再试'
            } as any;
            setClubs([fallbackClub]);
            setSelectedClub(fallbackClub);
          }
        } else {
          // 未登录用户：提供所有俱乐部选项用于访客模式切换
          const allGuestClubs = ['zh', 'zh-TW', 'en', 'ja'].map(localeKey => {
            const clubConfig = getDefaultClubByLocale(localeKey);
            return {
              ...clubConfig,
              id: 'guest-' + clubConfig.id
            } as any;
          });
          
          // 设置当前语言对应的俱乐部为默认选择
          const currentClub = allGuestClubs.find(club => 
            club.id === 'guest-' + getDefaultClubByLocale(locale).id
          ) || allGuestClubs[0];
          
          setClubs(allGuestClubs);
          setSelectedClub(currentClub);
        }
      }
    };
    
    if (status !== 'loading') {
      initializeClubs();
    }
  }, [session, status, selectedClub, setClubs, setSelectedClub, router]);

  // 处理登录
  const handleSignIn = useCallback(() => {
    signIn();
  }, []);

  // 清除聊天记录
  const clearChatHistory = () => {
    setMessages([]);
    setShowWelcome(true);
    localStorage.removeItem('pokerpal-chat-history');
  };

  // 发送消息
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedClub) return;

    const newUserMessage: Message = { 
      role: 'user', 
      content: text, 
      type: 'text' 
    };
    setMessages(prev => [...prev, newUserMessage]);
    setShowWelcome(false);
    setIsLoading(true);
    
    try {
      const payload = {
        message: text,
        history: Array.isArray(messages) ? messages.map(m => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
        })) : [],
        clubId: selectedClub.id,
        locale: locale,
        userId: (session?.user as any)?.id || null,
        conversationId: 'guest-chat-' + Date.now(), // 为访客模式生成唯一会话ID
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 检查是否需要认证
      if (data.authRequired) {
        const authMessage: Message = { 
          role: 'assistant', 
          content: '', 
          type: 'auth-required' 
        };
        setMessages(prev => [...prev, authMessage]);
      } else {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.data || data.reply || data.message, 
          type: data.type || 'text' 
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // 多语言错误提示
      const errorMessages = {
        'zh': `😔 抱歉，我暂时无法回复您。这可能是因为：\n\n• 🔧 服务正在升级维护\n• 🌐 网络连接暂时不稳定\n• ⚡ 服务器繁忙，请稍后再试\n\n感谢您的耐心，我会尽快恢复正常！`,
        'zh-TW': `😔 抱歉，我暫時無法回覆您。這可能是因為：\n\n• 🔧 服務正在升級維護\n• 🌐 網路連接暫時不穩定\n• ⚡ 伺服器繁忙，請稍後再試\n\n感謝您的耐心，我會盡快恢復正常！`,
        'en': `😔 Sorry, I'm temporarily unable to respond. This might be due to:\n\n• 🔧 Service maintenance in progress\n• 🌐 Network connectivity issues\n• ⚡ Server is busy, please try again later\n\nThank you for your patience. I'll be back soon!`,
        'ja': `😔 申し訳ございませんが、一時的に返信できません。以下の理由が考えられます：\n\n• 🔧 サービスメンテナンス中\n• 🌐 ネットワーク接続の問題\n• ⚡ サーバーが混雑中、しばらくお待ちください\n\nご理解をお願いいたします。すぐに復旧いたします！`
      };
      
      const errorMessage: Message = { 
        role: 'assistant', 
        content: errorMessages[locale as keyof typeof errorMessages] || errorMessages['zh'], 
        type: 'text' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 根据用户状态和角色提供个性化建议
  const getPromptSuggestions = () => {
    try {
      if (!session?.user) {
        // 访客建议
        const guestSuggestions = t('suggestions.guest');
        return Array.isArray(guestSuggestions) ? guestSuggestions : [];
      }

      // 根据用户角色提供不同建议
      const userRole = (selectedClub as any)?.userMembership?.role;
      
      let suggestions;
      if (userRole === 'OWNER') {
        suggestions = t('suggestions.owner');
      } else if (userRole === 'ADMIN') {
        suggestions = t('suggestions.admin');
      } else if (userRole === 'MANAGER') {
        suggestions = t('suggestions.manager');
      } else if (userRole === 'DEALER') {
        suggestions = t('suggestions.dealer');
      } else if (userRole === 'CASHIER') {
        suggestions = t('suggestions.cashier');
      } else {
        // 普通会员和VIP
        suggestions = t('suggestions.member');
      }
      
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error('Error getting prompt suggestions:', error);
      // 返回默认建议
      return [
        "这周有什么精彩的锦标赛呀？",
        "能跟我介绍一下会员等级制度吗？",
        "圆桌游戏的盲注是怎么设置的？",
        "俱乐部都有哪些贴心服务呢？"
      ];
    }
  };

  const promptSuggestions = getPromptSuggestions() || [];

  // 加载中状态 - 只在NextAuth session真正加载时显示
  if (status === 'loading' || !selectedClub) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0F18]">
        <LoaderCircle className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col text-white font-sans overflow-hidden">
      {/* 动态扑克背景 */}
      <PokerBackground />
      
      <Header />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col pt-20 pb-28 w-full max-w-3xl mx-auto">
         {!showWelcome && messages.length > 0 ? (
           <>
             {/* 固定的顶部控制栏 */}
             <div className="fixed top-20 right-4 z-20 flex gap-2">
               <button
                 onClick={() => setShowWelcome(true)}
                 className="bg-purple-600/80 hover:bg-purple-700/80 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm transition-colors"
               >
                 首页
               </button>
               <button
                 onClick={clearChatHistory}
                 className="bg-red-600/80 hover:bg-red-700/80 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm transition-colors"
               >
                 清除
               </button>
             </div>
             <div className="space-y-6 overflow-y-auto px-4 pt-4">
             {Array.isArray(messages) && messages.map((msg, index) => {
               // 锦标赛卡片展示
               if (msg.type === 'tournaments' && Array.isArray(msg.content)) {
                 return (
                   <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {msg.content.map((t, i) => (
                       <TournamentCard 
                         key={t.id || i}
                         tournament={t} 
                         onRegister={(name) => {
                           if (session?.user) {
                             handleSendMessage(`帮我报名参加 ${name}`);
                           } else {
                             handleSignIn();
                           }
                         }}
                       />
                     ))}
                   </div>
                 );
               }
               
               // 需要认证提示
               if (msg.type === 'auth-required') {
                 return (
                   <div key={index} className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center">
                       <Spade size={20} />
                     </div>
                     <div className="flex-1">
                       <GuestPrompt onSignIn={handleSignIn} />
                     </div>
                   </div>
                 );
               }
               
               // 普通文本消息
               return (
                 <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                   {msg.role === 'assistant' && (
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-lg">
                       {selectedClub?.id?.includes('shanghai') ? '👩‍💼' : 
                        selectedClub?.id?.includes('taipei') ? '👩‍🦰' : 
                        selectedClub?.id?.includes('osaka') ? '👘' :
                        selectedClub?.id?.includes('kuala-lumpur') ? '👩‍🏫' : '🤖'}
                     </div>
                   )}
                   <div className={`max-w-lg p-4 rounded-2xl ${msg.role === 'user' ? 'bg-black/60 backdrop-blur-sm border border-gray-700' : 'bg-black/60 backdrop-blur-sm border border-gray-700'}`}>
                     <p className={`text-base whitespace-pre-wrap ${msg.role === 'user' ? 'text-blue-100' : 'text-blue-100'}`}>{msg.content as string}</p>
                   </div>
                   {msg.role === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-lg">
                       ♠️
                     </div>
                   )}
                 </div>
               );
             })}
             
             {/* 加载指示器 */}
             {isLoading && (
               <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center">
                   <Spade size={20} />
                 </div>
                 <div className="max-w-lg p-4 rounded-2xl bg-black/60 backdrop-blur-sm border border-gray-700">
                   <div className="flex items-center space-x-1">
                     <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-0"></span>
                     <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></span>
                     <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></span>
                   </div>
                 </div>
               </div>
             )}
           </div>
           </>
         ) : (
           /* 欢迎界面 */
           <div className="flex-1 flex items-center justify-center -mt-20 px-4">
             <div className="w-full max-w-2xl text-center z-10">
               <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                 {getPersonalizedWelcome(locale).title
                   .replace('{aiName}', (selectedClub?.aiPersona as any)?.fullName || selectedClub?.aiPersona?.name || 'AI助手')
                   .replace('{aiAvatar}', (selectedClub?.aiPersona as any)?.avatar || '🤖')}
               </h1>
               <p className="mt-4 text-xl text-gray-400">
                 {getPersonalizedWelcome(locale).subtitle}
               </p>
               
               {/* 访客提示 */}
               {!session?.user && (
                 <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                   <p className="text-gray-300 text-sm">
                     {getPersonalizedWelcome(locale).loginPrompt}
                   </p>
                 </div>
               )}
               
               {/* 快捷提示 */}
               <div className="mt-8 space-y-4 text-left">
                 {Array.isArray(promptSuggestions) && promptSuggestions.length > 0 && promptSuggestions.map((text: string, index: number) => (
                   <div 
                     key={index} 
                     onClick={() => handleSendMessage(text.replace(/"/g, ''))} 
                     className="group bg-white/5 border border-transparent rounded-lg p-4 hover:border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                   >
                     <p className="text-lg text-gray-300 group-hover:text-white">{text}</p>
                   </div>
                 ))}
               </div>
               
               {/* 清除聊天记录按钮 */}
               {messages.length > 0 && (
                 <div className="mt-6 text-center">
                   <button
                     onClick={clearChatHistory}
                     className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                   >
                     清除聊天记录
                   </button>
                 </div>
               )}
             </div>
           </div>
         )}
      </div>

      {/* 输入框 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0F18]/80 backdrop-blur-sm" style={{ marginLeft: '80px' }}>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}