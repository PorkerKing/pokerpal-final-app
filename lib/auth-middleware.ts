import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// 用户角色权限级别定义
const ROLE_LEVELS = {
  GUEST: 0,
  MEMBER: 1,
  VIP: 2,
  DEALER: 3,
  CASHIER: 4,
  MANAGER: 5,
  ADMIN: 6,
  OWNER: 7
};

// 基础认证检查
export async function validateAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      success: false,
      error: 'Unauthorized',
      status: 401
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return {
      success: false,
      error: 'User not found',
      status: 404
    };
  }

  return {
    success: true,
    user,
    session
  };
}

// 俱乐部成员权限验证
export async function validateClubPermission(
  request: NextRequest, 
  clubId: string, 
  requiredRoles: string[] = ['MEMBER']
) {
  const authResult = await validateAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  const membership = await prisma.clubMember.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId: authResult.user.id
      }
    },
    include: {
      club: true
    }
  });

  if (!membership) {
    return {
      success: false,
      error: 'Not a member of this club',
      status: 403
    };
  }

  if (membership.status !== 'ACTIVE') {
    return {
      success: false,
      error: 'Club membership is not active',
      status: 403
    };
  }

  // 检查角色权限
  const userRoleLevel = ROLE_LEVELS[membership.role as keyof typeof ROLE_LEVELS] || 0;
  const minRequiredLevel = Math.min(...requiredRoles.map(role => 
    ROLE_LEVELS[role as keyof typeof ROLE_LEVELS] || 0
  ));

  if (userRoleLevel < minRequiredLevel) {
    return {
      success: false,
      error: 'Insufficient permissions',
      status: 403
    };
  }

  return {
    success: true,
    user: authResult.user,
    session: authResult.session,
    membership,
    club: membership.club
  };
}

// 管理员权限验证
export async function validateAdminPermission(request: NextRequest, clubId: string) {
  return validateClubPermission(request, clubId, ['ADMIN', 'OWNER']);
}

// 经理级别权限验证
export async function validateManagerPermission(request: NextRequest, clubId: string) {
  return validateClubPermission(request, clubId, ['MANAGER', 'ADMIN', 'OWNER']);
}

// 财务权限验证
export async function validateFinancePermission(request: NextRequest, clubId: string) {
  return validateClubPermission(request, clubId, ['CASHIER', 'MANAGER', 'ADMIN', 'OWNER']);
}

// 错误响应辅助函数
export function createErrorResponse(message: string, status: number = 400) {
  return Response.json({
    success: false,
    message,
    error: message
  }, { status });
}