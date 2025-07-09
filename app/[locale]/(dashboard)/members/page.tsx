"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { motion } from 'framer-motion';
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

// 引入Framer Motion
const MotionDiv = motion.div;

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
  totalGames?: number;
  winRate?: number;
  earnings?: number;
  avatar?: string;
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
  const { data: session } = useSession();
  const t = useTranslations('Members');
  const { selectedClub } = useUserStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  const itemsPerPage = 10;

  // 模拟会员数据（当API不可用时）
  const mockMembers: Member[] = [
    {
      id: '1',
      user: {
        name: '张三',
        email: 'zhangsan@example.com',
      },
      role: 'VIP',
      status: 'ACTIVE',
      balance: 25800,
      vipLevel: 3,
      joinDate: '2023-01-15',
      lastActive: '2小时前',
      totalBuyIn: 50000,
      totalCashOut: 75800,
      totalGames: 156,
      winRate: 68.5,
      earnings: 25800,
      avatar: '👨‍💼'
    },
    {
      id: '2',
      user: {
        name: '李四',
        email: 'lisi@example.com',
      },
      role: 'ADMIN',
      status: 'ACTIVE',
      balance: 18500,
      vipLevel: 2,
      joinDate: '2023-03-20',
      lastActive: '1天前',
      totalBuyIn: 30000,
      totalCashOut: 48500,
      totalGames: 89,
      winRate: 72.1,
      earnings: 18500,
      avatar: '👩‍💻'
    },
    {
      id: '3',
      user: {
        name: '王五',
        email: 'wangwu@example.com',
      },
      role: 'MEMBER',
      status: 'ACTIVE',
      balance: 15200,
      vipLevel: 1,
      joinDate: '2023-05-10',
      lastActive: '3小时前',
      totalBuyIn: 40000,
      totalCashOut: 55200,
      totalGames: 234,
      winRate: 55.2,
      earnings: 15200,
      avatar: '👨‍🎨'
    },
    {
      id: '4',
      user: {
        name: '赵六',
        email: 'zhaoliu@example.com',
      },
      role: 'VIP',
      status: 'ACTIVE',
      balance: 42300,
      vipLevel: 4,
      joinDate: '2023-02-08',
      lastActive: '30分钟前',
      totalBuyIn: 80000,
      totalCashOut: 122300,
      totalGames: 445,
      winRate: 78.9,
      earnings: 42300,
      avatar: '👩‍🔬'
    },
    {
      id: '5',
      user: {
        name: '钱七',
        email: 'qianqi@example.com',
      },
      role: 'MEMBER',
      status: 'INACTIVE',
      balance: 8900,
      vipLevel: 0,
      joinDate: '2023-06-25',
      lastActive: '2天前',
      totalBuyIn: 20000,
      totalCashOut: 28900,
      totalGames: 67,
      winRate: 45.8,
      earnings: 8900,
      avatar: '👨‍🏫'
    },
    {
      id: '6',
      user: {
        name: '孙八',
        email: 'sunba@example.com',
      },
      role: 'MANAGER',
      status: 'ACTIVE',
      balance: 22100,
      vipLevel: 2,
      joinDate: '2023-04-12',
      lastActive: '1小时前',
      totalBuyIn: 35000,
      totalCashOut: 57100,
      totalGames: 178,
      winRate: 63.4,
      earnings: 22100,
      avatar: '👩‍🎤'
    }
  ];

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
        } else {
          // 如果API失败，使用模拟数据
          const filteredMock = mockMembers.filter(member => {
            const matchesSearch = member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === 'all' || member.role === selectedRole;
            const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
            return matchesSearch && matchesRole && matchesStatus;
          });
          setMembers(filteredMock);
          setTotalMembers(filteredMock.length);
        }
      } catch (error) {
        console.error('获取会员列表失败:', error);
        // 如果网络错误，使用模拟数据
        const filteredMock = mockMembers.filter(member => {
          const matchesSearch = member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole = selectedRole === 'all' || member.role === selectedRole;
          const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
          return matchesSearch && matchesRole && matchesStatus;
        });
        setMembers(filteredMock);
        setTotalMembers(filteredMock.length);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedClub, currentPage, searchTerm, selectedRole, selectedStatus]);

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

    const cards = document.querySelectorAll('.member-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [members]);

  // 渲染角色徽章
  const renderRoleBadge = (role: string) => {
    const Icon = roleIcons[role as keyof typeof roleIcons] || Users;
    const colorClass = roleColors[role as keyof typeof roleColors] || 'text-gray-600 bg-gray-100';
    
    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass)}>
        <Icon className="h-3 w-3" />
        {role}
      </span>
    );
  };

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: 'text-green-400 bg-green-400/20',
      INACTIVE: 'text-gray-400 bg-gray-400/20',
      SUSPENDED: 'text-red-400 bg-red-400/20',
      PENDING: 'text-yellow-400 bg-yellow-400/20'
    };
    
    return (
      <span className={cn('inline-flex px-2 py-1 text-xs font-semibold rounded-full', statusColors[status as keyof typeof statusColors] || 'text-gray-400 bg-gray-400/20')}>
        {status === 'ACTIVE' ? '活跃' : status === 'INACTIVE' ? '不活跃' : status === 'SUSPENDED' ? '暂停' : '待审核'}
      </span>
    );
  };

  // 统计数据
  const stats = {
    totalMembers: members.length,
    vipMembers: members.filter(m => m.role === 'VIP').length,
    adminMembers: members.filter(m => m.role === 'ADMIN').length,
    activeMembers: members.filter(m => m.status === 'ACTIVE').length,
    avgBalance: members.reduce((sum, m) => sum + m.balance, 0) / members.length || 0,
    totalBalance: members.reduce((sum, m) => sum + m.balance, 0)
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(totalMembers / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">加载会员数据中...</p>
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
          <h1 className="hero-text mb-2">👥 会员管理</h1>
          <p className="text-gray-400 text-lg">管理俱乐部会员信息和权限</p>
        </MotionDiv>

        {/* 统计概览 */}
        <div className="bento-grid mb-8">
          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="data-card gradient-blue"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-blue-400 text-xl icon-glow"></i>
              </div>
              <span className="text-blue-400 text-sm font-medium">总计</span>
            </div>
            <div className="hero-number text-blue-400">{stats.totalMembers}</div>
            <p className="text-gray-300 text-lg mt-2">总会员数</p>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="data-card gradient-purple"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-crown text-purple-400 text-xl icon-glow"></i>
              </div>
              <span className="text-purple-400 text-sm font-medium">VIP</span>
            </div>
            <div className="hero-number text-purple-400">{stats.vipMembers}</div>
            <p className="text-gray-300 text-lg mt-2">VIP会员</p>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="data-card gradient-green"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-check-circle text-green-400 text-xl icon-glow"></i>
              </div>
              <span className="text-green-400 text-sm font-medium">活跃</span>
            </div>
            <div className="hero-number text-green-400">{stats.activeMembers}</div>
            <p className="text-gray-300 text-lg mt-2">活跃会员</p>
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
                <i className="fas fa-wallet text-orange-400 text-xl icon-glow"></i>
              </div>
              <span className="text-orange-400 text-sm font-medium">总计</span>
            </div>
            <div className="hero-number text-orange-400">¥{(stats.totalBalance / 1000).toFixed(0)}K</div>
            <p className="text-gray-300 text-lg mt-2">余额总计</p>
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
                  placeholder="搜索会员姓名或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">所有角色</option>
                <option value="OWNER">所有者</option>
                <option value="ADMIN">管理员</option>
                <option value="MANAGER">经理</option>
                <option value="MEMBER">会员</option>
                <option value="DEALER">荷官</option>
                <option value="RECEPTIONIST">前台</option>
                <option value="VIP">VIP会员</option>
              </select>
            </div>
            <div className="md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">所有状态</option>
                <option value="ACTIVE">活跃</option>
                <option value="INACTIVE">不活跃</option>
                <option value="SUSPENDED">暂停</option>
                <option value="PENDING">待审核</option>
              </select>
            </div>
          </div>
        </MotionDiv>

        {/* 会员列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => (
            <MotionDiv
              key={member.id}
              initial="hidden"
              animate={visibleCards.has(index) ? "visible" : "hidden"}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="member-card data-card"
              data-index={index}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
                    {member.avatar || member.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{member.user.name}</h3>
                    <p className="text-gray-400 text-sm">{member.user.email}</p>
                  </div>
                </div>
                {renderRoleBadge(member.role)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">状态</span>
                  {renderStatusBadge(member.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">余额</span>
                  <span className="text-green-400 font-medium">¥{member.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">VIP等级</span>
                  <span className="text-purple-400 font-medium">Lv.{member.vipLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">加入时间</span>
                  <span className="text-white font-medium">{member.joinDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">最后活跃</span>
                  <span className="text-green-400 font-medium">{member.lastActive}</span>
                </div>
                {member.totalGames && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">总游戏数</span>
                    <span className="text-white font-medium">{member.totalGames}</span>
                  </div>
                )}
                {member.winRate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">胜率</span>
                    <span className="text-orange-400 font-medium">{member.winRate}%</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm">
                    <i className="fas fa-edit mr-1"></i>
                    编辑
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
                    <i className="fas fa-eye mr-1"></i>
                    详情
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm">
                    <i className="fas fa-envelope mr-1"></i>
                    消息
                  </button>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>

        {/* 空状态 */}
        {filteredMembers.length === 0 && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-gray-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">没有找到匹配的会员</h3>
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
          <Link
            href="/members/invite"
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 tech-glow"
          >
            <i className="fas fa-user-plus"></i>
            邀请新会员
          </Link>
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 tech-glow">
            <i className="fas fa-download"></i>
            导出数据
          </button>
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 tech-glow">
            <i className="fas fa-envelope"></i>
            批量通知
          </button>
        </MotionDiv>
      </div>
    </div>
  );
}