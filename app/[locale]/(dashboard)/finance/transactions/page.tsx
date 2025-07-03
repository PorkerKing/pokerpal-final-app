"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  Search,
  Filter,
  Download,
  ArrowLeft,
  CreditCard,
  Eye,
  MoreHorizontal,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'RAKE' | 'TOURNAMENT_FEE' | 'REFUND' | 'TRANSFER';
  amount: number;
  description: string;
  user?: {
    name: string;
    email: string;
  };
  club: {
    name: string;
  };
  createdAt: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  reference?: string;
  notes?: string;
}

export default function TransactionsPage() {
  const t = useTranslations('Finance');
  const { selectedClub, user } = useUserStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const itemsPerPage = 20;

  // 检查财务权限
  const hasFinancePermission = user?.role && ['OWNER', 'ADMIN', 'MANAGER'].includes(user.role);

  // 获取交易列表
  useEffect(() => {
    if (!selectedClub || !hasFinancePermission) return;
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          search: searchTerm,
          dateRange,
          ...(selectedType !== 'all' && { type: selectedType }),
          ...(selectedStatus !== 'all' && { status: selectedStatus })
        });

        const response = await fetch(`/api/clubs/${selectedClub.id}/finance/transactions?${params}`);
        const data = await response.json();

        if (data.success) {
          setTransactions(data.data.items);
          setTotalTransactions(data.data.total);
        }
      } catch (error) {
        console.error('获取交易列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedClub, hasFinancePermission, currentPage, searchTerm, selectedType, selectedStatus, dateRange]);

  // 渲染交易类型徽章
  const renderTransactionBadge = (type: string) => {
    const typeConfig = {
      DEPOSIT: { color: 'text-green-700 bg-green-100', icon: TrendingUp },
      WITHDRAWAL: { color: 'text-red-700 bg-red-100', icon: TrendingDown },
      RAKE: { color: 'text-blue-700 bg-blue-100', icon: DollarSign },
      TOURNAMENT_FEE: { color: 'text-purple-700 bg-purple-100', icon: DollarSign },
      REFUND: { color: 'text-orange-700 bg-orange-100', icon: TrendingUp },
      TRANSFER: { color: 'text-gray-700 bg-gray-100', icon: CreditCard }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.TRANSFER;
    const Icon = config.icon;
    
    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full', config.color)}>
        <Icon className="h-3 w-3" />
        {t(`transaction_types.${type.toLowerCase()}`)}
      </span>
    );
  };

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    const statusColors = {
      COMPLETED: 'text-green-700 bg-green-100',
      PENDING: 'text-yellow-700 bg-yellow-100',
      FAILED: 'text-red-700 bg-red-100',
      CANCELLED: 'text-gray-700 bg-gray-100'
    };
    
    return (
      <span className={cn('inline-flex px-2 py-1 text-xs font-semibold rounded-full', statusColors[status as keyof typeof statusColors] || 'text-gray-700 bg-gray-100')}>
        {t(`transaction_status.${status.toLowerCase()}`)}
      </span>
    );
  };

  // 导出交易数据
  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        dateRange,
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        format: 'csv'
      });

      const response = await fetch(`/api/clubs/${selectedClub.id}/finance/transactions/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('导出交易数据失败:', error);
    }
  };

  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

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
      <div className="flex items-center gap-4">
        <Link
          href="/finance"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{t('transactions.title')}</h1>
          <p className="text-gray-600">{t('transactions.description')}</p>
        </div>
        <button
          onClick={exportTransactions}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          {t('export_csv')}
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 搜索框 */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('transactions.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 交易类型筛选 */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t('filters.all_types')}</option>
            <option value="DEPOSIT">{t('transaction_types.deposit')}</option>
            <option value="WITHDRAWAL">{t('transaction_types.withdrawal')}</option>
            <option value="RAKE">{t('transaction_types.rake')}</option>
            <option value="TOURNAMENT_FEE">{t('transaction_types.tournament_fee')}</option>
            <option value="REFUND">{t('transaction_types.refund')}</option>
            <option value="TRANSFER">{t('transaction_types.transfer')}</option>
          </select>

          {/* 状态筛选 */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t('filters.all_status')}</option>
            <option value="COMPLETED">{t('transaction_status.completed')}</option>
            <option value="PENDING">{t('transaction_status.pending')}</option>
            <option value="FAILED">{t('transaction_status.failed')}</option>
            <option value="CANCELLED">{t('transaction_status.cancelled')}</option>
          </select>

          {/* 时间范围 */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">{t('date_range.7d')}</option>
            <option value="30d">{t('date_range.30d')}</option>
            <option value="90d">{t('date_range.90d')}</option>
            <option value="1y">{t('date_range.1y')}</option>
          </select>
        </div>
      </div>

      {/* 交易列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('transactions.empty.title')}</h3>
            <p className="text-gray-600">{t('transactions.empty.description')}</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.transaction')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.user')}
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          {transaction.reference && (
                            <div className="text-xs text-gray-500">
                              Ref: {transaction.reference}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.user ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">{t('system_transaction')}</span>
                        )}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-purple-600 hover:text-purple-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {t('pagination.showing', {
                      start: (currentPage - 1) * itemsPerPage + 1,
                      end: Math.min(currentPage * itemsPerPage, totalTransactions),
                      total: totalTransactions
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('pagination.previous')}
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}