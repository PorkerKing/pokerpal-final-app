// API 路由: /api/tournaments/[id]/register
// 处理锦标赛报名相关操作

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  validateClubPermission,
  createSuccessResponse,
  ApiError,
  generateTransactionReference
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { TournamentStatus, TransactionType, MemberStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// POST /api/tournaments/[id]/register - 报名锦标赛
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      clubId: true,
      name: true,
      buyIn: true,
      fee: true,
      status: true,
      startTime: true,
      lateRegEndTime: true,
      maxPlayers: true,
      _count: { select: { players: true } }
    }
  });

  if (!tournament) {
    throw new ApiError('Tournament not found', 404);
  }

  // 验证用户是俱乐部成员
  const { membership } = await validateClubPermission(
    (session as any).user.id, 
    tournament.clubId, 
    'MEMBER'
  );

  // 验证锦标赛状态
  if (tournament.status !== TournamentStatus.SCHEDULED && 
      tournament.status !== TournamentStatus.REGISTERING) {
    throw new ApiError('Tournament registration is not open', 400);
  }

  // 验证报名截止时间
  const now = new Date();
  if (tournament.lateRegEndTime && now > tournament.lateRegEndTime) {
    throw new ApiError('Late registration has ended', 400);
  }

  // 验证人数限制
  if (tournament.maxPlayers && tournament._count.players >= tournament.maxPlayers) {
    throw new ApiError('Tournament is full', 400);
  }

  // 检查是否已经报名
  const existingRegistration = await prisma.tournamentPlayer.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId: params.id,
        userId: (session as any).user.id
      }
    }
  });

  if (existingRegistration) {
    throw new ApiError('Already registered for this tournament', 400);
  }

  // 计算总费用
  const totalCost = new Decimal(tournament.buyIn).add(new Decimal(tournament.fee));

  // 验证余额
  if (new Decimal(membership.balance).lt(totalCost)) {
    throw new ApiError(
      `Insufficient balance. Required: ${totalCost}, Available: ${membership.balance}`, 
      400
    );
  }

  // 执行事务：报名 + 扣款 + 记录交易
  const result = await prisma.$transaction(async (tx) => {
    // 创建报名记录
    const registration = await tx.tournamentPlayer.create({
      data: {
        tournamentId: params.id,
        userId: (session as any).user.id,
        registrationTime: now
      },
      include: {
        user: {
          select: { name: true, image: true }
        },
        tournament: {
          select: { name: true }
        }
      }
    });

    // 更新会员余额
    const updatedMember = await tx.clubMember.update({
      where: {
        clubId_userId: {
          clubId: tournament.clubId,
          userId: (session as any).user.id
        }
      },
      data: {
        balance: { decrement: totalCost }
      }
    });

    // 记录交易
    await tx.transaction.create({
      data: {
        userId: (session as any).user.id,
        clubId: tournament.clubId,
        type: TransactionType.TOURNAMENT_BUYIN,
        amount: totalCost.negated(),
        balanceBefore: new Decimal(membership.balance),
        balanceAfter: updatedMember.balance,
        description: `Tournament registration: ${tournament.name}`,
        reference: generateTransactionReference()
      }
    });

    // 如果这是第一个报名者，将锦标赛状态更新为 REGISTERING
    if (tournament.status === TournamentStatus.SCHEDULED) {
      await tx.tournament.update({
        where: { id: params.id },
        data: { status: TournamentStatus.REGISTERING }
      });
    }

    return {
      registration,
      newBalance: updatedMember.balance,
      totalCost
    };
  });

  return createSuccessResponse({
    registration: result.registration,
    newBalance: result.newBalance,
    amountCharged: result.totalCost
  }, 'Successfully registered for tournament');
});

// DELETE /api/tournaments/[id]/register - 取消报名
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      clubId: true,
      name: true,
      buyIn: true,
      fee: true,
      status: true,
      startTime: true
    }
  });

  if (!tournament) {
    throw new ApiError('Tournament not found', 404);
  }

  // 验证用户是俱乐部成员
  const { membership } = await validateClubPermission(
    (session as any).user.id, 
    tournament.clubId, 
    'MEMBER'
  );

  // 检查报名记录
  const registration = await prisma.tournamentPlayer.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId: params.id,
        userId: (session as any).user.id
      }
    }
  });

  if (!registration) {
    throw new ApiError('Not registered for this tournament', 400);
  }

  // 验证是否可以取消报名（通常锦标赛开始前30分钟停止取消报名）
  const cancelDeadline = new Date(tournament.startTime.getTime() - 30 * 60 * 1000); // 开始前30分钟
  if (new Date() > cancelDeadline) {
    throw new ApiError('Registration cancellation deadline has passed', 400);
  }

  // 验证锦标赛状态
  if (tournament.status === TournamentStatus.IN_PROGRESS || 
      tournament.status === TournamentStatus.COMPLETED) {
    throw new ApiError('Cannot cancel registration for ongoing or completed tournament', 400);
  }

  // 计算退款金额
  const refundAmount = new Decimal(tournament.buyIn).add(new Decimal(tournament.fee));

  // 执行事务：取消报名 + 退款 + 记录交易
  const result = await prisma.$transaction(async (tx) => {
    // 删除报名记录
    await tx.tournamentPlayer.delete({
      where: {
        tournamentId_userId: {
          tournamentId: params.id,
          userId: (session as any).user.id
        }
      }
    });

    // 更新会员余额
    const updatedMember = await tx.clubMember.update({
      where: {
        clubId_userId: {
          clubId: tournament.clubId,
          userId: (session as any).user.id
        }
      },
      data: {
        balance: { increment: refundAmount }
      }
    });

    // 记录退款交易
    await tx.transaction.create({
      data: {
        userId: (session as any).user.id,
        clubId: tournament.clubId,
        type: TransactionType.TOURNAMENT_CASHOUT,
        amount: refundAmount,
        balanceBefore: new Decimal(membership.balance),
        balanceAfter: updatedMember.balance,
        description: `Tournament registration refund: ${tournament.name}`,
        reference: generateTransactionReference()
      }
    });

    return {
      newBalance: updatedMember.balance,
      refundAmount
    };
  });

  return createSuccessResponse({
    newBalance: result.newBalance,
    refundAmount: result.refundAmount
  }, 'Tournament registration cancelled successfully');
});