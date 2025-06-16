"use client";
import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={isLoading ? "思考中..." : "在这里输入您的问题..."}
          disabled={isLoading}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all disabled:opacity-50"
        />
        <button type="submit" disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}; 