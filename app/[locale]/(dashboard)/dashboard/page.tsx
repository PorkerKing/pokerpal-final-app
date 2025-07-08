"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import NewSidebar from '@/components/NewSidebar';
import Window from '@/components/Window';
import AIChat from '@/components/AIChat';
import { 
  Home,
  Users, 
  Trophy, 
  DollarSign, 
  Settings,
  Store,
  BarChart3,
  Medal,
  Clock,
  UserCog,
  Bot
} from 'lucide-react';

interface OpenWindow {
  id: string;
  title: string;
  component: React.ReactNode;
  zIndex: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const t = useTranslations();
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);

  // 窗口内容组件
  const getWindowContent = (id: string) => {
    switch (id) {
      case 'dashboard':
        return (
          <div className="text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* 统计卡片 */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">总会员</p>
                    <p className="text-2xl font-bold text-white">156</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">活跃比赛</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                  <Trophy className="w-10 h-10 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">今日收入</p>
                    <p className="text-2xl font-bold text-white">¥12,450</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-yellow-200" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">最近活动</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span>新会员注册：张三</span>
                  <span className="text-sm text-gray-400">2分钟前</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span>周日锦标赛开始</span>
                  <span className="text-sm text-gray-400">5分钟前</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span>现金游戏桌1满员</span>
                  <span className="text-sm text-gray-400">10分钟前</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'members':
        return (
          <div className="text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">会员管理</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                添加会员
              </button>
            </div>
            <AIChat context="members" placeholder="询问会员相关问题..." />
          </div>
        );
      
      case 'tournaments':
        return (
          <div className="text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">比赛管理</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                创建比赛
              </button>
            </div>
            <AIChat context="tournaments" placeholder="询问比赛相关问题..." />
          </div>
        );
      
      case 'finance':
        return (
          <div className="text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">财务管理</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                生成报表
              </button>
            </div>
            <AIChat context="finance" placeholder="询问财务相关问题..." />
          </div>
        );
      
      case 'settings':
        return (
          <div className="text-white">
            <h2 className="text-xl font-semibold mb-6">系统设置</h2>
            <AIChat context="settings" placeholder="询问设置相关问题..." />
          </div>
        );
      
      case 'ai-assistant':
        return <AIChat context="general" placeholder="您好！我是 PokerPal AI 助手，有什么可以帮您的吗？" />;
      
      default:
        return (
          <div className="text-white">
            <h2 className="text-xl font-semibold mb-4">{id}</h2>
            <AIChat context={id} placeholder={`询问${id}相关问题...`} />
          </div>
        );
    }
  };

  // 打开窗口
  const openWindow = (id: string, title: string) => {
    // 检查窗口是否已经打开
    if (openWindows.find(w => w.id === id)) {
      setActiveWindow(id);
      return;
    }

    const newWindow: OpenWindow = {
      id,
      title,
      component: getWindowContent(id),
      zIndex: nextZIndex,
    };

    setOpenWindows(prev => [...prev, newWindow]);
    setActiveWindow(id);
    setNextZIndex(prev => prev + 1);
  };

  // 关闭窗口
  const closeWindow = (id: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindow === id) {
      const remaining = openWindows.filter(w => w.id !== id);
      setActiveWindow(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  // 激活窗口
  const focusWindow = (id: string) => {
    setActiveWindow(id);
    setOpenWindows(prev => 
      prev.map(w => 
        w.id === id ? { ...w, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex(prev => prev + 1);
  };

  // 侧边栏点击处理
  const handleSidebarClick = (item: string) => {
    if (item === 'logout') {
      signOut();
      return;
    }

    const titles: Record<string, string> = {
      dashboard: '仪表板',
      members: '会员管理',
      tournaments: '比赛管理',
      'ring-games': '现金游戏',
      finance: '财务管理',
      store: '积分商店',
      achievements: '成就系统',
      analytics: '数据分析',
      settings: '系统设置',
      profile: '个人资料',
    };

    openWindow(item, titles[item] || item);
  };

  // 初始化时打开默认窗口
  useEffect(() => {
    openWindow('dashboard', '仪表板');
    openWindow('ai-assistant', 'AI 助手');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative">
      {/* 侧边栏 */}
      <NewSidebar onItemClick={handleSidebarClick} activeItem={activeWindow || undefined} />

      {/* 主内容区域 */}
      <div className="ml-20 lg:ml-64 min-h-screen relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* 窗口容器 */}
        <div className="relative z-10">
          {openWindows.map(window => (
            <div key={window.id} style={{ zIndex: window.zIndex }}>
              <Window
                id={window.id}
                title={window.title}
                onClose={() => closeWindow(window.id)}
                isActive={activeWindow === window.id}
                onFocus={() => focusWindow(window.id)}
                initialPosition={{ 
                  x: 100 + (openWindows.length * 50), 
                  y: 50 + (openWindows.length * 30) 
                }}
              >
                {window.component}
              </Window>
            </div>
          ))}
        </div>

        {/* 快速操作浮动按钮 */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => openWindow('ai-assistant', 'AI 助手')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            title="打开 AI 助手"
          >
            <Bot className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}