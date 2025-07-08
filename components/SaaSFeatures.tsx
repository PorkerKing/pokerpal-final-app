"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Trophy,
  TrendingUp,
  Bell,
  Shield,
  Zap,
  Clock,
  Star,
  Target,
  Activity,
  PieChart,
  Calendar,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  members: {
    total: number;
    active: number;
    new: number;
  };
  tournaments: {
    running: number;
    completed: number;
    upcoming: number;
  };
  engagement: {
    avgSessionTime: string;
    returnRate: number;
    satisfaction: number;
  };
}

interface SaaSFeaturesProps {
  className?: string;
}

export default function SaaSFeatures({ className }: SaaSFeaturesProps) {
  const t = useTranslations('SaaS');
  const [activeTab, setActiveTab] = useState('analytics');
  const [timeRange, setTimeRange] = useState('7d');

  // 模拟数据
  const analytics: AnalyticsData = {
    revenue: {
      current: 125600,
      previous: 98400,
      change: 27.6
    },
    members: {
      total: 486,
      active: 342,
      new: 24
    },
    tournaments: {
      running: 8,
      completed: 156,
      upcoming: 12
    },
    engagement: {
      avgSessionTime: '2h 34m',
      returnRate: 78.5,
      satisfaction: 4.6
    }
  };

  // 关键指标卡片
  const metricCards: MetricCard[] = [
    {
      id: 'revenue',
      title: '总收入',
      value: `¥${analytics.revenue.current.toLocaleString()}`,
      change: analytics.revenue.change,
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'members',
      title: '活跃会员',
      value: analytics.members.active,
      change: 8.2,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'tournaments',
      title: '正在进行的比赛',
      value: analytics.tournaments.running,
      change: -2.1,
      trend: 'down',
      icon: Trophy,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'satisfaction',
      title: '用户满意度',
      value: `${analytics.engagement.satisfaction}/5.0`,
      change: 0.3,
      trend: 'up',
      icon: Star,
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  // 功能特性列表
  const features = [
    {
      category: '数据分析',
      items: [
        { icon: BarChart3, title: '实时数据仪表板', description: '实时监控关键业务指标' },
        { icon: PieChart, title: '深度分析报告', description: '自动生成详细的业务分析报告' },
        { icon: TrendingUp, title: '趋势预测', description: '基于AI的业务趋势预测分析' },
        { icon: Target, title: '目标跟踪', description: '设定和跟踪业务目标完成情况' }
      ]
    },
    {
      category: '用户管理',
      items: [
        { icon: Users, title: '会员生命周期管理', description: '从注册到流失的全生命周期管理' },
        { icon: Shield, title: '角色权限控制', description: '细粒度的角色权限管理系统' },
        { icon: Activity, title: '行为分析', description: '用户行为数据分析和洞察' },
        { icon: Bell, title: '智能通知系统', description: '个性化推送和通知管理' }
      ]
    },
    {
      category: '业务优化',
      items: [
        { icon: Zap, title: '自动化流程', description: '业务流程自动化和优化' },
        { icon: Calendar, title: '智能排程', description: 'AI驱动的赛事和活动排程' },
        { icon: MessageSquare, title: '客户服务', description: '集成的客户服务和支持系统' },
        { icon: Settings, title: '个性化配置', description: '灵活的业务规则和配置管理' }
      ]
    }
  ];

  const tabs = [
    { id: 'analytics', label: '数据分析', icon: BarChart3 },
    { id: 'features', label: '功能特性', icon: Zap },
    { id: 'automation', label: '自动化', icon: Settings },
    { id: 'insights', label: '智能洞察', icon: Target }
  ];

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* 时间范围选择器 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">业务分析概览</h3>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm transition-colors",
                timeRange === range
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 关键指标卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center",
                  card.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {card.change !== undefined && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(card.trend)}
                    <span className={cn("text-sm font-medium", getTrendColor(card.trend))}>
                      {card.change > 0 ? '+' : ''}{card.change}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">{card.title}</h4>
                <p className="text-white text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 详细分析图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 收入趋势 */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            收入趋势分析
          </h4>
          <div className="h-48 bg-gray-900/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">图表组件集成中...</p>
          </div>
        </div>

        {/* 用户活跃度 */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            用户活跃度
          </h4>
          <div className="h-48 bg-gray-900/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">图表组件集成中...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-8">
      {features.map((category) => (
        <div key={category.category}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" />
            {category.category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">智能自动化系统</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          基于AI的业务流程自动化，提升运营效率，减少人工干预
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
          <h4 className="text-white font-semibold mb-2">自动报名处理</h4>
          <p className="text-gray-400 text-sm">自动处理比赛报名，智能分配座位</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <Clock className="w-8 h-8 text-blue-400 mb-4" />
          <h4 className="text-white font-semibold mb-2">定时任务调度</h4>
          <p className="text-gray-400 text-sm">自动化的任务调度和执行</p>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <Bell className="w-8 h-8 text-yellow-400 mb-4" />
          <h4 className="text-white font-semibold mb-2">智能通知系统</h4>
          <p className="text-gray-400 text-sm">个性化的用户通知和提醒</p>
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">AI 智能洞察</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          基于大数据分析的业务洞察，帮助您做出更明智的决策
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4">用户行为预测</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">流失风险预警</span>
              <span className="text-red-400">15 位用户</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">高价值用户识别</span>
              <span className="text-green-400">32 位用户</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">活跃度提升潜力</span>
              <span className="text-blue-400">128 位用户</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4">业务优化建议</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-white text-sm">周末赛事参与度偏低</p>
                <p className="text-gray-400 text-xs">建议增加特色活动</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-white text-sm">新用户留存率提升</p>
                <p className="text-gray-400 text-xs">引导流程优化见效</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white text-sm">收入增长趋势良好</p>
                <p className="text-gray-400 text-xs">建议保持当前策略</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return renderAnalytics();
      case 'features':
        return renderFeatures();
      case 'automation':
        return renderAutomation();
      case 'insights':
        return renderInsights();
      default:
        return renderAnalytics();
    }
  };

  return (
    <div className={cn("bg-gray-900/50 rounded-xl border border-gray-700", className)}>
      {/* 标签页导航 */}
      <div className="border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap",
                  "border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-400 bg-purple-500/10"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}