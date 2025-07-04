// API 路由: /api/clubs/[id]/blind-structures
// 获取俱乐部的盲注结构

import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateSession,
  validateClubPermission,
  createSuccessResponse,
  ApiError
} from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/clubs/[id]/blind-structures - 获取盲注结构列表
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await validateSession();
  
  // 验证俱乐部权限
  await validateClubPermission((session as any).user.id, params.id);

  const blindStructures = await prisma.blindStructure.findMany({
    where: { clubId: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      levels: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return createSuccessResponse({ items: blindStructures });
});