import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { streamText, CoreMessage } from "ai";
import { NextResponse } from 'next/server';
import { listAvailableTournamentsTool, listAvailableTournaments, buyInForTournamentTool, buyInForTournament } from '@/lib/ai-tools/tournamentTools';
import { getUserProfileAndStatsTool, getUserProfileAndStats } from '@/lib/ai-tools/userTools';

// Create a simple auth function for API routes
async function getAuth() {
  try {
    // Since we can't use the global auth() in API routes easily,
    // we'll create a minimal session check
    return null; // For now, disable auth check in development
  } catch {
    return null;
  }
}

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const apiKey = process.env.SILICONFLOW_API_KEY;

const availableTools: any = {
  listAvailableTournaments,
  getUserProfileAndStats,
  buyInForTournament,
};

const tools = [
  listAvailableTournamentsTool,
  getUserProfileAndStatsTool,
  buyInForTournamentTool,
];

const getLanguageName = (locale: string): string => {
  switch (locale) {
    case 'zh': return '简体中文';
    case 'zh-TW': return '繁體中文';
    case 'ja': return '日本語';
    case 'en': return 'English';
    default: return '简体中文';
  }
};

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
  
    if (userId) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === "user") {
        // Not saving messages in this version, but logic is here
      }
    }
  
    const result = await streamText({
      model: openai("gpt-4o"),
      messages,
      async onFinish({ text }) {
        if (userId) {
          // Not saving AI responses in this version, but logic is here
        }
      },
    });
  
    return result.toAIStreamResponse();

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'An unexpected error occurred in chat' }, { status: 500 });
  }
} 