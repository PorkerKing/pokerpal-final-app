import { Swords, CircleDollarSign, Clock, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

type TournamentForCard = {
  id: string;
  name: string;
  gameType: string;
  buyIn: number | string;
  startTime: Date | string;
};

type TournamentCardProps = {
  tournament: TournamentForCard;
  onRegister: (tournamentName: string) => void;
};

export const TournamentCard = ({ tournament, onRegister }: TournamentCardProps) => {
  const t = useTranslations('TournamentCard');
  const startTimeDate = typeof tournament.startTime === 'string' 
    ? new Date(tournament.startTime) 
    : tournament.startTime;

  const formattedTime = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(startTimeDate);
  const formattedDate = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(startTimeDate);

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg p-4 flex flex-col space-y-4 transition-all hover:bg-white/20 hover:border-purple-400">
      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
      <div className="grid grid-cols-2 gap-4 text-gray-300">
        <div className="flex items-center space-x-2"><Swords size={16} className="text-purple-400" /><span>{tournament.gameType}</span></div>
        <div className="flex items-center space-x-2"><CircleDollarSign size={16} className="text-purple-400" /><span>{t('buyIn')}: {String(tournament.buyIn)}</span></div>
        <div className="flex items-center space-x-2"><Calendar size={16} className="text-purple-400" /><span>{formattedDate}</span></div>
        <div className="flex items-center space-x-2"><Clock size={16} className="text-purple-400" /><span>{formattedTime}</span></div>
      </div>
      <button onClick={() => onRegister(tournament.name!)} className="mt-auto w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-500 transition-colors">{t('register')}</button>
    </div>
  );
}; 