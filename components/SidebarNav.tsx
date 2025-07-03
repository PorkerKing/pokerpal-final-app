"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useUserStore } from '@/stores/userStore';
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
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  UserPlus,
  CreditCard,
  Bot,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 导航菜单项类型定义
interface NavigationItem {
  key: string;
  label: string;
  icon: any;
  href?: string;
  requiredRoles?: string[];
  children?: NavigationItem[];
}

export default function SidebarNav() {
  const { data: session } = useSession();
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const { selectedClub } = useUserStore();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['dashboard']));

  // 获取用户在当前俱乐部的角色
  const userRole = (selectedClub as any)?.userMembership?.role || 'GUEST';

  // 导航菜单配置
  const navigationItems: NavigationItem[] = [
    {
      key: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP']
    },
    {
      key: 'tournaments',
      label: t('tournaments.main'),
      icon: Trophy,
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP'],
      children: [
        {
          key: 'tournaments-list',
          label: t('tournaments.list'),
          icon: List,
          href: '/tournaments',
          requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP']
        },
        {
          key: 'tournaments-create',
          label: t('tournaments.create'),
          icon: Plus,
          href: '/tournaments/create',
          requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
        }
      ]
    },
    {
      key: 'ring-games',
      label: t('ringGames.main'),
      icon: Circle,
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP', 'DEALER'],
      children: [
        {
          key: 'ring-games-list',
          label: t('ringGames.list'),
          icon: List,
          href: '/ring-games',
          requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP', 'DEALER']
        },
        {
          key: 'ring-games-create',
          label: t('ringGames.create'),
          icon: Plus,
          href: '/ring-games/create',
          requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
        }
      ]
    },
    {
      key: 'members',
      label: t('members.main'),
      icon: Users,
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
      children: [
        {
          key: 'members-list',
          label: t('members.list'),
          icon: List,
          href: '/members',
          requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
        },
        {
          key: 'members-invite',
          label: t('members.invite'),
          icon: UserPlus,
          href: '/members/invite',
          requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
        }
      ]
    },
    {
      key: 'finance',
      label: t('finance.main'),
      icon: DollarSign,
      requiredRoles: ['OWNER', 'ADMIN', 'CASHIER'],
      children: [
        {
          key: 'finance-overview',
          label: t('finance.overview'),
          icon: BarChart3,
          href: '/finance',
          requiredRoles: ['OWNER', 'ADMIN', 'CASHIER']
        },
        {
          key: 'finance-transactions',
          label: t('finance.transactions'),
          icon: CreditCard,
          href: '/finance/transactions',
          requiredRoles: ['OWNER', 'ADMIN', 'CASHIER']
        }
      ]
    },
    {
      key: 'achievements',
      label: t('achievements'),
      icon: Award,
      href: '/achievements',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
    },
    {
      key: 'store',
      label: t('store'),
      icon: Store,
      href: '/store',
      requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP']
    },
    {
      key: 'settings',
      label: t('settings.main'),
      icon: Settings,
      requiredRoles: ['OWNER', 'ADMIN'],
      children: [
        {
          key: 'settings-club',
          label: t('settings.club'),
          icon: Settings,
          href: '/settings',
          requiredRoles: ['OWNER', 'ADMIN']
        },
        {
          key: 'settings-ai',
          label: t('settings.ai'),
          icon: Bot,
          href: '/settings/ai',
          requiredRoles: ['OWNER', 'ADMIN']
        }
      ]
    }
  ];

  // 过滤菜单项（根据用户角色）
  const filterMenuItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      if (!item.requiredRoles) return true;
      const hasPermission = item.requiredRoles.includes(userRole);
      
      if (hasPermission && item.children) {
        item.children = filterMenuItems(item.children);
      }
      
      return hasPermission;
    });
  };

  const visibleMenuItems = filterMenuItems(navigationItems);

  // 切换菜单展开状态
  const toggleMenu = (key: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedMenus(newExpanded);
  };

  // 检查当前路径是否匹配
  const isActive = (href?: string, key?: string) => {
    if (!href) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // 检查父菜单是否有活跃的子项
  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some(child => isActive(child.href));
  };

  // 自动展开包含当前页面的菜单
  useEffect(() => {
    const newExpanded = new Set(expandedMenus);
    visibleMenuItems.forEach(item => {
      if (item.children && hasActiveChild(item.children)) {
        newExpanded.add(item.key);
      }
    });
    setExpandedMenus(newExpanded);
  }, [pathname]);

  const renderMenuItem = (item: NavigationItem, level = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.key);
    const itemIsActive = isActive(item.href, item.key);
    const childIsActive = hasActiveChild(item.children);

    return (
      <div key={item.key}>
        {/* 菜单项 */}
        <div
          className={cn(
            "group flex items-center rounded-md text-sm font-medium transition-colors",
            level === 0 ? "px-3 py-2 mb-1" : "px-3 py-2 ml-6",
            itemIsActive || childIsActive
              ? "bg-purple-100 text-purple-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          {item.href ? (
            <Link href={item.href} className="flex items-center flex-1">
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  itemIsActive || childIsActive ? "text-purple-500" : "text-gray-400"
                )}
              />
              {item.label}
            </Link>
          ) : (
            <button
              onClick={() => hasChildren && toggleMenu(item.key)}
              className="flex items-center flex-1 text-left"
            >
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  childIsActive ? "text-purple-500" : "text-gray-400"
                )}
              />
              {item.label}
            </button>
          )}
          
          {hasChildren && (
            <button
              onClick={() => toggleMenu(item.key)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* 子菜单 */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!session) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:block hidden">
      {/* Logo 区域 */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">PokerPal</span>
        </Link>
      </div>

      {/* 俱乐部信息 */}
      {selectedClub && (
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-500">{t('currentClub')}</div>
          <div className="font-medium text-gray-900 truncate">{selectedClub.name}</div>
          <div className="text-xs text-gray-400">
            {userRole === 'OWNER' && t('roles.owner')}
            {userRole === 'ADMIN' && t('roles.admin')}
            {userRole === 'MANAGER' && t('roles.manager')}
            {userRole === 'MEMBER' && t('roles.member')}
            {userRole === 'DEALER' && t('roles.dealer')}
            {userRole === 'CASHIER' && t('roles.cashier')}
            {userRole === 'VIP' && t('roles.vip')}
            {userRole === 'GUEST' && t('roles.guest')}
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {visibleMenuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* 底部用户信息 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">
                {session.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{session.user?.name}</div>
            <div className="text-xs text-gray-500">{session.user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}