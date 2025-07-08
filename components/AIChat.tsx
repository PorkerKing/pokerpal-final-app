"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatProps {
  context?: string;
  placeholder?: string;
}

export default function AIChat({ context = 'general', placeholder }: AIChatProps) {
  const { data: session } = useSession();
  const t = useTranslations('AIChat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: context === 'general' 
        ? t('welcomeMessage') 
        : t('contextWelcome', { context }),
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-clear guest chat history every 10 minutes
  useEffect(() => {
    const isGuest = !session?.user;
    
    if (isGuest) {
      // Clear any existing timer
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      
      // Set up 10-minute auto-clear timer
      clearTimerRef.current = setTimeout(() => {
        setMessages([
          {
            id: '1',
            content: context === 'general' 
              ? t('welcomeMessage') 
              : t('contextWelcome', { context }),
            role: 'assistant',
            timestamp: new Date()
          }
        ]);
        
        // Show a notification that chat was cleared
        const clearNotification: Message = {
          id: `clear-${Date.now()}`,
          content: t('guestChatCleared', { 
            defaultValue: '💡 Guest chat history has been automatically cleared for privacy.'
          }),
          role: 'assistant',
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, clearNotification]);
        }, 1000);
        
      }, 10 * 60 * 1000); // 10 minutes
    }
    
    // Cleanup function
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, [session, context, t]);

  // Reset timer when new messages are added (for guest users)
  useEffect(() => {
    const isGuest = !session?.user;
    
    if (isGuest && messages.length > 1) {
      // Clear existing timer
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      
      // Set new 10-minute timer
      clearTimerRef.current = setTimeout(() => {
        setMessages([
          {
            id: '1',
            content: context === 'general' 
              ? t('welcomeMessage') 
              : t('contextWelcome', { context }),
            role: 'assistant',
            timestamp: new Date()
          }
        ]);
        
        const clearNotification: Message = {
          id: `clear-${Date.now()}`,
          content: t('guestChatCleared', { 
            defaultValue: '💡 Guest chat history has been automatically cleared for privacy.'
          }),
          role: 'assistant',
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, clearNotification]);
        }, 1000);
        
      }, 10 * 60 * 1000);
    }
  }, [messages.length, session, context, t]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 调用AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context
        }),
      });

      if (!response.ok) {
        throw new Error('AI response failed');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || t('errorResponse'),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t('errorMessage'),
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* 头像 */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-purple-600' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* 消息内容 */}
            <div className={`flex-1 max-w-xs sm:max-w-md ${
              message.role === 'user' ? 'text-right' : ''
            }`}>
              <div className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* 加载指示器 */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-gray-300">{t('thinking')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || t('inputPlaceholder')}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}