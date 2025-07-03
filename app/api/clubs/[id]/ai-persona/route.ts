import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 获取AI Persona设置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const clubId = params.id;

    // 检查用户是否有权限访问该俱乐部
    const membership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: clubId,
          userId: (session as any).user.id
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ success: false, error: 'Club not found' }, { status: 404 });
    }

    // 获取AI Persona设置
    const aiPersona = await prisma.aIPersona.findUnique({
      where: { clubId: clubId }
    });

    return NextResponse.json({
      success: true,
      data: aiPersona
    });

  } catch (error) {
    console.error('获取AI Persona失败:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// 保存AI Persona设置
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const clubId = params.id;

    // 检查用户权限（只有OWNER和ADMIN可以修改）
    const membership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: clubId,
          userId: (session as any).user.id
        }
      }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      personality,
      systemPrompt,
      capabilities,
      style
    } = body;

    // 验证必填字段
    if (!name || !personality || !systemPrompt) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 保存或更新AI Persona
    const aiPersona = await prisma.aIPersona.upsert({
      where: { clubId: clubId },
      update: {
        name,
        personality,
        systemPrompt,
        capabilities: capabilities || {
          tournaments: true,
          ringGames: true,
          memberManagement: true,
          statistics: true
        },
        style: style || {
          tone: 'friendly',
          language: 'zh',
          emoji: true,
          verbosity: 'detailed'
        }
      },
      create: {
        clubId: clubId,
        name,
        personality,
        systemPrompt,
        capabilities: capabilities || {
          tournaments: true,
          ringGames: true,
          memberManagement: true,
          statistics: true
        },
        style: style || {
          tone: 'friendly',
          language: 'zh',
          emoji: true,
          verbosity: 'detailed'
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: aiPersona
    });

  } catch (error) {
    console.error('保存AI Persona失败:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}