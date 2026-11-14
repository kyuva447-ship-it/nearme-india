import { NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';
import { resolveSupportQuery, SupportedLang } from '@/lib/autonomousStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body.query || body.message || '').trim();
    const language = (body.language as SupportedLang) || 'EN';

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are a 24/7 AI Voice Orb for NearMe India. Answer this user query concisely in ${language}: ${query}`;
        const result = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        if (result.text) {
          return NextResponse.json({
            reply: result.text,
            action_taken: 'chat_response_generated',
          });
        }
      } catch {
        // Fall through cleanly to autonomousStore fallback
      }
    }

    const ticket = await resolveSupportQuery({
      query,
      language,
      customerIdentifier: body.customerIdentifier || 'Voice Orb User',
      channel: 'VOICE_DESK',
    });

    return NextResponse.json({
      reply: ticket.resolutionSummary,
      action_taken: ticket.actionExecuted,
      ticket,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}