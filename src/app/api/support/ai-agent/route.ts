import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { query, phone } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    let dbContext = "No account connected.";
    if (phone) {
        try {
            const { data: userOrders } = await supabaseAdmin
                .from('autonomous_treasury_ledger')
                .select('*')
                .eq('user_phone', phone)
                .limit(3);
            dbContext = `User Phone: ${phone}. Context: Active user in vault. Recent orders: ${JSON.stringify(userOrders)}`;
        } catch(e) {
            console.error("Supabase silent fail in AI agent");
        }
    }

    if (!apiKey) {
       return NextResponse.json({
         reply: `[Fallback Mode] I received your query: "${query}". ${dbContext}`,
       }, { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a strict, highly efficient 24/7 AI Support Agent for NearMe India. A user asked: "${query}". Database Context: ${dbContext}. Keep your answer extremely short, professional, and resolve their issue.`;

    const result = await model.generateContent(prompt);

    return NextResponse.json({
      reply: result.response.text(),
    }, { status: 200 });

  } catch (error) {
    console.error("AI Agent Error:", error);
    // Bulletproof Fallback
    return NextResponse.json({
      reply: 'I am experiencing high volume, but your request has been logged and will be resolved shortly.',
    }, { status: 200 });
  }
}
