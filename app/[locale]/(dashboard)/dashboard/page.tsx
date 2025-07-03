"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSelectedClub } from '@/stores/userStore';
import { 
  Users, 
  Trophy, 
  Circle, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Play,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from '@/navigation';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

// 数据类型定义
interface DashboardSummary {
  members: {
    total: number;
    active: number;
    growth: number;
  };
  tournaments: {
    total: number;
    active: number;
    upcoming: number;
  };
  ringGames: {
    total: number;
    active: number;
    waiting: number;
  };
  finance?: {
    dailyRevenue: number;
    monthlyRevenue: number;
    currency: string;
  };
  recentActivity: Array<{
    id: string;
    name: string;
    type: string;
    startTime: string;
    status: string;
    playerCount: number;
  }>;
  userRole: string;
  canViewFinance: boolean;
}

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any; // 使用any类型以避免Lucide图标的复杂类型
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center mt-4">
          <TrendingUp size={16} className={trend >= 0 ? 'text-green-500' : 'text-red-500'} />
          <span className={`text-sm ml-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs 上月</span>
        </div>
      )}
    </div>
  );
};

// 快速操作按钮组件
interface QuickActionProps {
  title: string;
  href: string;
  icon: any; // 使用any类型以避免Lucide图标的复杂类型
  description: string;
}

const QuickAction = ({ title, href, icon: Icon, description }: QuickActionProps) => (
  <Link href={href} className="group">
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
            <Icon size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
      </div>
    </div>
  </Link>
);

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const selectedClub = useSelectedClub();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取仪表盘数据
  useEffect(() => {
    if (!selectedClub) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/summary?clubId=${selectedClub.id}`);
        const data = await response.json();
        
        if (data.success) {
          setSummary(data.data);
        } else {
          setError(data.error || '获取数据失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [selectedClub]);

  if (!selectedClub) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">请先选择一个俱乐部</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!summary) return null;

  // 快速操作配置
  const quickActions = [
    {
      title: t('quickActions.createTournament'),
      href: '/tournaments/create',
      icon: Trophy,
      description: '🏆 创建新的锦标赛'
    },
    {
      title: t('quickActions.openRingGame'),
      href: '/ring-games/create',
      icon: Circle,
      description: '🎯 开设新的圆桌游戏'
    },
    {
      title: t('quickActions.manageMembers'),
      href: '/members',
      icon: Users,
      description: '👥 管理俱乐部会员'
    },
    {
      title: t('quickActions.viewReports'),
      href: '/reports',
      icon: TrendingUp,
      description: '📊 查看详细报告'
    }
  ].filter(action => {
    // 根据用户角色过滤快速操作
    if (action.href.includes('create') || action.href.includes('members') || action.href.includes('reports')) {
      return ['OWNER', 'ADMIN', 'MANAGER'].includes(summary.userRole);
    }
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-2">
          {selectedClub.name} - {t('overview')}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('members.title')}
          value={summary.members.total}
          subtitle={`${summary.members.active} ${t('members.active')}`}
          icon={Users}
          trend={summary.members.growth}
          color="blue"
        />
        
        <StatCard
          title={t('tournaments.title')}
          value={summary.tournaments.total}
          subtitle={`${summary.tournaments.active} ${t('tournaments.active')}`}
          icon={Trophy}
          color="green"
        />
        
        <StatCard
          title={t('ringGames.title')}
          value={summary.ringGames.total}
          subtitle={`${summary.ringGames.active} ${t('ringGames.active')}`}
          icon={Circle}
          color="purple"
        />
        
        {summary.finance && (
          <StatCard
            title={t('finance.dailyRevenue')}
            value={formatCurrency(summary.finance.dailyRevenue)}
            subtitle={`本月: ${formatCurrency(summary.finance.monthlyRevenue)}`}
            icon={DollarSign}
            color="orange"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近活动 */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity.title')}</h2>
          </div>
          <div className="p-6">
            {summary.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {summary.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Trophy size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{activity.name}</h3>
                        <p className="text-sm text-gray-500">
                          {activity.playerCount} {t('recentActivity.players')} • {formatRelativeTime(activity.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                        activity.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status === 'IN_PROGRESS' && '进行中'}
                        {activity.status === 'SCHEDULED' && '已安排'}
                        {activity.status === 'COMPLETED' && '已完成'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t('recentActivity.noActivity')}</p>
            )}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">⚡ {t('quickActions.title')}</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}