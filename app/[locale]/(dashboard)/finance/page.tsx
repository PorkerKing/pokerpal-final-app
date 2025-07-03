"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Users,
  Trophy,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FinanceStats {
  dailyRevenue: number;
  dailyChange: number;
  monthlyRevenue: number;
  monthlyChange: number;
  totalBalance: number;
  pendingWithdrawals: number;
  rakeCollected: number;
  tournamentFees: number;
}

interface RevenueChart {
  date: string;
  revenue: number;
  rake: number;
  fees: number;
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'RAKE' | 'TOURNAMENT_FEE' | 'REFUND';
  amount: number;
  description: string;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export default function FinancePage() {
  const t = useTranslations('Finance');
  const { selectedClub, user } = useUserStore();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChart[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // 检查财务权限
  const userRole = selectedClub?.membership?.role;
  const hasFinancePermission = userRole && ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER'].includes(userRole);

  // 获取财务数据
  useEffect(() => {
    if (!selectedClub || !hasFinancePermission) return;
    
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const [statsRes, chartRes, transactionsRes] = await Promise.all([
          fetch(`/api/clubs/${selectedClub.id}/finance/stats`),
          fetch(`/api/clubs/${selectedClub.id}/finance/revenue?range=${dateRange}`),
          fetch(`/api/clubs/${selectedClub.id}/finance/transactions?limit=10`)
        ]);

        const [statsData, chartData, transactionsData] = await Promise.all([
          statsRes.json(),
          chartRes.json(),
          transactionsRes.json()
        ]);

        if (statsData.success) setStats(statsData.data);
        if (chartData.success) setRevenueData(chartData.data);
        if (transactionsData.success) setRecentTransactions(transactionsData.data.items);
      } catch (error) {
        console.error('获取财务数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [selectedClub, hasFinancePermission, dateRange]);

  // 渲染统计卡片
  const renderStatCard = (
    title: string,
    value: number,
    change: number,
    icon: any,
    format: 'currency' | 'number' = 'currency'
  ) => {
    const Icon = icon;
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' 
      ? `$${value.toLocaleString()}` 
      : value.toLocaleString();

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">{t('vs_last_period')}</span>
        </div>
      </div>
    );
  };

  // 渲染收入图表占位符
  const renderRevenueChart = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('revenue_chart.title')}</h3>
            <p className="text-sm text-gray-500">{t('revenue_chart.description')}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="revenue">{t('metrics.revenue')}</option>
              <option value="rake">{t('metrics.rake')}</option>
              <option value="fees">{t('metrics.fees')}</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">{t('date_range.7d')}</option>
              <option value="30d">{t('date_range.30d')}</option>
              <option value="90d">{t('date_range.90d')}</option>
            </select>
          </div>
        </div>
        
        {/* 图表占位符 - 可以集成 Chart.js 或 Recharts */}
        <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('chart.placeholder.title')}</p>
            <p className="text-sm text-gray-400">{t('chart.placeholder.description')}</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染交易类型徽章
  const renderTransactionBadge = (type: string) => {
    const typeColors = {
      DEPOSIT: 'text-green-700 bg-green-100',
      WITHDRAWAL: 'text-red-700 bg-red-100',
      RAKE: 'text-blue-700 bg-blue-100',
      TOURNAMENT_FEE: 'text-purple-700 bg-purple-100',
      REFUND: 'text-orange-700 bg-orange-100'
    };
    
    return (
      <span className={cn('inline-flex px-2 py-1 text-xs font-semibold rounded-full', typeColors[type as keyof typeof typeColors] || 'text-gray-700 bg-gray-100')}>
        {t(`transaction_types.${type.toLowerCase()}`)}
      </span>
    );
  };

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    const statusColors = {
      COMPLETED: 'text-green-700 bg-green-100',
      PENDING: 'text-yellow-700 bg-yellow-100',
      FAILED: 'text-red-700 bg-red-100'
    };
    
    return (
      <span className={cn('inline-flex px-2 py-1 text-xs font-semibold rounded-full', statusColors[status as keyof typeof statusColors] || 'text-gray-700 bg-gray-100')}>
        {t(`transaction_status.${status.toLowerCase()}`)}
      </span>
    );
  };

  if (!hasFinancePermission) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_permission.title')}</h3>
          <p className="text-gray-500">{t('no_permission.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 {t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            {t('export_report')}
          </button>
          <Link
            href="/finance/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            {t('view_all_transactions')}
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatCard(t('stats.daily_revenue'), stats.dailyRevenue, stats.dailyChange, DollarSign)}
          {renderStatCard(t('stats.monthly_revenue'), stats.monthlyRevenue, stats.monthlyChange, TrendingUp)}
          {renderStatCard(t('stats.rake_collected'), stats.rakeCollected, 0, Target)}
          {renderStatCard(t('stats.tournament_fees'), stats.tournamentFees, 0, Trophy)}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 收入图表 */}
        <div className="lg:col-span-2">
          {renderRevenueChart()}
        </div>

        {/* 财务概览 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('overview.title')}</h3>
          
          {stats && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Banknote className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">{t('overview.total_balance')}</span>
                </div>
                <span className="font-bold text-green-600">${stats.totalBalance.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-900">{t('overview.pending_withdrawals')}</span>
                </div>
                <span className="font-bold text-orange-600">${stats.pendingWithdrawals.toLocaleString()}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link 
                  href="/finance/transactions"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  {t('view_all_transactions')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 最近交易 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{t('recent_transactions.title')}</h3>
            <Link 
              href="/finance/transactions"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              {t('view_all')}
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('recent_transactions.empty.title')}</h3>
            <p className="text-gray-600">{t('recent_transactions.empty.description')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.transaction')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        {transaction.user && (
                          <div className="text-sm text-gray-500">
                            {transaction.user.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderTransactionBadge(transaction.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-sm font-medium",
                        ['DEPOSIT', 'RAKE', 'TOURNAMENT_FEE'].includes(transaction.type) 
                          ? "text-green-600" 
                          : "text-red-600"
                      )}>
                        {['DEPOSIT', 'RAKE', 'TOURNAMENT_FEE'].includes(transaction.type) ? '+' : '-'}
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}