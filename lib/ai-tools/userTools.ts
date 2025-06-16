import prisma from '@/lib/prisma';

export const getUserProfileAndStatsTool = {
  type: 'function' as const,
  function: {
    name: 'getUserProfileAndStats',
    description: '获取指定用户的个人资料、俱乐部角色和在当前激活的排行榜上的积分。',
    parameters: {
      type: 'object' as const,
      properties: {
        userId: { type: 'string', description: '需要查询的用户的唯一标识符(ID)。' },
        clubId: { type: 'string', description: '俱乐部的唯一标识符(ID)，用于查询特定俱乐部的角色和积分。' },
      },
      required: ['userId', 'clubId'],
    },
  },
};

export async function getUserProfileAndStats({ userId, clubId }: { userId: string; clubId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) return JSON.stringify({ error: 'User not found.' });

    const memberInfo = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
      select: { role: true },
    });
    if (!memberInfo) return JSON.stringify({ error: 'User is not a member of this club.' });

    const activeLeaderboard = await prisma.leaderboard.findFirst({
      where: {
        clubId,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    let points = 0;
    if (activeLeaderboard) {
      const entry = await prisma.leaderboardEntry.findUnique({
        where: {
          leaderboardId_userId: {
            leaderboardId: activeLeaderboard.id,
            userId,
          },
        },
      });
      points = entry?.points ?? 0;
    }

    return JSON.stringify({
      name: user.name,
      email: user.email,
      role: memberInfo.role,
      points: points,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return JSON.stringify({ error: '查询用户数据时发生错误。' });
  }
} 