"use client";

import { Fragment } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useTranslations } from 'next-intl';
import { Menu, Transition } from '@headlessui/react';
import { Building, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClubSwitcherProps {
  variant?: 'header' | 'sidebar';
}

export default function ClubSwitcher({ variant = 'header' }: ClubSwitcherProps) {
  const { clubs, selectedClub, setSelectedClub } = useUserStore();
  const t = useTranslations('Header');

  // 侧边栏样式
  if (variant === 'sidebar') {
    return (
      <Menu as="div" className="relative w-full">
        <Menu.Button className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-white truncate">
              {selectedClub?.name || t('loading')}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
          <Menu.Items className="absolute left-0 z-50 mt-2 w-full origin-top-left rounded-lg bg-gray-800 border border-gray-700 shadow-xl focus:outline-none">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white">选择俱乐部</p>
              <p className="text-xs text-gray-400">切换到不同的俱乐部体验</p>
            </div>
            
            <div className="py-1 max-h-64 overflow-y-auto">
              {clubs.map((club) => {
                const isSelected = club.id === selectedClub?.id;
                return (
                  <Menu.Item key={club.id}>
                    {({ active }) => (
                      <button
                        onClick={() => setSelectedClub(club)}
                        className={cn(
                          'flex w-full items-center px-3 py-2 text-sm transition-colors',
                          active ? 'bg-gray-700' : '',
                          isSelected ? 'bg-purple-600/20 text-purple-300' : 'text-gray-300 hover:text-white'
                        )}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "h-6 w-6 rounded-md flex items-center justify-center",
                              isSelected ? "bg-purple-500/20" : "bg-gray-700"
                            )}>
                              <Building className={cn(
                                "h-3 w-3",
                                isSelected ? "text-purple-300" : "text-gray-400"
                              )} />
                            </div>
                          </div>
                          <div className="ml-2 flex-1 text-left min-w-0">
                            <p className="font-medium truncate">
                              {club.name}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-3 w-3 text-purple-300 flex-shrink-0" />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  }

  // 头部样式 - 如果没有俱乐部数据，显示加载状态
  if (!selectedClub) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300">
        <Building className="h-4 w-4" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  // 如果只有一个俱乐部，显示简单的标签
  if (clubs.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building className="h-4 w-4 text-gray-400" />
        <span className="font-medium text-white max-w-32 truncate">
          {selectedClub.name}
        </span>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 border border-gray-600 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500">
        <Building className="h-4 w-4 text-gray-400" />
        <span className="font-medium text-white max-w-32 truncate">
          {selectedClub.name}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{t('clubSwitcherLabel')}</p>
            <p className="text-xs text-gray-500">{t('clubSwitcherDescription')}</p>
          </div>
          
          <div className="py-1 max-h-64 overflow-y-auto">
            {clubs.map((club) => {
              const isSelected = club.id === selectedClub.id;
              return (
                <Menu.Item key={club.id}>
                  {({ active }) => (
                    <button
                      onClick={() => setSelectedClub(club)}
                      className={cn(
                        'flex w-full items-center px-4 py-3 text-sm',
                        active ? 'bg-purple-50' : '',
                        isSelected ? 'bg-purple-100' : ''
                      )}
                    >
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Building className="h-4 w-4 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1 text-left">
                          <p className={cn(
                            "font-medium truncate",
                            isSelected ? "text-purple-900" : "text-gray-900"
                          )}>
                            {club.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {(club as any).description || t('noDescription')}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
          
          {clubs.length > 5 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <p className="text-xs text-gray-500">{t('clubCount', { count: clubs.length })}</p>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 