"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  Crown,
  Award,
  CheckCircle,
  Lock,
  Calendar,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';
  pointsReward: number;
  requirement: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
  icon: string;
}

const categoryIcons = {
  TOURNAMENT: Trophy,
  SOCIAL: Users,
  SKILL: Target,
  MILESTONE: Star,
  SPECIAL: Crown
};

const difficultyColors = {
  EASY: 'text-green-600 bg-green-100 border-green-200',
  MEDIUM: 'text-blue-600 bg-blue-100 border-blue-200',
  HARD: 'text-purple-600 bg-purple-100 border-purple-200',
  LEGENDARY: 'text-yellow-600 bg-yellow-100 border-yellow-200'
};

const achievementIcons = {
  first_win: Trophy,
  social_butterfly: Users,
  high_roller: DollarSign,
  tournament_master: Crown,
  lucky_seven: Star,
  perfectionist: Target,
  marathon_player: TrendingUp,
  club_veteran: Medal
};

export default function AchievementsPage() {
  const t = useTranslations('Achievements');
  const { selectedClub, user } = useUserStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // 示例成就数据
  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      name: '首胜荣耀',
      description: '在俱乐部中赢得第一场锦标赛',
      category: 'TOURNAMENT',
      difficulty: 'EASY',
      pointsReward: 1000,
      requirement: '赢得1场锦标赛',
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
      unlockedAt: '2024-01-15',
      icon: 'first_win'
    },
    {
      id: '2',
      name: '社交达人',
      description: '与10名不同的玩家进行游戏',
      category: 'SOCIAL',
      difficulty: 'MEDIUM',
      pointsReward: 2500,
      requirement: '与10名玩家游戏',
      isUnlocked: false,
      progress: 7,
      maxProgress: 10,
      icon: 'social_butterfly'
    },
    {
      id: '3',
      name: '高额玩家',
      description: '在单场游戏中下注超过10,000筹码',
      category: 'SKILL',
      difficulty: 'HARD',
      pointsReward: 5000,
      requirement: '单次下注10,000+',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      icon: 'high_roller'
    },
    {
      id: '4',
      name: '锦标赛大师',
      description: '连续赢得3场锦标赛',
      category: 'TOURNAMENT',
      difficulty: 'LEGENDARY',
      pointsReward: 15000,
      requirement: '连胜3场锦标赛',
      isUnlocked: false,
      progress: 1,
      maxProgress: 3,
      icon: 'tournament_master'
    },
    {
      id: '5',
      name: '幸运七号',
      description: '用777的牌型赢得一手牌',
      category: 'SPECIAL',
      difficulty: 'MEDIUM',
      pointsReward: 3500,
      requirement: '用777获胜',
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
      unlockedAt: '2024-02-01',
      icon: 'lucky_seven'
    },
    {
      id: '6',
      name: '完美主义者',
      description: '在一场锦标赛中不被淘汰直至决赛桌',
      category: 'SKILL',
      difficulty: 'HARD',
      pointsReward: 7500,
      requirement: '进入决赛桌',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      icon: 'perfectionist'
    },
    {
      id: '7',
      name: '马拉松选手',
      description: '连续游戏超过6小时',
      category: 'MILESTONE',
      difficulty: 'MEDIUM',
      pointsReward: 4000,
      requirement: '连续游戏6小时',
      isUnlocked: false,
      progress: 3.5,
      maxProgress: 6,
      icon: 'marathon_player'
    },
    {
      id: '8',
      name: '俱乐部元老',
      description: '加入俱乐部满100天',
      category: 'MILESTONE',
      difficulty: 'EASY',
      pointsReward: 2000,
      requirement: '会员100天',
      isUnlocked: false,
      progress: 45,
      maxProgress: 100,
      icon: 'club_veteran'
    }
  ];

  useEffect(() => {
    if (!selectedClub) return;
    
    // 模拟加载数据
    setTimeout(() => {
      setAchievements(sampleAchievements);
      const completed = sampleAchievements.filter(a => a.isUnlocked);
      setCompletedCount(completed.length);
      setTotalPoints(completed.reduce((sum, a) => sum + a.pointsReward, 0));
      setLoading(false);
    }, 500);
  }, [selectedClub]);

  // 筛选成就
  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || achievement.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  // 渲染成就卡片
  const renderAchievementCard = (achievement: Achievement) => {
    const IconComponent = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy;
    const CategoryIcon = categoryIcons[achievement.category as keyof typeof categoryIcons];
    const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

    return (
      <div 
        key={achievement.id} 
        className={cn(
          "relative p-6 rounded-lg border-2 transition-all duration-200",
          achievement.isUnlocked 
            ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md" 
            : "bg-white border-gray-200 hover:shadow-md"
        )}
      >
        {/* 解锁状态指示器 */}
        <div className="absolute top-4 right-4">
          {achievement.isUnlocked ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Lock className="h-6 w-6 text-gray-400" />
          )}
        </div>

        {/* 成就图标和标题 */}
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            achievement.isUnlocked 
              ? "bg-yellow-100 text-yellow-600" 
              : "bg-gray-100 text-gray-500"
          )}>
            <IconComponent className="h-8 w-8" />
          </div>
          
          <div className="flex-1">
            <h3 className={cn(
              "text-lg font-semibold mb-1",
              achievement.isUnlocked ? "text-gray-900" : "text-gray-600"
            )}>
              {achievement.name}
            </h3>
            <p className={cn(
              "text-sm",
              achievement.isUnlocked ? "text-gray-700" : "text-gray-500"
            )}>
              {achievement.description}
            </p>
          </div>
        </div>

        {/* 分类和难度标签 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            <CategoryIcon className="h-3 w-3" />
            {t(`categories.${achievement.category.toLowerCase()}`)}
          </span>
          <span className={cn(
            "px-2 py-1 text-xs rounded-full border",
            difficultyColors[achievement.difficulty]
          )}>
            {t(`difficulty.${achievement.difficulty.toLowerCase()}`)}
          </span>
        </div>

        {/* 进度条 */}
        {!achievement.isUnlocked && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{t('progress')}</span>
              <span>{achievement.progress} / {achievement.maxProgress}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 奖励积分 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="h-4 w-4" />
            <span className="font-semibold">{achievement.pointsReward.toLocaleString()}</span>
            <span className="text-xs">{t('points')}</span>
          </div>

          {/* 解锁时间 */}
          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Calendar className="h-3 w-3" />
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!selectedClub) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_club_selected.title')}</h3>
          <p className="text-gray-500">{t('no_club_selected.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏆 {t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-purple-700">{completedCount}</div>
            <div className="text-xs text-purple-600">{t('completed')}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-yellow-700">{totalPoints.toLocaleString()}</div>
            <div className="text-xs text-yellow-600">{t('earned_points')}</div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">{t('filters.all_categories')}</option>
          <option value="TOURNAMENT">{t('categories.tournament')}</option>
          <option value="SOCIAL">{t('categories.social')}</option>
          <option value="SKILL">{t('categories.skill')}</option>
          <option value="MILESTONE">{t('categories.milestone')}</option>
          <option value="SPECIAL">{t('categories.special')}</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">{t('filters.all_difficulties')}</option>
          <option value="EASY">{t('difficulty.easy')}</option>
          <option value="MEDIUM">{t('difficulty.medium')}</option>
          <option value="HARD">{t('difficulty.hard')}</option>
          <option value="LEGENDARY">{t('difficulty.legendary')}</option>
        </select>
      </div>

      {/* 成就列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(renderAchievementCard)}
        </div>
      )}

      {/* 成就说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">{t('info.title')}</h3>
        <p className="text-blue-700 text-sm mb-3">{t('info.description')}</p>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• {t('info.earn_points')}</li>
          <li>• {t('info.track_progress')}</li>
          <li>• {t('info.show_status')}</li>
        </ul>
      </div>
    </div>
  );
}