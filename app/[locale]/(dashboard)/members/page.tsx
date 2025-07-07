"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Users,
  Crown,
  Star,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  Mail,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// 会员数据类型
interface Member {
  id: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  role: string;
  status: string;
  balance: number;
  vipLevel: number;
  joinDate: string;
  lastActive: string;
  totalBuyIn: number;
  totalCashOut: number;
}

// 角色图标映射
const roleIcons = {
  OWNER: Crown,
  ADMIN: Star,
  MANAGER: UserCheck,
  MEMBER: Users,
  DEALER: Users,
  RECEPTIONIST: Users,
  VIP: Star,
  GUEST: Users
};

// 角色颜色映射
const roleColors = {
  OWNER: 'text-yellow-600 bg-yellow-100',
  ADMIN: 'text-purple-600 bg-purple-100',
  MANAGER: 'text-blue-600 bg-blue-100',
  MEMBER: 'text-gray-600 bg-gray-100',
  DEALER: 'text-green-600 bg-green-100',
  RECEPTIONIST: 'text-orange-600 bg-orange-100',
  VIP: 'text-pink-600 bg-pink-100',
  GUEST: 'text-gray-400 bg-gray-50'
};

export default function MembersPage() {
  const t = useTranslations('Members');
  const { selectedClub } = useUserStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  const itemsPerPage = 10;

  // 获取会员列表
  useEffect(() => {
    if (!selectedClub) return;
    
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          search: searchTerm,
          ...(selectedRole !== 'all' && { role: selectedRole }),
          ...(selectedStatus !== 'all' && { status: selectedStatus })
        });

        const response = await fetch(`/api/clubs/${selectedClub.id}/members?${params}`);
        const data = await response.json();

        if (data.success) {
          setMembers(data.data.items);
          setTotalMembers(data.data.total);
        }
      } catch (error) {
        console.error('获取会员列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedClub, currentPage, searchTerm, selectedRole, selectedStatus]);

  // 渲染角色徽章
  const renderRoleBadge = (role: string) => {
    const Icon = roleIcons[role as keyof typeof roleIcons] || Users;
    const colorClass = roleColors[role as keyof typeof roleColors] || 'text-gray-600 bg-gray-100';
    
    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass)}>
        <Icon className="h-3 w-3" />
        {t(`roles.${role.toLowerCase()}`)}
      </span>
    );
  };

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: 'text-green-700 bg-green-100',
      INACTIVE: 'text-gray-700 bg-gray-100',
      SUSPENDED: 'text-red-700 bg-red-100',
      PENDING: 'text-yellow-700 bg-yellow-100'
    };
    
    return (
      <span className={cn('inline-flex px-2 py-1 text-xs font-semibold rounded-full', statusColors[status as keyof typeof statusColors] || 'text-gray-700 bg-gray-100')}>
        {t(`status.${status.toLowerCase()}`)}
      </span>
    );
  };

  const totalPages = Math.ceil(totalMembers / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 {t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/members/invite"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('inviteNew')}
          </Link>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 角色筛选 */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">{t('filters.allRoles')}</option>
          <option value="OWNER">{t('roles.owner')}</option>
          <option value="ADMIN">{t('roles.admin')}</option>
          <option value="MANAGER">{t('roles.manager')}</option>
          <option value="MEMBER">{t('roles.member')}</option>
          <option value="DEALER">{t('roles.dealer')}</option>
          <option value="RECEPTIONIST">{t('roles.cashier')}</option>
          <option value="VIP">{t('roles.vip')}</option>
        </select>

        {/* 状态筛选 */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">{t('filters.allStatus')}</option>
          <option value="ACTIVE">{t('status.active')}</option>
          <option value="INACTIVE">{t('status.inactive')}</option>
          <option value="SUSPENDED">{t('status.suspended')}</option>
          <option value="PENDING">{t('status.pending')}</option>
        </select>
      </div>

      {/* 会员列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
            <p className="text-gray-600 mb-4">{t('empty.description')}</p>
            <Link
              href="/members/invite"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('empty.action')}
            </Link>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.member')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.balance')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.joinDate')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {member.user.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(member.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${member.balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-purple-600 hover:text-purple-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Mail className="h-4 w-4" />
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
                      end: Math.min(currentPage * itemsPerPage, totalMembers),
                      total: totalMembers
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