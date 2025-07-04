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
  const router = useRouter();

  // 初始化俱乐部列表和重定向逻辑
  useEffect(() => {
    const initializeClubs = async () => {
      if (!selectedClub && session) {
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
              // 如果没有俱乐部，创建一个默认的用于访客模式
              const defaultClub = {
                id: 'demo',
                name: '演示俱乐部',
                description: '这是一个演示俱乐部',
                aiPersona: { name: 'AI助手' }
              } as any;
              setClubs([defaultClub]);
              setSelectedClub(defaultClub);
            }
          } else {
            console.error("Failed to fetch clubs:", response.status);
            // 数据库连接失败时的降级处理
            const fallbackClub = {
              id: 'fallback',
              name: '演示俱乐部',
              description: '数据库连接中，请稍后再试',
              aiPersona: { name: 'AI助手' }
            } as any;
            setClubs([fallbackClub]);
            setSelectedClub(fallbackClub);
          }
        } catch (error) {
          console.error("Failed to initialize clubs:", error);
          // 网络错误时的降级处理
          const fallbackClub = {
            id: 'error',
            name: '演示俱乐部',
            description: '网络连接中，请稍后再试',
            aiPersona: { name: 'AI助手' }
          } as any;
          setClubs([fallbackClub]);
          setSelectedClub(fallbackClub);
        }
      } else if (session && selectedClub) {
        // 如果已经有选中的俱乐部，直接重定向到仪表盘
        router.push('/dashboard');
      } else if (!session) {
        // 未登录用户也提供一个默认俱乐部用于访客模式
        const guestClub = {
          id: 'guest',
          name: '访客模式',
          description: '欢迎体验PokerPal',
          aiPersona: { name: 'AI助手' }
        } as any;
        setClubs([guestClub]);
        setSelectedClub(guestClub);
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

  // 发送消息
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedClub) return;

    const newUserMessage: Message = { 
      role: 'user', 
      content: text, 
      type: 'text' 
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    try {
      const payload = {
        message: text,
        history: messages.map(m => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
        })),
        clubId: selectedClub.id,
        locale: locale,
        userId: (session?.user as any)?.id || null,
      };

      const response = await fetch('/api/chat-simple', {
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
      const errorMessage: Message = { 
        role: 'assistant', 
        content: '抱歉，连接服务时出现问题，请稍后再试。', 
        type: 'text' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 根据用户状态和角色提供个性化建议
  const getPromptSuggestions = () => {
    if (!session?.user) {
      // 访客建议
      return t.raw('HomePage.suggestions.guest');
    }

    // 根据用户角色提供不同建议
    const userRole = (selectedClub as any)?.userMembership?.role;
    
    if (userRole === 'OWNER') {
      return t.raw('HomePage.suggestions.owner');
    } else if (userRole === 'ADMIN') {
      return t.raw('HomePage.suggestions.admin');
    } else if (userRole === 'MANAGER') {
      return t.raw('HomePage.suggestions.manager');
    } else if (userRole === 'DEALER') {
      return t.raw('HomePage.suggestions.dealer');
    } else if (userRole === 'CASHIER') {
      return t.raw('HomePage.suggestions.cashier');
    } else {
      // 普通会员和VIP
      return t.raw('HomePage.suggestions.member');
    }
  };

  const promptSuggestions = getPromptSuggestions();

  // 加载中状态 - 只在NextAuth session真正加载时显示
  if (status === 'loading') {
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
         {messages.length > 0 ? (
           <div className="space-y-6 overflow-y-auto px-4">
             {messages.map((msg, index) => {
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
                     <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center">
                       <Spade size={20} />
                     </div>
                   )}
                   <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10'}`}>
                     <p className="text-base whitespace-pre-wrap">{msg.content as string}</p>
                   </div>
                   {msg.role === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
                       <User size={20} />
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
                 <div className="max-w-lg p-3 rounded-lg bg-white/10">
                   <div className="flex items-center space-x-1">
                     <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-0"></span>
                     <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></span>
                     <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></span>
                   </div>
                 </div>
               </div>
             )}
           </div>
         ) : (
           /* 欢迎界面 */
           <div className="flex-1 flex items-center justify-center -mt-20 px-4">
             <div className="w-full max-w-2xl text-center z-10">
               <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                 {t('HomePage.welcomeMessage')} 
                 <span className="text-purple-400">👩‍💼 {selectedClub?.aiPersona?.name || 'AI助手'}</span>
               </h1>
               <p className="mt-4 text-xl text-gray-400">
                 {session?.user ? t('HomePage.subheading') : t('HomePage.guestSubheading')}
               </p>
               
               {/* 访客提示 */}
               {!session?.user && (
                 <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                   <p className="text-yellow-400 text-sm">
                     {t('HomePage.guestLoginHint')}
                   </p>
                 </div>
               )}
               
               {/* 快捷提示 */}
               <div className="mt-8 space-y-4 text-left">
                 {promptSuggestions.map((text: string, index: number) => (
                   <div 
                     key={index} 
                     onClick={() => handleSendMessage(text.replace(/"/g, ''))} 
                     className="group bg-white/5 border border-transparent rounded-lg p-4 hover:border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                   >
                     <p className="text-lg text-gray-300 group-hover:text-white">{text}</p>
                   </div>
                 ))}
               </div>
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