import { prisma } from '@/lib/prisma';

// 积分奖励配置
const POINTS_CONFIG = {
  // 锦标赛相关
  TOURNAMENT_REGISTRATION: 100,      // 报名锦标赛
  TOURNAMENT_PARTICIPATION: 300,     // 参与完成锦标赛
  TOURNAMENT_TOP_10_PERCENT: 1000,   // 进入前10%
  TOURNAMENT_TOP_3: 2500,           // 前三名
  TOURNAMENT_WINNER: 5000,          // 冠军

  // 圆桌游戏相关
  RING_GAME_SESSION_HOUR: 50,       // 每小时圆桌游戏
  RING_GAME_PROFIT_BONUS: 0.01,     // 盈利的1%作为积分奖励

  // 社交相关
  FIRST_VISIT_DAILY: 20,            // 每日首次登录
  INVITE_FRIEND: 500,               // 邀请好友加入
  FRIEND_JOINS: 1000,               // 被邀请的好友成功加入

  // 成就相关
  ACHIEVEMENT_EASY: 200,            // 简单成就
  ACHIEVEMENT_MEDIUM: 500,          // 中等成就
  ACHIEVEMENT_HARD: 1500,           // 困难成就
  ACHIEVEMENT_LEGENDARY: 5000,      // 传奇成就

  // 消费相关
  SPENDING_BONUS_RATE: 0.005        // 消费金额的0.5%作为积分
};

/**
 * 奖励积分的通用函数
 */
export async function awardPoints(
  userId: string,
  clubId: string,
  points: number,
  reason: string,
  reference?: string
): Promise<{ success: boolean; newPoints?: number; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 获取当前积分
      const membership = await tx.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId,
            userId
          }
        }
      });

      if (!membership) {
        throw new Error('用户不是俱乐部成员');
      }

      const currentPoints = membership.points || 0;
      const newPoints = currentPoints + points;

      // 更新积分
      await tx.clubMember.update({
        where: {
          clubId_userId: {
            clubId,
            userId
          }
        },
        data: {
          points: newPoints
        }
      });

      // 创建交易记录
      await tx.transaction.create({
        data: {
          userId,
          clubId,
          type: 'POINTS_EARNED',
          amount: points,
          balanceBefore: currentPoints,
          balanceAfter: newPoints,
          description: reason,
          reference: reference || `AUTO-POINTS-${Date.now()}`
        }
      });

      return newPoints;
    });

    return { success: true, newPoints: result };
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

/**
 * 锦标赛报名积分奖励
 */
export async function awardTournamentRegistrationPoints(
  userId: string,
  clubId: string,
  tournamentName: string
) {
  return awardPoints(
    userId,
    clubId,
    POINTS_CONFIG.TOURNAMENT_REGISTRATION,
    `锦标赛报名：${tournamentName}`,
    `TOURNAMENT-REG-${Date.now()}`
  );
}

/**
 * 锦标赛参与完成积分奖励
 */
export async function awardTournamentParticipationPoints(
  userId: string,
  clubId: string,
  tournamentName: string
) {
  return awardPoints(
    userId,
    clubId,
    POINTS_CONFIG.TOURNAMENT_PARTICIPATION,
    `完成锦标赛：${tournamentName}`,
    `TOURNAMENT-FINISH-${Date.now()}`
  );
}

/**
 * 锦标赛排名积分奖励
 */
export async function awardTournamentRankingPoints(
  userId: string,
  clubId: string,
  tournamentName: string,
  finalRank: number,
  totalPlayers: number
) {
  let points = 0;
  let description = '';

  if (finalRank === 1) {
    points = POINTS_CONFIG.TOURNAMENT_WINNER;
    description = `锦标赛冠军：${tournamentName}`;
  } else if (finalRank <= 3) {
    points = POINTS_CONFIG.TOURNAMENT_TOP_3;
    description = `锦标赛前三名（第${finalRank}名）：${tournamentName}`;
  } else if (finalRank <= Math.ceil(totalPlayers * 0.1)) {
    points = POINTS_CONFIG.TOURNAMENT_TOP_10_PERCENT;
    description = `锦标赛前10%（第${finalRank}名）：${tournamentName}`;
  }

  if (points > 0) {
    return awardPoints(
      userId,
      clubId,
      points,
      description,
      `TOURNAMENT-RANK-${finalRank}-${Date.now()}`
    );
  }

  return { success: true, newPoints: 0 };
}

/**
 * 圆桌游戏时长积分奖励
 */
export async function awardRingGameTimePoints(
  userId: string,
  clubId: string,
  durationMinutes: number,
  tableName: string
) {
  const hours = Math.floor(durationMinutes / 60);
  if (hours < 1) return { success: true, newPoints: 0 };

  const points = hours * POINTS_CONFIG.RING_GAME_SESSION_HOUR;
  return awardPoints(
    userId,
    clubId,
    points,
    `圆桌游戏时长奖励（${hours}小时）：${tableName}`,
    `RING-TIME-${Date.now()}`
  );
}

/**
 * 圆桌游戏盈利积分奖励
 */
export async function awardRingGameProfitPoints(
  userId: string,
  clubId: string,
  profitAmount: number,
  tableName: string
) {
  if (profitAmount <= 0) return { success: true, newPoints: 0 };

  const points = Math.floor(profitAmount * POINTS_CONFIG.RING_GAME_PROFIT_BONUS);
  if (points < 1) return { success: true, newPoints: 0 };

  return awardPoints(
    userId,
    clubId,
    points,
    `圆桌游戏盈利奖励：${tableName}`,
    `RING-PROFIT-${Date.now()}`
  );
}

/**
 * 每日首次登录积分奖励
 */
export async function awardDailyLoginPoints(userId: string, clubId: string) {
  // 检查今天是否已经奖励过
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingReward = await prisma.transaction.findFirst({
    where: {
      userId,
      clubId,
      type: 'POINTS_EARNED',
      description: { contains: '每日首次登录' },
      timestamp: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  if (existingReward) {
    return { success: true, newPoints: 0 }; // 今天已经奖励过了
  }

  return awardPoints(
    userId,
    clubId,
    POINTS_CONFIG.FIRST_VISIT_DAILY,
    '每日首次登录奖励',
    `DAILY-LOGIN-${Date.now()}`
  );
}

/**
 * 成就解锁积分奖励
 */
export async function awardAchievementPoints(
  userId: string,
  clubId: string,
  achievementName: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'
) {
  const pointsMap = {
    EASY: POINTS_CONFIG.ACHIEVEMENT_EASY,
    MEDIUM: POINTS_CONFIG.ACHIEVEMENT_MEDIUM,
    HARD: POINTS_CONFIG.ACHIEVEMENT_HARD,
    LEGENDARY: POINTS_CONFIG.ACHIEVEMENT_LEGENDARY
  };

  const points = pointsMap[difficulty];
  return awardPoints(
    userId,
    clubId,
    points,
    `解锁成就：${achievementName}`,
    `ACHIEVEMENT-${difficulty}-${Date.now()}`
  );
}

/**
 * 邀请好友积分奖励
 */
export async function awardInviteFriendPoints(
  userId: string,
  clubId: string,
  invitedUserName: string
) {
  return awardPoints(
    userId,
    clubId,
    POINTS_CONFIG.INVITE_FRIEND,
    `邀请好友加入：${invitedUserName}`,
    `INVITE-FRIEND-${Date.now()}`
  );
}

/**
 * 消费积分奖励
 */
export async function awardSpendingBonusPoints(
  userId: string,
  clubId: string,
  spentAmount: number,
  description: string
) {
  const points = Math.floor(spentAmount * POINTS_CONFIG.SPENDING_BONUS_RATE);
  if (points < 1) return { success: true, newPoints: 0 };

  return awardPoints(
    userId,
    clubId,
    points,
    `消费奖励：${description}`,
    `SPENDING-BONUS-${Date.now()}`
  );
}

export { POINTS_CONFIG };