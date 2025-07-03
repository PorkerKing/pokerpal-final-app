"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  Star,
  TrendingUp,
  Users,
  Award,
  Clock,
  Plus,
  Minus,
  Settings,
  History,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsOverview {
  totalMembers: number;
  totalPoints: number;
  averagePoints: number;
  topMember: {
    name: string;
    points: number;
  } | null;
}

interface TopMember {
  name: string;
  email: string;
  points: number;
}

interface PointsTransaction {
  id: string;
  userName: string;
  type: 'POINTS_EARNED' | 'POINTS_REDEMPTION';
  amount: number;
  description: string;
  timestamp: string;
}

interface PointsData {
  overview: PointsOverview;
  topMembers: TopMember[];
  recentTransactions: PointsTransaction[];
}

export default function PointsManagementPage() {
  const t = useTranslations('Points');
  const { selectedClub, user } = useUserStore();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'members' | 'transactions'>('overview');

  // 权限检查
  const hasManagePermission = selectedClub?.membership?.role && 
    ['MANAGER', 'ADMIN', 'OWNER'].includes(selectedClub.membership.role);

  useEffect(() => {
    if (!selectedClub || !hasManagePermission) return;
    fetchPointsData();
  }, [selectedClub, hasManagePermission]);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${selectedClub?.id}/points`);
      if (response.ok) {
        const result = await response.json();
        setPointsData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'POINTS_EARNED' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <Minus className="h-4 w-4 text-red-500" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'POINTS_EARNED' ? 'text-green-600' : 'text-red-600';
  };

  if (!selectedClub) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">请选择俱乐部</h3>
          <p className="text-gray-500">选择一个俱乐部来管理积分系统</p>
        </div>
      </div>
    );
  }

  if (!hasManagePermission) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">无权限访问</h3>
          <p className="text-gray-500">只有管理员及以上角色可以管理积分系统</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            ⭐ 积分管理系统
          </h1>
          <p className="text-gray-600">管理俱乐部积分奖励和兑换</p>
        </div>
        
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            导出报告
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="h-4 w-4" />
            批量奖励
          </button>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '概览', icon: TrendingUp },
            { key: 'members', label: '会员排行', icon: Users },
            { key: 'transactions', label: '积分记录', icon: History }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={cn(
                "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm",
                selectedTab === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* 骨架屏 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {selectedTab === 'overview' && pointsData && (
            <div className="space-y-6">
              {/* 统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">总会员数</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pointsData.overview.totalMembers)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">总积分数</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pointsData.overview.totalPoints)}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">平均积分</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pointsData.overview.averagePoints)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">积分王者</p>
                      <p className="text-lg font-bold text-gray-900">
                        {pointsData.overview.topMember?.name || '暂无'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pointsData.overview.topMember ? formatNumber(pointsData.overview.topMember.points) : '0'} 积分
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* 最近交易 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">最近积分交易</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {pointsData.recentTransactions.length > 0 ? (
                    pointsData.recentTransactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-gray-900">{transaction.userName}</p>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("font-bold", getTransactionColor(transaction.type))}>
                            {transaction.type === 'POINTS_EARNED' ? '+' : ''}{transaction.amount}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      暂无积分交易记录
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'members' && pointsData && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">会员积分排行榜</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索会员..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {pointsData.topMembers
                  .filter(member => 
                    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((member, index) => (
                    <div key={member.email} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-100 text-gray-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {formatNumber(member.points)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {selectedTab === 'transactions' && pointsData && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">积分交易记录</h3>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                      筛选
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用户
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        积分变化
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        描述
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pointsData.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{transaction.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className={cn(
                              "text-sm",
                              transaction.type === 'POINTS_EARNED' ? 'text-green-600' : 'text-red-600'
                            )}>
                              {transaction.type === 'POINTS_EARNED' ? '获得积分' : '消费积分'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "font-bold",
                            getTransactionColor(transaction.type)
                          )}>
                            {transaction.type === 'POINTS_EARNED' ? '+' : ''}{transaction.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}