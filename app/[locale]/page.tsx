"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatInput from '@/components/ChatInput';
import { Bot, User, LoaderCircle, Diamond, Spade } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useUserStore } from '@/stores/userStore';
import { useTranslations, useLocale } from 'next-intl';
import { TournamentCard } from '@/components/TournamentCard';
import { useRouter } from '@/navigation';

// ==================== 视觉升级：扑克牌花色动态背景 ====================
const SpadeShape = () => (
  <Spade
    className="absolute h-12 w-12 text-zinc-500/30"
    style={{ shapeRendering: "crispEdges" }} 
  />
);

const DiamondShape = () => (
  <Diamond
    className="absolute h-12 w-12 text-red-500/30"
    style={{ shapeRendering: "crispEdges" }}
  />
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
  const { selectedClub, setClubs, setSelectedClub } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeClubs = async () => {
      if (!selectedClub) {
        try {
          const response = await fetch('/api/user/get-clubs');
          const data = await response.json();
          if (data.clubs && data.clubs.length > 0) {
            setClubs(data.clubs);
            setSelectedClub(data.clubs[0]);
          }
        } catch (error) {
          console.error("Failed to initialize clubs:", error);
        }
      }
    };
    initializeClubs();
  }, [selectedClub, setClubs, setSelectedClub]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedClub) return;

    const newUserMessage: Message = { role: 'user', content: text, type: 'text' };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    try {
      const payload = {
        message: text,
        history: messages,
        clubId: selectedClub.id,
        locale: locale,
        userId: session?.user?.id || null, 
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  if (status === 'loading' && !selectedClub) {
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
         {(messages.length > 0) ? (
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
                  <span className="text-purple-400">{selectedClub?.aiPersona?.name || '...'}</span>
                </h1>
                <p className="mt-4 text-xl text-gray-400">{t('subheading')}</p>
                <div className="mt-8 space-y-4 text-left">
                   {promptSuggestions.map((text, index) => (
                     <div key={index} onClick={() => handleSendMessage(text.replace(/"/g, ''))} className="group bg-white/5 border border-transparent rounded-lg p-4 hover:border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                       <p className="text-lg text-gray-300 group-hover:text-white">{text}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
         )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0F18]/80 backdrop-blur-sm" style={{ marginLeft: '80px' }}>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
} 