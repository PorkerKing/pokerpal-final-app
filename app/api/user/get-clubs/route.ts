import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // Temporarily disable auth for development
  // const session = await getServerSession(authOptions);
  // if (!session || !session.user?.id) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  
  // For development, use a hardcoded user
  const userId = 'user-manager-test';

  try {
    const userClubs = await prisma.club.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        aiPersona: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json({ clubs: userClubs });
  } catch (error) {
    console.error("Failed to fetch user clubs:", error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
} 