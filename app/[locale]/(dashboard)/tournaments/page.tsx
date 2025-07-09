"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSelectedClub } from '@/stores/userStore';
import { Link } from '@/navigation';
import { motion } from 'framer-motion';
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

// 引入Framer Motion
const MotionDiv = motion.div;

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

export default function TournamentsPage() {
  const { data: session } = useSession();
  const t = useTranslations('Tournaments');
  const selectedClub = useSelectedClub();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  // 模拟锦标赛数据
  const mockTournaments: Tournament[] = [
    {
      id: '1',
      name: '周末豪华锦标赛',
      description: '高额奖金池，专业级别比赛',
      gameType: 'Texas Hold\'em',
      buyIn: 1000,
      fee: 100,
      startingStack: 20000,
      startTime: '2024-01-15T19:00:00Z',
      minPlayers: 50,
      maxPlayers: 200,
      status: 'REGISTERING',
      _count: { players: 85 }
    },
    {
      id: '2',
      name: '新手友谊赛',
      description: '适合新手的入门级比赛',
      gameType: 'Texas Hold\'em',
      buyIn: 100,
      fee: 10,
      startingStack: 5000,
      startTime: '2024-01-16T15:00:00Z',
      minPlayers: 20,
      maxPlayers: 80,
      status: 'SCHEDULED',
      _count: { players: 35 }
    },
    {
      id: '3',
      name: '精英挑战赛',
      description: '高级玩家专属比赛',
      gameType: 'Omaha',
      buyIn: 2000,
      fee: 200,
      startingStack: 50000,
      startTime: '2024-01-17T20:00:00Z',
      minPlayers: 30,
      maxPlayers: 100,
      status: 'IN_PROGRESS',
      _count: { players: 67 }
    },
    {
      id: '4',
      name: '快速锦标赛',
      description: '30分钟盲注结构',
      gameType: 'Texas Hold\'em',
      buyIn: 500,
      fee: 50,
      startingStack: 10000,
      startTime: '2024-01-12T18:00:00Z',
      minPlayers: 40,
      maxPlayers: 120,
      status: 'COMPLETED',
      _count: { players: 98 }
    },
    {
      id: '5',
      name: '月度冠军赛',
      description: '每月一次的重要赛事',
      gameType: 'Texas Hold\'em',
      buyIn: 1500,
      fee: 150,
      startingStack: 30000,
      startTime: '2024-01-20T19:30:00Z',
      minPlayers: 60,
      maxPlayers: 180,
      status: 'SCHEDULED',
      _count: { players: 12 }
    },
    {
      id: '6',
      name: '取消的比赛',
      description: '因故取消的比赛',
      gameType: 'Texas Hold\'em',
      buyIn: 800,
      fee: 80,
      startingStack: 15000,
      startTime: '2024-01-14T17:00:00Z',
      minPlayers: 30,
      maxPlayers: 90,
      status: 'CANCELLED',
      _count: { players: 0 }
    }
  ];

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
          // 如果API失败，使用模拟数据
          setTournaments(mockTournaments);
        }
      } catch (err) {
        // 如果网络错误，使用模拟数据
        setTournaments(mockTournaments);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [selectedClub]);

  // 滚动动画检测
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.tournament-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [tournaments]);

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

  // 统计数据
  const stats = {
    totalTournaments: tournaments.length,
    registering: tournaments.filter(t => t.status === 'REGISTERING').length,
    inProgress: tournaments.filter(t => t.status === 'IN_PROGRESS').length,
    scheduled: tournaments.filter(t => t.status === 'SCHEDULED').length,
    totalPlayers: tournaments.reduce((sum, t) => sum + t._count.players, 0),
    totalPrizePool: tournaments.reduce((sum, t) => sum + (t.buyIn * t._count.players), 0)
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // 状态徽章渲染
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { color: 'text-blue-400 bg-blue-400/20', text: '已安排' },
      REGISTERING: { color: 'text-green-400 bg-green-400/20', text: '报名中' },
      IN_PROGRESS: { color: 'text-yellow-400 bg-yellow-400/20', text: '进行中' },
      COMPLETED: { color: 'text-gray-400 bg-gray-400/20', text: '已完成' },
      CANCELLED: { color: 'text-red-400 bg-red-400/20', text: '已取消' },
      PAUSED: { color: 'text-orange-400 bg-orange-400/20', text: '暂停' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;

    return (
      <span className={cn("inline-flex px-2 py-1 text-xs font-semibold rounded-full", config.color)}>
        {config.text}
      </span>
    );
  };

  if (!selectedClub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">请先选择一个俱乐部</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">加载锦标赛数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <MotionDiv 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="hero-text mb-2">🏆 锦标赛管理</h1>
          <p className="text-gray-400 text-lg">管理和组织俱乐部锦标赛</p>
        </MotionDiv>

        {/* 统计概览 */}
        <div className="bento-grid mb-8">
          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="data-card gradient-purple"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-trophy text-purple-400 text-xl icon-glow"></i>
              </div>
              <span className="text-purple-400 text-sm font-medium">总计</span>
            </div>
            <div className="hero-number text-purple-400">{stats.totalTournaments}</div>
            <p className="text-gray-300 text-lg mt-2">总锦标赛数</p>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="data-card gradient-green"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-play text-green-400 text-xl icon-glow"></i>
              </div>
              <span className="text-green-400 text-sm font-medium">进行中</span>
            </div>
            <div className="hero-number text-green-400">{stats.inProgress}</div>
            <p className="text-gray-300 text-lg mt-2">正在进行</p>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="data-card gradient-blue"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-blue-400 text-xl icon-glow"></i>
              </div>
              <span className="text-blue-400 text-sm font-medium">参与者</span>
            </div>
            <div className="hero-number text-blue-400">{stats.totalPlayers}</div>
            <p className="text-gray-300 text-lg mt-2">总参与人数</p>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="data-card gradient-orange"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-coins text-orange-400 text-xl icon-glow"></i>
              </div>
              <span className="text-orange-400 text-sm font-medium">奖金池</span>
            </div>
            <div className="hero-number text-orange-400">¥{(stats.totalPrizePool / 1000).toFixed(0)}K</div>
            <p className="text-gray-300 text-lg mt-2">总奖金池</p>
          </MotionDiv>
        </div>

        {/* 搜索和过滤 */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="搜索锦标赛..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">所有状态</option>
                <option value="SCHEDULED">已安排</option>
                <option value="REGISTERING">报名中</option>
                <option value="IN_PROGRESS">进行中</option>
                <option value="COMPLETED">已完成</option>
                <option value="CANCELLED">已取消</option>
              </select>
            </div>
          </div>
        </MotionDiv>

        {/* 锦标赛列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament, index) => (
            <MotionDiv
              key={tournament.id}
              initial="hidden"
              animate={visibleCards.has(index) ? "visible" : "hidden"}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="tournament-card data-card"
              data-index={index}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-trophy text-white text-xl"></i>
                </div>
                {renderStatusBadge(tournament.status)}
              </div>

              <div className="mb-4">
                <h3 className="text-white font-semibold text-lg mb-2">{tournament.name}</h3>
                {tournament.description && (
                  <p className="text-gray-400 text-sm mb-3">{tournament.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-gamepad"></i>
                    {tournament.gameType}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-calendar"></i>
                    {new Date(tournament.startTime).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">报名费</span>
                  <span className="text-green-400 font-medium">¥{tournament.buyIn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">参与人数</span>
                  <span className="text-white font-medium">{tournament._count.players}/{tournament.maxPlayers || '∞'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">起始筹码</span>
                  <span className="text-blue-400 font-medium">{tournament.startingStack.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">开始时间</span>
                  <span className="text-purple-400 font-medium">{new Date(tournament.startTime).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm">
                    <i className="fas fa-eye mr-1"></i>
                    查看
                  </button>
                  {canCreate && (
                    <button className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
                      <i className="fas fa-edit mr-1"></i>
                      编辑
                    </button>
                  )}
                  {tournament.status === 'REGISTERING' && (
                    <button className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm">
                      <i className="fas fa-user-plus mr-1"></i>
                      报名
                    </button>
                  )}
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>

        {/* 空状态 */}
        {filteredTournaments.length === 0 && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trophy text-gray-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">没有找到匹配的锦标赛</h3>
            <p className="text-gray-500">请尝试调整搜索条件或过滤器</p>
          </MotionDiv>
        )}

        {/* 快速操作按钮 */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap gap-4 mt-8"
        >
          {canCreate && (
            <Link href="/tournaments/create">
              <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 tech-glow">
                <i className="fas fa-plus"></i>
                创建新锦标赛
              </button>
            </Link>
          )}
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 tech-glow">
            <i className="fas fa-download"></i>
            导出数据
          </button>
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 tech-glow">
            <i className="fas fa-chart-line"></i>
            比赛统计
          </button>
        </MotionDiv>
      </div>
    </div>
  );
}