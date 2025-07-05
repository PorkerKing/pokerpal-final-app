"use client";

import { Fragment } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useTranslations } from 'next-intl';
import { Menu, Transition } from '@headlessui/react';
import { Building, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClubSwitcher() {
  const { clubs, selectedClub, setSelectedClub } = useUserStore();
  const t = useTranslations('Header');

  // 如果没有俱乐部数据，显示加载状态
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