"use client";
import { useUserStore } from '@/stores/userStore';
import { useTranslations } from 'next-intl';
import { Building, ChevronsUpDown } from 'lucide-react';

export default function ClubSwitcher() {
  const { clubs, selectedClub, setSelectedClub } = useUserStore();
  const t = useTranslations('Header');

  if (!selectedClub || clubs.length <= 1) {
    return (
      <div className="flex items-center space-x-2">
        <Building size={18} />
        <span className="text-white font-semibold">{selectedClub?.name || 'PokerPal'}</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <Building size={18} className="text-gray-400 absolute left-3 pointer-events-none" />
      <select
        value={selectedClub.id}
        onChange={(e) => {
            const newClub = clubs.find(c => c.id === e.target.value);
            if (newClub) {
                setSelectedClub(newClub);
            }
        }}
        aria-label={t('clubSwitcherLabel')}
        className="appearance-none w-full md:w-64 bg-white/5 border border-white/10 rounded-md pl-10 pr-8 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
      >
        {clubs.map((club) => (
          <option key={club.id} value={club.id} className="bg-[#171A29] text-white">
            {club.name}
          </option>
        ))}
      </select>
      <ChevronsUpDown size={16} className="text-gray-400 absolute right-3 pointer-events-none" />
    </div>
  );
} 