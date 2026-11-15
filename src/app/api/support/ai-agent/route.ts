import { NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase/server';
import { resolveSupportQuery } from '@/lib/autonomousStore';
import { getVerifiedSessionPhone } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body.query || body.message || '').trim();
    const verifiedPhone = getVerifiedSessionPhone();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let dbContext = 'No verified session connected.';
    if (
      verifiedPhone &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        const { data: userOrders } = await supabaseAdmin
          .from('transactions')
          .select('id, tx_type, gross_inr, status, created_at')
          .eq('user_phone', verifiedPhone)
          .order('created_at', { ascending: false })
          .limit(3);
        dbContext = `Verified session recent orders: ${JSON.stringify(userOrders || [])}`;
      } catch {
        dbContext = 'Verified account connected.';
      }
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are a strict, highly efficient 24/7 AI Support Agent for NearMe India. A user asked: "${query}". Context: ${dbContext}. Keep your answer concise, professional, and direct them to on-site actions on https://www.nearme-india.org.`;
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
      customerIdentifier: verifiedPhone || 'Guest User',
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
