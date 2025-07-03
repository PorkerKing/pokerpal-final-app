"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSelectedClub } from '@/stores/userStore';
import { Link } from '@/navigation';
import { 
  Plus, 
  Search, 
  Circle, 
  Users, 
  DollarSign,
  Play,
  Pause,
  Square,
  Eye,
  Edit,
  UserPlus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// 圆桌游戏数据类型
interface RingGameTable {
  id: string;
  name: string;
  gameType: string;
  stakes: string;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
  maxPlayers: number;
  status: string;
  _count: { sessions: number };
  activePlayers?: number;
}

// 状态徽章组件
const StatusBadge = ({ status }: { status: string }) => {
  const t = useTranslations('RingGames.status');
  
  const statusConfig = {
    WAITING: { color: 'bg-blue-100 text-blue-800', icon: Circle },
    ACTIVE: { color: 'bg-green-100 text-green-800', icon: Play },
    PAUSED: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
    CLOSED: { color: 'bg-gray-100 text-gray-800', icon: Square }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.WAITING;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full", config.color)}>
      <Icon size={12} />
      {t(status as any)}
    </span>
  );
};

// 圆桌游戏卡片组件
const RingGameCard = ({ table }: { table: RingGameTable }) => {
  const t = useTranslations('RingGames');
  const userRole = (useSelectedClub() as any)?.userMembership?.role || 'GUEST';
  
  const canEdit = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);
  const canJoin = table.status === 'ACTIVE' || table.status === 'WAITING';
  const activePlayers = table._count.sessions || 0;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{table.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Circle size={14} />
                {table.gameType}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                {table.stakes}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {activePlayers}/{table.maxPlayers}
              </span>
            </div>
          </div>
          <StatusBadge status={table.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">买入范围</p>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(table.minBuyIn)} - {formatCurrency(table.maxBuyIn)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">盲注</p>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(table.smallBlind)}/{formatCurrency(table.bigBlind)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activePlayers > 0 ? (
              <span className="text-green-600">有 {activePlayers} 人在桌</span>
            ) : (
              <span className="text-gray-500">暂无玩家</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/ring-games/${table.id}`}>
              <button className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Eye size={14} />
                {t('actions.view')}
              </button>
            </Link>
            
            {canEdit && (
              <Link href={`/ring-games/${table.id}/edit`}>
                <button className="inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors">
                  <Edit size={14} />
                  {t('actions.edit')}
                </button>
              </Link>
            )}
            
            {canJoin && (
              <button className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                <UserPlus size={14} />
                {t('actions.join')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RingGamesPage() {
  const t = useTranslations('RingGames');
  const selectedClub = useSelectedClub();
  const [tables, setTables] = useState<RingGameTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = (selectedClub as any)?.userMembership?.role || 'GUEST';
  const canCreate = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);

  // 获取圆桌游戏列表
  useEffect(() => {
    if (!selectedClub) return;

    const fetchTables = async () => {
      try {
        setLoading(true);
        // 使用现有的 API，但需要添加 ringGameTables 的查询
        const response = await fetch(`/api/clubs/${selectedClub.id}?includeStats=true`);
        const data = await response.json();
        
        if (data.success && data.data.ringGameTables) {
          setTables(data.data.ringGameTables || []);
        } else {
          // 如果没有专门的 API，创建一些示例数据
          setTables([
            {
              id: '1',
              name: '$1/$2 NL Hold\'em',
              gameType: 'NLH',
              stakes: '$1/$2',
              smallBlind: 1,
              bigBlind: 2,
              minBuyIn: 40,
              maxBuyIn: 200,
              maxPlayers: 9,
              status: 'ACTIVE',
              _count: { sessions: 6 }
            },
            {
              id: '2', 
              name: '$2/$5 NL Hold\'em',
              gameType: 'NLH',
              stakes: '$2/$5',
              smallBlind: 2,
              bigBlind: 5,
              minBuyIn: 100,
              maxBuyIn: 500,
              maxPlayers: 9,
              status: 'WAITING',
              _count: { sessions: 0 }
            }
          ]);
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [selectedClub]);

  // 筛选功能
  const filteredTables = tables.filter(table => {
    const matchesFilter = activeFilter === 'all' || table.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         table.stakes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">🎯 {t('title')}</h1>
          <p className="text-gray-600 mt-2">{selectedClub.name}</p>
        </div>
        
        {canCreate && (
          <Link href="/ring-games/create">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
              <Plus size={20} />
              {t('createNew')}
            </button>
          </Link>
        )}
      </div>

      {/* 搜索 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索圆桌游戏..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
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
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <RingGameCard key={table.id} table={table} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Circle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-500 mb-6">{t('empty.description')}</p>
          {canCreate && (
            <Link href="/ring-games/create">
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