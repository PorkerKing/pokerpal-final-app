"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useSelectedClub } from '@/stores/userStore';
import { 
  LayoutDashboard, 
  Trophy, 
  Circle, 
  Users, 
  DollarSign, 
  Settings, 
  Store, 
  Award, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Spade,
  Star,
  Building2,
  Globe
} from 'lucide-react';
import ClubSwitcher from './ClubSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '@/lib/utils';

// 菜单项配置
interface MenuItem {
  key: string;
  label: string;
  icon: any; // 使用any类型以避免Lucide图标的复杂类型
  href: string;
  requiredRoles?: string[]; // 需要的角色权限
}

export default function Sidebar() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const selectedClub = useSelectedClub();
  const [isExpanded, setIsExpanded] = useState(false);

  // 获取用户在当前俱乐部的角色
  const userRole = (selectedClub as any)?.userMembership?.role || 'GUEST';

  // 菜单配置
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']
    },
    {
      key: 'tournaments',
      label: t('tournaments'),
      icon: Trophy,
      href: '/tournaments',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']
    },
    {
      key: 'ring-games',
      label: t('ringGames'),
      icon: Circle,
      href: '/ring-games',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']
    },
    {
      key: 'members',
      label: t('members'),
      icon: Users,
      href: '/members',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
    },
    {
      key: 'finance',
      label: t('finance'),
      icon: DollarSign,
      href: '/finance',
      requiredRoles: ['OWNER', 'ADMIN', 'CASHIER']
    },
    {
      key: 'store',
      label: t('store'),
      icon: Store,
      href: '/store',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']
    },
    {
      key: 'achievements',
      label: t('achievements'),
      icon: Award,
      href: '/achievements',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
    },
    {
      key: 'points',
      label: '积分管理',
      icon: Star,
      href: '/points',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
    },
    {
      key: 'reports',
      label: t('reports'),
      icon: BarChart3,
      href: '/reports',
      requiredRoles: ['OWNER', 'ADMIN']
    },
    {
      key: 'settings',
      label: t('settings'),
      icon: Settings,
      href: '/settings',
      requiredRoles: ['OWNER', 'ADMIN']
    }
  ];

  // 过滤菜单项（根据用户角色）
  const visibleMenuItems = Array.isArray(menuItems) ? menuItems.filter(item => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(userRole);
  }) : [];

  // 检查当前路径是否匹配
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname.includes('/dashboard');
    }
    return pathname.includes(href);
  };

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 h-screen bg-gray-900/95 backdrop-blur-md border-r border-gray-800",
        "flex flex-col transition-all duration-300 ease-in-out z-50",
        isExpanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors">
          <Spade size={32} className="shrink-0" />
          {isExpanded && (
            <span className="font-bold text-lg">PokerPal</span>
          )}
        </Link>
      </div>

      {/* 俱乐部和语言切换区域 */}
      {isExpanded && (
        <div className="px-3 py-4 border-b border-gray-800 space-y-4">
          {/* 俱乐部切换 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Building2 size={16} />
              <span>俱乐部</span>
            </div>
            <ClubSwitcher variant="sidebar" />
          </div>

          {/* 语言切换 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Globe size={16} />
              <span>语言</span>
            </div>
            <LanguageSwitcher variant="sidebar" />
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 py-6">
        <div className="space-y-2 px-3">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-gray-800 group relative",
                  active 
                    ? "bg-purple-600/20 text-purple-300 border border-purple-600/30" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Icon 
                  size={20} 
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-purple-300" : ""
                  )} 
                />
                
                {/* 展开时显示文字 */}
                {isExpanded && (
                  <span className="font-medium truncate">
                    {item.label}
                  </span>
                )}
                
                {/* 收起时显示 tooltip */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 俱乐部信息（底部） */}
      {isExpanded && selectedClub && (
        <div className="border-t border-gray-800 p-4">
          <div className="text-xs text-gray-500 mb-1">当前俱乐部</div>
          <div className="text-sm text-white font-medium truncate">
            {selectedClub.name}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {userRole === 'OWNER' && '所有者'}
            {userRole === 'ADMIN' && '管理员'}
            {userRole === 'MANAGER' && '经理'}
            {userRole === 'MEMBER' && '会员'}
            {userRole === 'DEALER' && '荷官'}
            {userRole === 'CASHIER' && '出纳'}
            {userRole === 'VIP' && 'VIP会员'}
            {userRole === 'GUEST' && '访客'}
          </div>
        </div>
      )}

      {/* 收起/展开按钮 */}
      <div className="border-t border-gray-800 p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title={isExpanded ? t('collapse') : t('expand')}
        >
          {isExpanded ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
      </div>
    </aside>
  );
}