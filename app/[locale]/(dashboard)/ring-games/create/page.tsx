"use client";

import { useTranslations } from 'next-intl';

export default function CreateRingGamePage() {
  const t = useTranslations('RingGames');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">创建现金游戏</h1>
      <p className="text-gray-600">现金游戏创建功能开发中...</p>
    </div>
  );
}