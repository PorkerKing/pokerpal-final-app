import prisma from '@/lib/prisma';
import { TournamentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const listAvailableTournamentsTool = {
  type: 'function' as const,
  function: {
    name: 'listAvailableTournaments',
    description: '获取指定日期范围内可参加的锦标赛列表。如果不指定日期，则默认为今天。',
    parameters: {
      type: 'object' as const,
      properties: {
        date: { type: 'string', description: '查询的日期，格式为YYYY-MM-DD。' },
        clubId: { type: 'string', description: '俱乐部的唯一标识符(ID)。' }
      },
      required: ['clubId'],
    },
  },
};

export async function listAvailableTournaments({ date, clubId }: { date?: string; clubId: string }) {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const tournaments = await prisma.tournament.findMany({
      where: { clubId, startTime: { gte: startOfDay, lte: endOfDay } },
      select: { id: true, name: true, gameType: true, buyIn: true, fee: true, startTime: true, status: true },
      orderBy: { startTime: 'asc' },
    });

    if (tournaments.length === 0) return JSON.stringify({ message: '该日期没有找到任何锦标赛。' });
    return JSON.stringify(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return JSON.stringify({ error: '查询锦标赛时发生错误。' });
  }
}

export const buyInForTournamentTool = {
  type: 'function' as const,
  function: {
    name: 'buyInForTournament',
    description: '为用户报名参加锦标赛，并从其俱乐部余额中扣除相应的买入费用（buy-in + fee）。',
    parameters: {
      type: 'object' as const,
      properties: {
        userId: { type: 'string' },
        tournamentId: { type: 'string' },
        clubId: { type: 'string' },
      },
      required: ['userId', 'tournamentId', 'clubId'],
    },
  },
};

export async function buyInForTournament({ userId, tournamentId, clubId }: { userId: string; tournamentId: string; clubId: string }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!tournament) throw new Error('锦标赛不存在。');
      if (tournament.status !== TournamentStatus.SCHEDULED && tournament.status !== TournamentStatus.REGISTERING) {
        throw new Error(`报名失败，该比赛当前状态为'${tournament.status}'，已无法报名。`);
      }
      const member = await tx.clubMember.findUnique({ where: { clubId_userId: { clubId, userId } } });
      if (!member) throw new Error('用户不是该俱乐部成员。');
      const totalCost = new Decimal(tournament.buyIn).add(new Decimal(tournament.fee));
      if (new Decimal(member.balance).lt(totalCost)) {
        throw new Error(`余额不足。需要 ${totalCost}，当前余额 ${member.balance}。`);
      }
      const existingRegistration = await tx.tournamentPlayer.findUnique({ where: { tournamentId_userId: { tournamentId, userId } } });
      if (existingRegistration) throw new Error('您已经报名参加了这场比赛。');
      await tx.tournamentPlayer.create({ data: { userId, tournamentId } });
      const updatedMember = await tx.clubMember.update({
        where: { clubId_userId: { clubId, userId } },
        data: { balance: { decrement: totalCost } },
      });
      await tx.transaction.create({
        data: { userId, type: 'TOURNAMENT_BUYIN', amount: totalCost.negated(), description: `报名锦标赛: ${tournament.name}` },
      });
      return JSON.stringify({ success: true, message: `成功报名'${tournament.name}'，已扣除费用 ${totalCost}。您的新余额为 ${updatedMember.balance}。` });
    });
  } catch (error: any) {
    console.error('Transaction failed in buyInForTournament:', error.message);
    return JSON.stringify({ success: false, error: error.message });
  }
} 