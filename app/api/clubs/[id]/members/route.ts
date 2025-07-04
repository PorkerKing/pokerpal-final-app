// API 路由: /api/clubs/[id]/members
// 处理俱乐部成员管理

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  validateClubPermission,
  validateAdminPermission,
  validateRequestBody,
  createSuccessResponse,
  createPaginatedResponse,
  getPaginationParams,
  ApiError,
  generateTransactionReference
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { Role, MemberStatus, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

// GET /api/clubs/[id]/members - 获取俱乐部成员列表
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();
  
  // 验证用户是俱乐部成员
  await validateClubPermission((session as any).user.id, params.id);

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') as Role;
  const status = searchParams.get('status') as MemberStatus;
  const search = searchParams.get('search');
  
  const { page, limit, orderBy, orderDir } = getPaginationParams(request);

  // 构建查询条件
  const where: any = { clubId: params.id };
  
  if (role) {
    where.role = role;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } }
    ];
  }

  // 获取总数
  const total = await prisma.clubMember.count({ where });

  // 获取成员列表
  const members = await prisma.clubMember.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          lastLoginAt: true
        }
      },
      club: {
        select: { name: true, currency: true }
      }
    },
    orderBy: { [orderBy!]: orderDir },
    skip: (page! - 1) * limit!,
    take: limit
  });

  return createPaginatedResponse(members, page!, limit!, total);
});

// POST /api/clubs/[id]/members - 邀请新成员
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();
  
  // 验证管理员权限
  await validateAdminPermission((session as any).user.id, params.id);

  const body = await validateRequestBody<{
    userEmail: string;
    role?: Role;
    initialBalance?: number;
    notes?: string;
  }>(request, ['userEmail']);

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email: body.userEmail }
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // 检查用户是否已经是成员
  const existingMember = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: params.id,
        userId: user.id
      }
    }
  });

  if (existingMember) {
    throw new ApiError('User is already a member of this club', 400);
  }

  // 创建成员记录
  const member = await prisma.$transaction(async (tx) => {
    const newMember = await tx.clubMember.create({
      data: {
        clubId: params.id,
        userId: user.id,
        role: body.role || Role.MEMBER,
        status: MemberStatus.ACTIVE,
        balance: body.initialBalance || 0,
        notes: body.notes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // 如果设置了初始余额，记录交易
    if (body.initialBalance && body.initialBalance > 0) {
      await tx.transaction.create({
        data: {
          userId: user.id,
          clubId: params.id,
          type: TransactionType.DEPOSIT,
          amount: new Decimal(body.initialBalance),
          balanceBefore: new Decimal(0),
          balanceAfter: new Decimal(body.initialBalance),
          description: 'Initial balance deposit',
          reference: generateTransactionReference()
        }
      });
    }

    return newMember;
  });

  return createSuccessResponse(member, 'Member added successfully');
});

// PUT /api/clubs/[id]/members/[userId] - 更新成员信息
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) => {
  const session = await validateSession();
  
  // 验证管理员权限
  await validateAdminPermission((session as any).user.id, params.id);

  const body = await validateRequestBody<{
    role?: Role;
    status?: MemberStatus;
    vipLevel?: number;
    notes?: string;
    balanceAdjustment?: {
      amount: number;
      description: string;
      type: 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT';
    };
  }>(request);

  // 获取当前成员信息
  const currentMember = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: params.id,
        userId: params.userId
      }
    }
  });

  if (!currentMember) {
    throw new ApiError('Member not found', 404);
  }

  // 执行更新
  const updatedMember = await prisma.$transaction(async (tx) => {
    const updateData: any = {};
    
    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.vipLevel !== undefined) updateData.vipLevel = body.vipLevel;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // 处理余额调整
    if (body.balanceAdjustment) {
      const { amount, description, type } = body.balanceAdjustment;
      const adjustmentAmount = new Decimal(amount);
      
      if (type === 'WITHDRAWAL' && adjustmentAmount.gt(currentMember.balance)) {
        throw new ApiError('Insufficient balance for withdrawal', 400);
      }

      const balanceChange = type === 'WITHDRAWAL' 
        ? adjustmentAmount.negated() 
        : adjustmentAmount;

      updateData.balance = {
        increment: balanceChange
      };

      // 记录交易
      await tx.transaction.create({
        data: {
          userId: params.userId,
          clubId: params.id,
          type: type === 'DEPOSIT' ? TransactionType.DEPOSIT :
                type === 'WITHDRAWAL' ? TransactionType.WITHDRAWAL :
                TransactionType.ADJUSTMENT,
          amount: type === 'WITHDRAWAL' ? adjustmentAmount.negated() : adjustmentAmount,
          balanceBefore: currentMember.balance,
          balanceAfter: new Decimal(currentMember.balance).add(balanceChange),
          description,
          reference: generateTransactionReference()
        }
      });
    }

    return await tx.clubMember.update({
      where: {
        clubId_userId: {
          clubId: params.id,
          userId: params.userId
        }
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
  });

  return createSuccessResponse(updatedMember, 'Member updated successfully');
});

// DELETE /api/clubs/[id]/members/[userId] - 移除成员
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) => {
  const session = await validateSession();
  
  // 验证管理员权限
  await validateAdminPermission((session as any).user.id, params.id);

  // 不能移除自己
  if (params.userId === (session as any).user.id) {
    throw new ApiError('Cannot remove yourself from the club', 400);
  }

  const member = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId: params.id,
        userId: params.userId
      }
    }
  });

  if (!member) {
    throw new ApiError('Member not found', 404);
  }

  // 检查是否有未完成的活动
  const activeActivities = await prisma.tournamentPlayer.count({
    where: {
      userId: params.userId,
      tournament: {
        clubId: params.id,
        status: {
          in: ['SCHEDULED', 'REGISTERING', 'IN_PROGRESS']
        }
      }
    }
  });

  if (activeActivities > 0) {
    throw new ApiError('Cannot remove member with active tournament registrations', 400);
  }

  // 检查余额
  if (new Decimal(member.balance).gt(0)) {
    throw new ApiError('Cannot remove member with positive balance', 400);
  }

  await prisma.clubMember.delete({
    where: {
      clubId_userId: {
        clubId: params.id,
        userId: params.userId
      }
    }
  });

  return createSuccessResponse(null, 'Member removed successfully');
});