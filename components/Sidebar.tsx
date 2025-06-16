"use client";
import { Home, Users, Trophy, Store, Bot, Settings } from 'lucide-react';
export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-20 bg-black/30 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-6 z-50">
      <div className="text-purple-400 mb-12">
        <a href="/" aria-label="Home"><Bot size={32} /></a>
      </div>
      <nav className="flex flex-col items-center space-y-8">
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Dashboard"><Home size={24} /></a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Members"><Users size={24} /></a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Tournaments"><Trophy size={24} /></a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Store"><Store size={24} /></a>
      </nav>
      <div className="mt-auto">
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Settings"><Settings size={24} /></a>
      </div>
    </aside>
  );
}; 