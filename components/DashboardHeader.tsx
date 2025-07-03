"use client";

import { Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bell, 
  Search, 
  Menu as MenuIcon,
  ChevronDown,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import ClubSwitcher from '@/components/ClubSwitcher';
import { cn } from '@/lib/utils';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const t = useTranslations('Header');

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 左侧：移动端菜单按钮和搜索 */}
        <div className="flex items-center gap-4 flex-1">
          {/* 移动端菜单按钮 */}
          <button
            type="button"
            className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-md"
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          {/* 搜索框 */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        {/* 右侧：俱乐部切换器、通知、用户菜单 */}
        <div className="flex items-center gap-4">
          {/* 俱乐部切换器 */}
          <ClubSwitcher />

          {/* 通知按钮 */}
          <button
            type="button"
            className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-md"
          >
            <Bell className="h-6 w-6" />
            {/* 通知徽章 */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* 用户菜单 */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden sm:block font-medium">{session?.user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={cn(
                        active ? 'bg-gray-100' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <User className="mr-3 h-4 w-4" />
                      {t('profile')}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={cn(
                        active ? 'bg-gray-100' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      {t('settings')}
                    </a>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-100"></div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={cn(
                        active ? 'bg-gray-100' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      {t('signOut')}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}