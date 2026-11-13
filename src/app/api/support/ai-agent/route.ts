import { NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase/server';
import { OWNER_CONTACT_PHONE } from '@/lib/seeded-marketplace';

export async function POST(req: Request) {
  try {
    const { query, phone } = await req.json();

    let dbContext = 'No account connected.';
    if (phone && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
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
    if (!ai) {
      return NextResponse.json({
        reply: `NearMe Support: Your query "${query}" has been logged. Reach us anytime on WhatsApp (${OWNER_CONTACT_PHONE}) for priority assistance.`,
      });
    }

    const prompt = `You are a strict, highly efficient 24/7 AI Support Agent for NearMe India. A user asked: "${query}". Database Context: ${dbContext}. Keep your answer extremely short, professional, and resolve their issue.`;
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return NextResponse.json({
      reply: result.text || 'How else can I assist you?',
    });
  } catch {
    return NextResponse.json({ error: 'Agent failed to respond' }, { status: 500 });
  }
}
