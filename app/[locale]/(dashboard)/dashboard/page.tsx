"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useSelectedClub } from '@/stores/userStore';
import AIChat from '@/components/AIChat';
import { motion } from 'framer-motion';

// 引入Framer Motion
const MotionDiv = motion.div;

export default function DashboardPage() {
  const { data: session } = useSession();
  const t = useTranslations('Dashboard');
  const selectedClub = useSelectedClub();
  const { stats, loading, error } = useDashboardData();
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  // 模拟数据
  const dashboardData = {
    totalRevenue: 125600,
    activeMembers: 342,
    runningTournaments: 8,
    userSatisfaction: 4.6,
    recentTransactions: [
      { id: 1, amount: 2500, type: 'win', user: '张三', time: '2小时前' },
      { id: 2, amount: 1800, type: 'deposit', user: '李四', time: '3小时前' },
      { id: 3, amount: 950, type: 'win', user: '王五', time: '4小时前' },
    ],
    topPlayers: [
      { name: '张三', wins: 15, earnings: 25800 },
      { name: '李四', wins: 12, earnings: 18500 },
      { name: '王五', wins: 10, earnings: 15200 },
    ]
  };

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

    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  // 加载CDN资源
  useEffect(() => {
    // 加载Framer Motion
    const script = document.createElement('script');
    script.src = 'https://cdn.skypack.dev/framer-motion';
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
          <h1 className="hero-text mb-2">仪表板</h1>
          <p className="text-gray-400 text-lg">欢迎回来，{session?.user?.name || '管理员'}</p>
        </MotionDiv>

        {/* Bento Grid 布局 */}
        <div className="bento-grid mb-8">
          {/* 总收入卡片 */}
          <MotionDiv
            initial="hidden"
            animate={visibleCards.has(0) ? "visible" : "hidden"}
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="dashboard-card bento-wide data-card gradient-green"
            data-index="0"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-dollar-sign text-green-400 text-xl icon-glow"></i>
              </div>
              <span className="text-green-400 text-sm font-medium">+12.5%</span>
            </div>
            <div className="hero-number text-green-400">¥{dashboardData.totalRevenue.toLocaleString()}</div>
            <p className="text-gray-300 text-lg mt-2">总收入</p>
            <div className="line-chart mt-4"></div>
          </MotionDiv>

          {/* 活跃会员卡片 */}
          <MotionDiv
            initial="hidden"
            animate={visibleCards.has(1) ? "visible" : "hidden"}
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="dashboard-card data-card gradient-blue"
            data-index="1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-blue-400 text-xl icon-glow"></i>
              </div>
              <span className="text-blue-400 text-sm font-medium">+8.2%</span>
            </div>
            <div className="hero-number text-blue-400">{dashboardData.activeMembers}</div>
            <p className="text-gray-300 text-lg mt-2">活跃会员</p>
          </MotionDiv>

          {/* 进行中的比赛 */}
          <MotionDiv
            initial="hidden"
            animate={visibleCards.has(2) ? "visible" : "hidden"}
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="dashboard-card data-card gradient-purple"
            data-index="2"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-trophy text-purple-400 text-xl icon-glow"></i>
              </div>
              <span className="text-purple-400 text-sm font-medium">实时</span>
            </div>
            <div className="hero-number text-purple-400">{dashboardData.runningTournaments}</div>
            <p className="text-gray-300 text-lg mt-2">进行中的比赛</p>
          </MotionDiv>

          {/* 用户满意度 */}
          <MotionDiv
            initial="hidden"
            animate={visibleCards.has(3) ? "visible" : "hidden"}
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="dashboard-card data-card gradient-orange"
            data-index="3"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-star text-orange-400 text-xl icon-glow"></i>
              </div>
              <span className="text-orange-400 text-sm font-medium">优秀</span>
            </div>
            <div className="hero-number text-orange-400">{dashboardData.userSatisfaction}</div>
            <p className="text-gray-300 text-lg mt-2">用户满意度</p>
          </MotionDiv>

          {/* 最近交易 */}
          <MotionDiv
            initial="hidden"
            animate={visibleCards.has(4) ? "visible" : "hidden"}
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="dashboard-card bento-tall data-card"
            data-index="4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">最近交易</h3>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-exchange-alt text-purple-400 icon-glow"></i>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction, index) => (
                <MotionDiv
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'win' ? 'bg-green-500/20' : 'bg-blue-500/20'
                    }`}>
                      <i className={`fas ${transaction.type === 'win' ? 'fa-trophy' : 'fa-plus'} text-sm ${
                        transaction.type === 'win' ? 'text-green-400' : 'text-blue-400'
                      }`}></i>
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.user}</p>
                      <p className="text-gray-400 text-sm">{transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'win' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      +¥{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">{transaction.type === 'win' ? '赢得' : '充值'}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </MotionDiv>

          {/* 顶级玩家 */}
          <MotionDiv
            initial="hidden"
            animate={visibleCards.has(5) ? "visible" : "hidden"}
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="dashboard-card bento-wide data-card"
            data-index="5"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">顶级玩家</h3>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-medal text-yellow-400 icon-glow"></i>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.topPlayers.map((player, index) => (
                <MotionDiv
                  key={player.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{player.name}</p>
                      <p className="text-gray-400 text-sm">{player.wins} 胜</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">¥{player.earnings.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">总收益</p>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </MotionDiv>

          {/* AI助手聊天 */}
          <MotionDiv
            initial="hidden"
            animate={visibleCards.has(6) ? "visible" : "hidden"}
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="dashboard-card bento-large data-card"
            data-index="6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">AI助手</h3>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-robot text-white icon-glow"></i>
              </div>
            </div>
            <div className="h-96 bg-black/20 rounded-xl border border-white/10 overflow-hidden">
              <AIChat 
                context="dashboard"
                placeholder="您好！我是 PokerPal AI 助手，可以帮您分析数据、管理俱乐部..."
              />
            </div>
          </MotionDiv>
        </div>

        {/* 快速操作按钮 */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap gap-4 mt-8"
        >
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 tech-glow">
            <i className="fas fa-plus"></i>
            创建比赛
          </button>
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 tech-glow">
            <i className="fas fa-user-plus"></i>
            邀请会员
          </button>
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 tech-glow">
            <i className="fas fa-chart-line"></i>
            查看报表
          </button>
        </MotionDiv>
      </div>
    </div>
  );
}