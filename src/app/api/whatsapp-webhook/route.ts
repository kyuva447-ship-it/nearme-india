import { NextResponse } from 'next/server';
import { GEMINI_MODEL, getGeminiClient } from '@/lib/gemini';
import { OWNER_CONTACT_EMAIL, OWNER_CONTACT_PHONE } from '@/lib/seeded-marketplace';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');

  if (mode === 'subscribe' && challenge) {
    if (!process.env.WHATSAPP_VERIFY_TOKEN || verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }

  return NextResponse.json({
    status: 'ready',
    model: GEMINI_MODEL,
    ownerAlertPhone: OWNER_CONTACT_PHONE,
    ownerAlertEmail: OWNER_CONTACT_EMAIL,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messageText =
      body?.message ||
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ||
      'Hi, I want to audit a bill on NearMe India';
    const senderPhone =
      body?.from ||
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from ||
      OWNER_CONTACT_PHONE;

    const ai = getGeminiClient();
    let reply = `NearMe India AI: Upload your 30-40 page hospital bill or wholesale quote at https://www.nearme-india.org to strip overcharges immediately. Support: ${OWNER_CONTACT_PHONE}`;

    if (ai) {
      try {
        const res = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: `You are NearMe India's WhatsApp concierge. Reply concisely (max 2 sentences) to customer (${senderPhone}): "${messageText}". Mention https://www.nearme-india.org and escalate urgent disputes to ${OWNER_CONTACT_PHONE}.`,
        });
        if (res.text) reply = res.text.trim();
      } catch {
        // Keep deterministic reply
      }
    }

    return NextResponse.json({
      status: 'processed',
      senderPhone,
      reply,
      escalatedTo: OWNER_CONTACT_EMAIL,
    });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
