import { NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { query, language } = await req.json();
    const ai = getGeminiClient();

    if (!ai) {
      return NextResponse.json({
        reply: `This is an autonomous fallback reply to "${query}" in ${language}. How else can I assist?`,
        action_taken: 'none',
      });
    }

    const prompt = `You are a 24/7 AI Voice Orb for NearMe India. Answer this user query concisely in ${language}: ${query}`;
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return NextResponse.json({
      reply: result.text || '',
      action_taken: 'chat_response_generated',
    });
  } catch {
    return NextResponse.json({ error: 'Agent failed to respond' }, { status: 500 });
  }
}