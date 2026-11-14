import { NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase/server';
import { resolveSupportQuery } from '@/lib/autonomousStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body.query || body.message || '').trim();
    const phone = body.phone ? String(body.phone) : undefined;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let dbContext = 'No account connected.';
    if (
      phone &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        const { data: userOrders } = await supabaseAdmin
          .from('autonomous_treasury_ledger')
          .select('*')
          .eq('user_phone', phone)
          .limit(3);
        dbContext = `User Phone: ${phone}. Recent orders: ${JSON.stringify(userOrders || [])}`;
      } catch {
        dbContext = `User Phone: ${phone}.`;
      }
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are a strict, highly efficient 24/7 AI Support Agent for NearMe India. A user asked: "${query}". Database Context: ${dbContext}. Keep your answer extremely short, professional, and resolve their issue.`;
        const result = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        if (result.text) {
          return NextResponse.json({ reply: result.text });
        }
      } catch {
        // Fall through cleanly to autonomous deterministic support resolver
      }
    }

    const ticket = await resolveSupportQuery({
      query,
      language: 'EN',
      customerIdentifier: phone || 'Guest User',
      channel: 'WEB_CONCIERGE',
    });

    return NextResponse.json({
      reply: ticket.resolutionSummary,
      ticket,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
