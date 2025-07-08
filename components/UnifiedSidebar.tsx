"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  ChevronLeft,
  Plus,
  List,
  UserPlus,
  CreditCard,
  Bot,
  Spade,
  Star,
  Building2,
  Globe,
  Menu,
  X,
  LogOut,
  User,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Z_INDEX, Z_INDEX_CLASSES } from '@/lib/z-index';
import ClubSwitcher from './ClubSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

// 导航菜单项类型定义
interface NavigationItem {
  key: string;
  label: string;
  icon: any;
  href?: string;
  requiredRoles?: string[];
  children?: NavigationItem[];
  badge?: string | number;
}

interface UnifiedSidebarProps {
  className?: string;
  onItemClick?: (item: string) => void;
}

export default function UnifiedSidebar({ className, onItemClick }: UnifiedSidebarProps) {
  const { data: session } = useSession();
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const { selectedClub } = useUserStore();
  
  // 状态管理
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['dashboard']));

  // 获取用户在当前俱乐部的角色
  const userRole = (selectedClub as any)?.userMembership?.role || (session ? 'MEMBER' : 'GUEST');

  // 导航菜单配置
  const navigationItems: NavigationItem[] = [
    {
      key: 'dashboard',
      label: session ? t('dashboard') : '首页',
      icon: LayoutDashboard,
      href: session ? '/dashboard' : '/',
      requiredRoles: session ? ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP'] : undefined
    },
    
    // 访客可见菜单
    ...(!session ? [
      {
        key: 'about',
        label: '关于我们',
        icon: Building2,
        href: '/about'
      },
      {
        key: 'features',
        label: '功能特色',
        icon: Star,
        href: '/features'
      }
    ] : []),

    // 登录用户菜单
    ...(session ? [
      {
        key: 'tournaments',
        label: t('tournaments.main') || '锦标赛',
        icon: Trophy,
        requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP'],
        children: [
          {
            key: 'tournaments-list',
            label: t('tournaments.list') || '赛事列表',
            icon: List,
            href: '/tournaments',
            requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP']
          },
          {
            key: 'tournaments-create',
            label: t('tournaments.create') || '创建赛事',
            icon: Plus,
            href: '/tournaments/create',
            requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
          }
        ]
      },
      {
        key: 'ring-games',
        label: t('ringGames.main') || '现金游戏',
        icon: Circle,
        requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP', 'DEALER'],
        children: [
          {
            key: 'ring-games-list',
            label: t('ringGames.list') || '牌桌列表',
            icon: List,
            href: '/ring-games',
            requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP', 'DEALER']
          },
          {
            key: 'ring-games-create',
            label: t('ringGames.create') || '创建牌桌',
            icon: Plus,
            href: '/ring-games/create',
            requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
          }
        ]
      },
      {
        key: 'members',
        label: t('members.main') || '会员管理',
        icon: Users,
        requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
        children: [
          {
            key: 'members-list',
            label: t('members.list') || '会员列表',
            icon: List,
            href: '/members',
            requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
          },
          {
            key: 'members-invite',
            label: t('members.invite') || '邀请会员',
            icon: UserPlus,
            href: '/members/invite',
            requiredRoles: ['OWNER', 'ADMIN', 'MANAGER']
          }
        ]
      },
      {
        key: 'finance',
        label: t('finance.main') || '财务管理',
        icon: DollarSign,
        requiredRoles: ['OWNER', 'ADMIN', 'RECEPTIONIST'],
        children: [
          {
            key: 'finance-overview',
            label: t('finance.overview') || '财务概览',
            icon: BarChart3,
            href: '/finance',
            requiredRoles: ['OWNER', 'ADMIN', 'RECEPTIONIST']
          },
          {
            key: 'finance-transactions',
            label: t('finance.transactions') || '交易记录',
            icon: CreditCard,
            href: '/finance/transactions',
            requiredRoles: ['OWNER', 'ADMIN', 'RECEPTIONIST']
          }
        ]
      },
      {
        key: 'store',
        label: t('store') || '积分商店',
        icon: Store,
        href: '/store',
        requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP']
      },
      {
        key: 'achievements',
        label: t('achievements') || '成就系统',
        icon: Award,
        href: '/achievements',
        requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP']
      },
      {
        key: 'points',
        label: '积分管理',
        icon: Star,
        href: '/points',
        requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIP']
      },
      {
        key: 'reports',
        label: t('reports') || '数据报表',
        icon: BarChart3,
        href: '/reports',
        requiredRoles: ['OWNER', 'ADMIN']
      },
      {
        key: 'settings',
        label: t('settings.main') || '系统设置',
        icon: Settings,
        requiredRoles: ['OWNER', 'ADMIN'],
        children: [
          {
            key: 'settings-club',
            label: t('settings.club') || '俱乐部设置',
            icon: Settings,
            href: '/settings',
            requiredRoles: ['OWNER', 'ADMIN']
          },
          {
            key: 'settings-ai',
            label: t('settings.ai') || 'AI助手设置',
            icon: Bot,
            href: '/settings/ai',
            requiredRoles: ['OWNER', 'ADMIN']
          }
        ]
      }
    ] : [])
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
    if (href === '/') {
      return pathname === '/' && !session;
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

  // 处理项目点击
  const handleItemClick = (key: string, href?: string) => {
    if (key === 'logout') {
      signOut({ callbackUrl: '/' });
      return;
    }
    
    onItemClick?.(key);
    
    // 移动端点击后关闭菜单
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  // 渲染菜单项
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
            "group flex items-center rounded-lg transition-all duration-200",
            level === 0 ? "mx-2 mb-1" : "mx-2 ml-6 mb-1",
            itemIsActive || childIsActive
              ? "bg-purple-600/20 text-purple-300 border border-purple-600/30"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
        >
          {item.href ? (
            <Link 
              href={item.href} 
              className="flex items-center flex-1 px-3 py-2.5"
              onClick={() => handleItemClick(item.key, item.href)}
            >
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  itemIsActive || childIsActive ? "text-purple-400" : ""
                )}
              />
              {(isExpanded || isMobileOpen) && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {item.badge && (
                <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={() => {
                if (hasChildren) toggleMenu(item.key);
                handleItemClick(item.key);
              }}
              className="flex items-center flex-1 px-3 py-2.5 text-left w-full"
            >
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  childIsActive ? "text-purple-400" : ""
                )}
              />
              {(isExpanded || isMobileOpen) && (
                <span className="font-medium truncate flex-1">{item.label}</span>
              )}
              {item.badge && (
                <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                  {item.badge}
                </span>
              )}
            </button>
          )}
          
          {hasChildren && (isExpanded || isMobileOpen) && (
            <button
              onClick={() => toggleMenu(item.key)}
              className="p-2 hover:bg-gray-700 rounded"
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
        {hasChildren && isExpanded && (isExpanded || isMobileOpen) && (
          <div className="space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden"
          style={{ zIndex: Z_INDEX.BACKDROP }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={cn(
          "fixed top-4 left-4 lg:hidden p-3 bg-gray-900/90 backdrop-blur-sm",
          "border border-gray-700 text-white rounded-lg shadow-lg",
          !isMobileOpen ? "block" : "hidden"
        )}
        style={{ zIndex: Z_INDEX.MOBILE_MENU }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 主侧边栏 */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen bg-gray-900/95 backdrop-blur-md",
          "border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out",
          // 桌面端
          "lg:translate-x-0",
          isExpanded ? "lg:w-64" : "lg:w-20",
          // 移动端
          "lg:block",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
          className
        )}
        style={{ zIndex: Z_INDEX.SIDEBAR }}
        onMouseEnter={() => !isMobileOpen && setIsExpanded(true)}
        onMouseLeave={() => !isMobileOpen && setIsExpanded(false)}
      >
        {/* Logo 区域 */}
        <div className="h-16 flex items-center justify-between border-b border-gray-800 px-4">
          <Link 
            href={session ? "/dashboard" : "/"} 
            className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Spade size={32} className="shrink-0" />
            {(isExpanded || isMobileOpen) && (
              <span className="font-bold text-lg">PokerPal</span>
            )}
          </Link>
          
          {/* 移动端关闭按钮 */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* 俱乐部和语言切换区域（仅登录用户） */}
        {session && (isExpanded || isMobileOpen) && (
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
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1">
            {visibleMenuItems.map(item => renderMenuItem(item))}
          </div>
        </nav>

        {/* 用户信息和控制区域 */}
        <div className="border-t border-gray-800 p-4 space-y-3">
          {/* 已登录用户信息 */}
          {session?.user && (isExpanded || isMobileOpen) && (
            <div className="p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {session.user.name || session.user.email}
                  </div>
                  <div className="text-purple-300 text-xs">
                    {userRole === 'OWNER' && '所有者'}
                    {userRole === 'ADMIN' && '管理员'}
                    {userRole === 'MANAGER' && '经理'}
                    {userRole === 'MEMBER' && '会员'}
                    {userRole === 'DEALER' && '荷官'}
                    {userRole === 'RECEPTIONIST' && '出纳'}
                    {userRole === 'VIP' && 'VIP会员'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex gap-2">
            {/* 登录/注册按钮（访客） */}
            {!session && (
              <Link
                href="/auth/signin"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <User size={16} />
                {(isExpanded || isMobileOpen) && <span>登录</span>}
              </Link>
            )}

            {/* 登出按钮（已登录用户） */}
            {session && (
              <button
                onClick={() => handleItemClick('logout')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                {(isExpanded || isMobileOpen) && <span>登出</span>}
              </button>
            )}

            {/* 折叠按钮（桌面端） */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden lg:flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}