"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
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
  LogOut,
  Menu,
  X,
  Spade
} from 'lucide-react';

interface SidebarProps {
  onItemClick: (item: string) => void;
  activeItem?: string;
}

interface SidebarItem {
  id: string;
  icon: any;
  label: string;
  requiredRoles?: string[];
}

export default function NewSidebar({ onItemClick, activeItem }: SidebarProps) {
  const { data: session } = useSession();
  const t = useTranslations('Dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>('ADMIN'); // 默认为ADMIN以显示所有功能

  // 获取用户角色
  useEffect(() => {
    if (session?.user) {
      // 从 session 或 API 获取用户角色
      setUserRole('ADMIN'); // 临时设为 ADMIN 以显示更多功能
    }
  }, [session]);

  // 定义所有侧边栏项目及其权限要求
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', icon: Home, label: '仪表板' },
    { id: 'members', icon: Users, label: '会员管理', requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'tournaments', icon: Trophy, label: '比赛管理' },
    { id: 'ring-games', icon: Clock, label: '现金游戏' },
    { id: 'finance', icon: DollarSign, label: '财务管理', requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'store', icon: Store, label: '积分商店' },
    { id: 'achievements', icon: Medal, label: '成就系统' },
    { id: 'analytics', icon: BarChart3, label: '数据分析', requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { id: 'settings', icon: Settings, label: '系统设置', requiredRoles: ['OWNER', 'ADMIN'] },
    { id: 'profile', icon: UserCog, label: '个人资料' },
  ];

  // 过滤用户有权限看到的项目
  const visibleItems = sidebarItems.filter(item => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(userRole);
  });

  return (
    <>
      {/* 移动端遮罩 */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`
        fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full lg:w-20' : 'w-64'}
        bg-gradient-to-b from-gray-900 via-purple-900/50 to-gray-900
        border-r border-purple-500/20 backdrop-blur-xl
      `}>
        {/* 顶部Logo和折叠按钮 */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Spade className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">PokerPal</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-white hover:bg-purple-600/20 rounded-lg transition-all"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* 导航项目 */}
        <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent">
          <div className="space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200
                    group relative overflow-hidden
                    ${isActive 
                      ? 'bg-purple-600/20 text-purple-300 shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-purple-600/10'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* 激活指示器 */}
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-purple-500 rounded-r" />
                  )}
                  
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                  
                  {/* 悬停效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部用户信息和登出 */}
        <div className="border-t border-purple-500/20 p-4">
          {!isCollapsed && session?.user && (
            <div className="mb-3 p-3 bg-purple-600/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {session.user.name || session.user.email}
                  </div>
                  <div className="text-purple-300 text-xs">{userRole}</div>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => onItemClick('logout')}
            className={`
              w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all
              text-red-400 hover:text-red-300 hover:bg-red-600/10
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? '登出' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">登出</span>}
          </button>
        </div>
      </div>

      {/* 移动端开启按钮（当侧边栏关闭时） */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-30 lg:hidden p-3 bg-purple-600 text-white rounded-xl shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}