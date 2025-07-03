// API 工具函数和通用类型定义

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, MemberStatus } from '@prisma/client';

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 权限级别定义
export const ROLE_HIERARCHY: Record<Role, number> = {
  GUEST: 0,
  MEMBER: 1,
  VIP: 2,
  DEALER: 3,
  CASHIER: 4,
  MANAGER: 5,
  ADMIN: 6,
  OWNER: 7
};

// API 错误类
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 成功响应
export function createSuccessResponse<T>(
  data: T, 
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

// 错误响应
export function createErrorResponse(
  error: string,
  statusCode: number = 500
): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error
  }, { status: statusCode });
}

// 分页响应
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  return NextResponse.json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
}

// 获取分页参数
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);
  
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    orderBy: searchParams.get('orderBy') || 'createdAt',
    orderDir: (searchParams.get('orderDir') as 'asc' | 'desc') || 'desc'
  };
}

// 验证用户会话
export async function validateSession() {
  const session = await getServerSession(authOptions);
  if (!(session as any)?.user?.id) {
    throw new ApiError('Unauthorized', 401);
  }
  return session;
}

// 验证用户在俱乐部的权限
export async function validateClubPermission(
  userId: string,
  clubId: string,
  minRole: Role = 'MEMBER'
): Promise<{ membership: any; hasPermission: boolean }> {
  const membership = await prisma.clubMember.findFirst({
    where: {
      userId,
      clubId,
      status: MemberStatus.ACTIVE
    },
    include: {
      club: {
        select: { name: true, isActive: true }
      },
      user: {
        select: { name: true, email: true }
      }
    }
  });

  if (!membership) {
    throw new ApiError('Club membership not found', 403);
  }

  if (!membership.club.isActive) {
    throw new ApiError('Club is inactive', 403);
  }

  const hasPermission = ROLE_HIERARCHY[membership.role] >= ROLE_HIERARCHY[minRole];
  
  return { membership, hasPermission };
}

// 验证管理员权限
export async function validateAdminPermission(
  userId: string,
  clubId: string
): Promise<any> {
  const { membership, hasPermission } = await validateClubPermission(
    userId,
    clubId,
    'ADMIN'
  );

  if (!hasPermission) {
    throw new ApiError('Admin permission required', 403);
  }

  return membership;
}

// 验证所有者权限
export async function validateOwnerPermission(
  userId: string,
  clubId: string
): Promise<any> {
  const { membership, hasPermission } = await validateClubPermission(
    userId,
    clubId,
    'OWNER'
  );

  if (!hasPermission) {
    throw new ApiError('Owner permission required', 403);
  }

  return membership;
}

// API 路由包装器，自动处理错误
export function withErrorHandler(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ApiError) {
        return createErrorResponse(error.message, error.statusCode);
      }
      
      return createErrorResponse('Internal server error', 500);
    }
  };
}

// 验证请求体
export async function validateRequestBody<T>(
  request: NextRequest,
  requiredFields: string[] = []
): Promise<T> {
  let body: any;
  
  try {
    body = await request.json();
  } catch {
    throw new ApiError('Invalid JSON body', 400);
  }

  // 验证必需字段
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      throw new ApiError(`Missing required field: ${field}`, 400);
    }
  }

  return body as T;
}

// 格式化金额（确保两位小数）
export function formatAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

// 生成事务参考号
export function generateTransactionReference(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${random.toUpperCase()}`;
}

// 计算排行榜排名
export function calculateRank(entries: any[], valueField: string): any[] {
  return entries
    .sort((a, b) => b[valueField] - a[valueField])
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
}

// 验证日期范围
export function validateDateRange(startDate: string, endDate: string): { start: Date; end: Date } {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError('Invalid date format', 400);
  }

  if (start >= end) {
    throw new ApiError('Start date must be before end date', 400);
  }

  if (end > new Date()) {
    throw new ApiError('End date cannot be in the future', 400);
  }

  return { start, end };
}