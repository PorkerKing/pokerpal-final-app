"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/lib/z-index';
import UnifiedSidebar from './UnifiedSidebar';
import { Menu, X } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export default function ResponsiveLayout({ 
  children, 
  showSidebar = true, 
  className 
}: ResponsiveLayoutProps) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端菜单打开时禁止滚动
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isMobile]);

  const handleSidebarItemClick = (item: string) => {
    // 移动端点击菜单项后关闭侧边栏
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端顶部导航栏 */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="打开菜单"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-gray-900">PokerPal</span>
        </div>

        {session ? (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-medium text-sm">
              {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
            </span>
          </div>
        ) : (
          <div className="w-8 h-8" /> // 占位符保持布局平衡
        )}
      </div>

      {/* 移动端遮罩层 */}
      {isMobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          style={{ zIndex: Z_INDEX.BACKDROP }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏 - 桌面端固定，移动端滑动 */}
      {showSidebar && (
        <div
          className={cn(
            "fixed top-0 left-0 h-full lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out",
            isMobile
              ? isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          )}
          style={{ zIndex: isMobile ? Z_INDEX.MOBILE_MENU : Z_INDEX.SIDEBAR }}
        >
          <UnifiedSidebar onItemClick={handleSidebarItemClick} />
          
          {/* 移动端关闭按钮 */}
          {isMobile && isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-800 text-white rounded-lg"
              aria-label="关闭菜单"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* 主内容区域 */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          showSidebar ? "lg:ml-20" : "",
          className
        )}
      >
        {/* 内容容器 */}
        <div className="min-h-screen">
          {children}
        </div>
      </main>

      {/* 移动端底部导航栏（可选） */}
      {session && isMobile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
          <div className="flex justify-around">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs">菜单</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 响应式卡片组件
export function ResponsiveCard({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        "p-4 sm:p-6",
        "hover:shadow-md transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 响应式网格组件
export function ResponsiveGrid({ 
  children, 
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-4 sm:gap-6',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  cols?: { sm: number; md: number; lg: number; xl?: number };
  gap?: string;
}) {
  const gridCols = cn(
    `grid`,
    `grid-cols-${cols.sm}`,
    `md:grid-cols-${cols.md}`,
    `lg:grid-cols-${cols.lg}`,
    cols.xl ? `xl:grid-cols-${cols.xl}` : '',
    gap
  );

  return (
    <div
      className={cn(gridCols, className)}
      {...props}
    >
      {children}
    </div>
  );
}

// 响应式容器组件
export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'max-w-7xl',
  padding = 'px-4 sm:px-6 lg:px-8',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: string;
  padding?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto',
        maxWidth,
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 响应式堆叠组件
export function ResponsiveStack({ 
  children, 
  className,
  direction = 'flex-col',
  gap = 'gap-4 sm:gap-6',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  direction?: string;
  gap?: string;
}) {
  return (
    <div
      className={cn(
        'flex',
        direction,
        gap,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}