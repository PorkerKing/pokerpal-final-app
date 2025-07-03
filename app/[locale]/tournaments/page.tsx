"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSelectedClub } from '@/stores/userStore';
import { Link } from '@/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Trophy, 
  Users, 
  Calendar,
  DollarSign,
  Play,
  Square,
  Eye,
  Edit,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// 锦标赛数据类型
interface Tournament {
  id: string;
  name: string;
  description?: string;
  gameType: string;
  buyIn: number;
  fee: number;
  startingStack: number;
  startTime: string;
  minPlayers: number;
  maxPlayers?: number;
  status: string;
  _count: { players: number };
}

// 筛选器组件
interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: Record<string, number>;
}

const FilterTabs = ({ activeFilter, onFilterChange, counts }: FilterTabsProps) => {
  const t = useTranslations('Tournaments.filters');
  
  const filters = [
    { key: 'all', label: t('all') },
    { key: 'SCHEDULED', label: t('scheduled') },
    { key: 'REGISTERING', label: t('registering') },
    { key: 'IN_PROGRESS', label: t('inProgress') },
    { key: 'COMPLETED', label: t('completed') },
    { key: 'CANCELLED', label: t('cancelled') }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeFilter === filter.key
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {filter.label}
          {counts[filter.key] > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
              {counts[filter.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// 状态徽章组件
const StatusBadge = ({ status }: { status: string }) => {
  const t = useTranslations('Tournaments.status');
  
  const statusConfig = {
    SCHEDULED: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
    REGISTERING: { color: 'bg-green-100 text-green-800', icon: Users },
    IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: Play },
    COMPLETED: { color: 'bg-gray-100 text-gray-800', icon: Square },
    CANCELLED: { color: 'bg-red-100 text-red-800', icon: X },
    PAUSED: { color: 'bg-orange-100 text-orange-800', icon: Square }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full", config.color)}>
      <Icon size={12} />
      {t(status as any)}
    </span>
  );
};

// 锦标赛卡片组件
const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  const t = useTranslations('Tournaments');
  const userRole = (useSelectedClub() as any)?.userMembership?.role || 'GUEST';
  
  const canEdit = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);
  const canRegister = tournament.status === 'REGISTERING';

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{tournament.name}</h3>
            {tournament.description && (
              <p className="text-sm text-gray-600 mb-2">{tournament.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Trophy size={14} />
                {tournament.gameType}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                {formatCurrency(tournament.buyIn)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {tournament._count.players}/{tournament.maxPlayers || '∞'}
              </span>
            </div>
          </div>
          <StatusBadge status={tournament.status} />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(tournament.startTime)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/tournaments/${tournament.id}`}>
              <button className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Eye size={14} />
                {t('actions.view')}
              </button>
            </Link>
            
            {canEdit && (
              <Link href={`/tournaments/${tournament.id}/edit`}>
                <button className="inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors">
                  <Edit size={14} />
                  {t('actions.edit')}
                </button>
              </Link>
            )}
            
            {canRegister && (
              <button className="inline-flex items-center gap-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                <Users size={14} />
                {t('actions.register')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TournamentsPage() {
  const t = useTranslations('Tournaments');
  const selectedClub = useSelectedClub();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = (selectedClub as any)?.userMembership?.role || 'GUEST';
  const canCreate = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);

  // 获取锦标赛列表
  useEffect(() => {
    if (!selectedClub) return;

    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tournaments?clubId=${selectedClub.id}&limit=50`);
        const data = await response.json();
        
        if (data.success) {
          setTournaments(data.data.items || []);
        } else {
          setError(data.error || '获取锦标赛列表失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [selectedClub]);

  // 筛选锦标赛
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesFilter = activeFilter === 'all' || tournament.status === activeFilter;
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 计算各状态的数量
  const statusCounts = tournaments.reduce((counts, tournament) => {
    counts[tournament.status] = (counts[tournament.status] || 0) + 1;
    counts.all = tournaments.length;
    return counts;
  }, {} as Record<string, number>);

  if (!selectedClub) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">请先选择一个俱乐部</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{selectedClub.name}</p>
        </div>
        
        {canCreate && (
          <Link href="/tournaments/create">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
              <Plus size={20} />
              {t('createNew')}
            </button>
          </Link>
        )}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索锦标赛..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <FilterTabs 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          counts={statusCounts}
        />
      </div>

      {/* 内容区域 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-500 mb-6">{t('empty.description')}</p>
          {canCreate && (
            <Link href="/tournaments/create">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                <Plus size={20} />
                {t('empty.action')}
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}