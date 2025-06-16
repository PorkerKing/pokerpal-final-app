"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatInput from '@/components/ChatInput';
import { Bot, User, LoaderCircle } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useUserStore } from '@/stores/userStore';
import { useTranslations, useLocale } from 'next-intl';
import { TournamentCard } from '@/components/TournamentCard';
import { useRouter } from '@/navigation';

// ==================== 视觉升级：扑克牌花色动态背景 ====================
const SpadeShape = () => (
  <div className="absolute top-0 -left-4 w-72 h-72 lg:w-96 lg:h-96 bg-gray-800/50 rounded-full mix-blend-normal filter blur-xl opacity-70 animate-blob">
    <svg viewBox="0 0 512 512" className="w-full h-full text-gray-900 opacity-60">
       <path d="M256 421.6c-17.8 0-35.1-3.6-51.5-10.8L165.2 430c-6.3 3.8-13.8 3.8-20.1 0L39.8 375.1c-15.1-9.1-25.2-25.4-27.4-43.2-2.3-17.8 4.2-35.4 16.5-47.8L220.1 63c2-2 4.6-3 7.2-3s5.2 1 7.2 3l191.2 191.2c12.3 12.3 18.8 30 16.5 47.8-2.3 17.8-12.4 34.1-27.4 43.2l-105.3 54.9c-6.3 3.8-13.8 3.8-20.1 0l-39.3-19.2c-16.4-7.2-33.7-10.8-51.5-10.8z"/>
    </svg>
  </div>
);

const DiamondShape = () => (
  <div className="absolute bottom-0 -right-4 w-72 h-72 lg:w-96 lg:h-96 bg-rose-400/50 rounded-full mix-blend-normal filter blur-xl opacity-70 animate-blob animation-delay-4000">
     <svg viewBox="0 0 512 512" className="w-full h-full text-rose-900 opacity-60 -rotate-45 scale-125">
        <path d="M256 7.4L7.4 256 256 504.6 504.6 256 256 7.4z"/>
    </svg>
  </div>
);
// ======================================================================

interface Message {
  role: 'user' | 'assistant';
  content: string | any[];
  type: 'text' | 'tournaments';
}

export default function HomePage() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const { data: session, status } = useSession();
  const { setSession, clearSession, user, selectedClub, clubId, aiPersonaName, setClub, setClubs } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);
  
  useEffect(() => {
    const syncUser = async () => {
      if (status === 'authenticated' && session) {
        const res = await fetch('/api/user/get-clubs');
        if (res.ok) {
          const data = await res.json();
          setSession(session);
          setClubs(data.clubs);
        } else {
           console.error("Failed to fetch clubs for user.");
           clearSession();
        }
      } else if (status === 'unauthenticated') {
        clearSession();
      }
    };
    if(hasMounted) {
        syncUser();
    }
  }, [status, session, hasMounted, setSession, clearSession]);

  useEffect(() => {
    const initialize = async () => {
      // Only initialize if no club is selected yet
      if (!clubId) {
        try {
          const response = await fetch('/api/user/get-clubs');
          const data = await response.json();
          if (data.clubs && data.clubs.length > 0) {
            setClubs(data.clubs);
            // Set the first club as the default
            const defaultClub = data.clubs[0];
            setClub(defaultClub.id, defaultClub.name, defaultClub.aiPersona.name);
          }
        } catch (error) {
          console.error("Failed to initialize clubs:", error);
        }
      }
      setIsLoading(false);
    };
    initialize();
  }, [clubId, setClub, setClubs]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user || !selectedClub) return;
    const newUserMessage: Message = { role: 'user', content: text, type: 'text' };
    const currentHistory = [...messages, newUserMessage];
    setMessages(currentHistory);
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages, userId: user.id, clubId: selectedClub.id, locale: locale }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.data || data.reply, type: data.type || 'text' };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: '抱歉，连接服务时出现问题，请稍后再试。', type: 'text' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const promptSuggestions = [
    t('promptSuggestion1'),
    t('promptSuggestion2'),
    t('promptSuggestion3'),
    t('promptSuggestion4'),
  ];

  if (!hasMounted || (status === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0F18]">
        <LoaderCircle className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col text-white font-sans overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[#0D0F18]">
        <SpadeShape />
        <DiamondShape />
      </div>
      
      <Header />
      
      <div className="flex-1 flex flex-col pt-20 pb-28 w-full max-w-3xl mx-auto">
         {(status === 'authenticated' && messages.length > 0) ? (
             <div className="space-y-6 overflow-y-auto px-4">
               {messages.map((msg, index) => {
                 if (msg.type === 'tournaments' && Array.isArray(msg.content)) {
                    return (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {msg.content.map((t, i) => (
                         <TournamentCard 
                           key={t.id || i}
                           tournament={t} 
                           onRegister={(name) => handleSendMessage(`帮我报名参加 ${name}`)}
                         />
                       ))}
                     </div>
                   );
                 }
                 return (
                   <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                     {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center"><Bot size={20} /></div>}
                     <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10'}`}>
                       <p className="text-base whitespace-pre-wrap">{msg.content as string}</p>
                     </div>
                     {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center"><User size={20} /></div>}
                   </div>
                 );
               })}
                {isLoading && (
                 <div className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center"><Bot size={20} /></div>
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
            <div className="flex-1 flex items-center justify-center -mt-20 px-4">
              <div className="w-full max-w-2xl text-center z-10">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  {t('welcomeMessage')} 
                  <span className="text-purple-400">{aiPersonaName || '...'}</span>
                </h1>
                <p className="mt-4 text-xl text-gray-400">{t('subheading')}</p>
                <div className="mt-8 space-y-4 text-left">
                   {promptSuggestions.map((text, index) => (
                     <div key={index} onClick={() => status === 'authenticated' ? handleSendMessage(text.replace(/"|"|「|」/g, '')) : signIn()} className="group bg-white/5 border border-transparent rounded-lg p-4 hover:border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                       <p className="text-lg text-gray-300 group-hover:text-white">{text}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
         )}
      </div>

      {status === 'authenticated' &&
        <div className="fixed bottom-0 left-0 right-0 bg-[#0D0F18]/80 backdrop-blur-sm" style={{ marginLeft: '80px' }}>
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      }
    </div>
  );
} 