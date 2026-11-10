import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { query, language } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
       return NextResponse.json({
         reply: `This is an autonomous fallback reply to "${query}" in ${language}. How else can I assist?`,
         action_taken: 'none'
       }, { status: 200 });
    }

    // Wire Gemini AI for Support
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a 24/7 AI Voice Orb for NearMe India. Answer this user query concisely in ${language}: ${query}`;

    const result = await model.generateContent(prompt);

    return NextResponse.json({
      reply: result.response.text(),
      action_taken: 'chat_response_generated'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Agent failed to respond' }, { status: 500 });
  }
}