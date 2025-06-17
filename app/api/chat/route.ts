import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    // Temporarily disable auth for development
    // const session = await getAuth();
    // if (!session || !session.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { message, history, clubId, locale, userId } = await req.json();

    if (!message || !clubId || !locale) {
      return NextResponse.json({ error: 'Message, Club ID and locale are required' }, { status: 400 });
    }
    if (!apiKey) {
        return NextResponse.json({ error: 'AI Service API Key not configured' }, { status: 500 });
    }

    // Allow guest access but disable tools that require a user ID
    const activeTools = userId ? tools : [];

    const persona = await prisma.aIPersona.findUnique({ where: { clubId: clubId } });
    if (!persona) {
      return NextResponse.json({ error: 'AI Persona for this club not found' }, { status: 404 });
    }

    const languageName = getLanguageName(locale);
    const dynamicSystemPrompt = `You are acting as the following character and must strictly adhere to their persona. Never reveal you are an AI model.\n---\n${persona.personality}\n---\nCore Instructions:\n1. Naturally weave in the local characteristics mentioned in your persona (e.g., dialects, slang, local culture, food) to make the conversation more lively and authentic.\n2. You must reply in the language specified by the user's interface settings, which for this request is 【${languageName}】.`.trim();

    const systemMessage = { role: 'system', content: dynamicSystemPrompt };
    const chatHistory = history.map((msg: { role: 'user' | 'assistant', content: string }) => ({
      role: msg.role, content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    }));
    const userMessage = { role: 'user', content: message };
    const messagesForAI = [systemMessage, ...chatHistory, userMessage];

    const initialResponse = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'alibaba/Qwen2-7B-Instruct', messages: messagesForAI, tools: activeTools, tool_choice: 'auto' }),
    });

    if (!initialResponse.ok) {
        const errorBody = await initialResponse.text();
        console.error('SiliconFlow API error:', errorBody);
        return NextResponse.json({ error: 'Failed to fetch response from AI service' }, { status: initialResponse.status });
    }

    const initialData = await initialResponse.json();
    const responseMessage = initialData.choices[0].message;

    if (responseMessage.tool_calls) {
      messagesForAI.push(responseMessage);
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name as keyof typeof availableTools;
      const functionToCall = availableTools[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      functionArgs.userId = userId;
      functionArgs.clubId = clubId;
      
      const functionResponse = await functionToCall(functionArgs);
      
      if (functionName === 'listAvailableTournaments') {
        const toolResult = JSON.parse(functionResponse);
        if (toolResult.error || toolResult.message) {
            return NextResponse.json({ reply: toolResult.error || toolResult.message, type: 'text'});
        }
        return NextResponse.json({ type: 'tournaments', data: toolResult });
      }

      messagesForAI.push({ tool_call_id: toolCall.id, role: 'tool', name: functionName, content: functionResponse });

      const finalResponse = await fetch(SILICONFLOW_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'alibaba/Qwen2-7B-Instruct', messages: messagesForAI }),
      });
      
      const finalData = await finalResponse.json();
      const finalReply = finalData.choices[0].message.content;
      return NextResponse.json({ reply: finalReply, type: 'text' });
    } else {
      return NextResponse.json({ reply: responseMessage.content, type: 'text' });
    }

  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 