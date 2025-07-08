"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useSelectedClub } from '@/stores/userStore';
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
  const selectedClub = useSelectedClub();
  const { stats, loading, error } = useDashboardData();
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);

  // 功能模块窗口内容组件
  const getModuleContent = (id: string) => {
    switch (id) {
      case 'dashboard':
        return (
          <div className="text-white p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-6 mb-6">
                <h3 className="text-red-300 font-semibold mb-2">数据加载失败</h3>
                <p className="text-red-200">{error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* 统计卡片 */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">总会员</p>
                        <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
                      </div>
                      <Users className="w-10 h-10 text-purple-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">活跃比赛</p>
                        <p className="text-2xl font-bold text-white">{stats.activeTournaments}</p>
                      </div>
                      <Trophy className="w-10 h-10 text-green-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">今日收入</p>
                        <p className="text-2xl font-bold text-white">¥{stats.todayRevenue.toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-10 h-10 text-yellow-200" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">最近活动</h3>
                  <div className="space-y-3">
                    {stats.recentActivities.length > 0 ? (
                      stats.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <span>{activity.description}</span>
                          <span className="text-sm text-gray-400">
                            {new Date(activity.timestamp).toLocaleString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center py-8">
                        暂无最近活动
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case 'members':
        return (
          <div className="text-white p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">会员管理</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                添加会员
              </button>
            </div>
            {/* 会员列表数据表格 */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">张</div>
                    <div>
                      <div className="font-semibold">张三</div>
                      <div className="text-sm text-gray-400">MEMBER</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">¥1,250</div>
                    <div className="text-sm text-gray-400">活跃</div>
                  </div>
                </div>
                <div className="text-center text-gray-400 py-8">
                  更多会员数据加载中...
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'tournaments':
        return (
          <div className="text-white p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">比赛管理</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                创建比赛
              </button>
            </div>
            {/* 比赛列表 */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="font-semibold">周五夜锦标赛</div>
                    <div className="text-sm text-gray-400">买入: ¥100 | 18:00开始</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">进行中</div>
                    <div className="text-sm text-gray-400">12/20 人</div>
                  </div>
                </div>
                <div className="text-center text-gray-400 py-8">
                  更多比赛数据加载中...
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'finance':
        return (
          <div className="text-white p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">财务管理</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                生成报表
              </button>
            </div>
            {/* 财务数据 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold mb-3">今日收入</h3>
                <div className="text-2xl font-bold text-green-400">¥{stats.todayRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold mb-3">待处理提现</h3>
                <div className="text-2xl font-bold text-yellow-400">¥8,500</div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="text-white p-6">
            <h2 className="text-xl font-semibold mb-6">系统设置</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold mb-2">俱乐部信息</h3>
                <p className="text-gray-400">管理俱乐部基本信息和配置</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold mb-2">AI助手配置</h3>
                <p className="text-gray-400">个性化AI助手设置</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-white p-6">
            <h2 className="text-xl font-semibold mb-4">{id}</h2>
            <div className="text-gray-400">功能模块开发中...</div>
          </div>
        );
    }
  };

  // 打开功能模块窗口
  const openModuleWindow = (id: string, title: string) => {
    // 如果窗口已经打开，聚焦到该窗口
    if (openWindows.find(w => w.id === id)) {
      focusWindow(id);
      return;
    }

    const newWindow: OpenWindow = {
      id,
      title,
      component: getModuleContent(id),
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

    // 打开对应的功能模块窗口
    openModuleWindow(item, titles[item] || item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative flex">
      {/* 侧边栏 */}
      <NewSidebar onItemClick={handleSidebarClick} activeItem={activeWindow || undefined} />

      {/* 主内容区域 - AI聊天界面 */}
      <div className="flex-1 transition-all duration-300 ease-in-out ml-0 lg:ml-20 xl:ml-64 min-h-screen relative flex flex-col">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* AI聊天主界面 */}
        <div className="flex-1 relative z-10 p-3 md:p-6">
          <div className="h-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="h-full flex flex-col">
              {/* 聊天头部 */}
              <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base md:text-lg font-semibold text-white">PokerPal AI 助手</h1>
                    <p className="text-xs md:text-sm text-gray-400">智能俱乐部管理助手</p>
                  </div>
                </div>
                <div className="hidden md:block text-sm text-gray-400">
                  点击左侧功能查看具体数据
                </div>
                <div className="md:hidden text-xs text-gray-400">
                  点击菜单查看功能
                </div>
              </div>

              {/* AI聊天内容区域 */}
              <div className="flex-1 overflow-hidden">
                <AIChat 
                  context="general" 
                  placeholder="您好！我是 PokerPal AI 助手，有什么可以帮您的吗？点击菜单可以查看具体功能数据..." 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 功能模块窗口叠加层 */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {openWindows.map(window => (
            <div key={window.id} className="pointer-events-auto" style={{ zIndex: window.zIndex }}>
              <Window
                id={window.id}
                title={window.title}
                onClose={() => closeWindow(window.id)}
                isActive={activeWindow === window.id}
                onFocus={() => focusWindow(window.id)}
                initialPosition={{ 
                  x: Math.min(window.zIndex < 105 ? 50 : 350, window.zIndex * 20), 
                  y: Math.min(window.zIndex < 105 ? 50 : 120, (window.zIndex - 100) * 25)
                }}
              >
                {window.component}
              </Window>
            </div>
          ))}
        </div>

        {/* 功能提示浮动按钮 */}
        {openWindows.length === 0 && (
          <div className="absolute bottom-6 right-6 z-30">
            <div className="bg-purple-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg animate-pulse">
              <div className="text-sm font-medium mb-1">💡 试试点击左侧菜单</div>
              <div className="text-xs text-purple-200">查看仪表板、会员管理等功能</div>
            </div>
          </div>
        )}

        {/* 快速访问按钮（移动端） */}
        <div className="absolute bottom-6 left-6 z-30 md:hidden">
          <button
            onClick={() => openModuleWindow('dashboard', '仪表板')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            title="打开仪表板"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}