import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    let clubs;
    // Use type assertion to inform TypeScript about the user id
    const userId = (session?.user as { id?: string })?.id;

    if (userId) {
      // User is logged in, fetch their clubs
      clubs = await prisma.club.findMany({
        where: { members: { some: { userId: userId }}},
        include: { aiPersona: { select: { name: true }}},
      });
    } else {
      // User is a guest, fetch all clubs
      clubs = await prisma.club.findMany({
        include: { aiPersona: { select: { name: true }}},
      });
    }
    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("Failed to fetch clubs:", error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
} 