import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { GEMINI_MODEL, generateGeminiWithFallback, getGeminiClient } from '@/lib/gemini';
import { OWNER_CONTACT_EMAIL } from '@/lib/seeded-marketplace';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');
  const expectedToken = (process.env.WHATSAPP_VERIFY_TOKEN || '').trim();

  if (mode === 'subscribe' && challenge) {
    if (expectedToken && verifyToken === expectedToken) {
      return new NextResponse(challenge, { status: 200 });
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }

  return NextResponse.json({
    status: 'ready',
    model: GEMINI_MODEL,
    ownerAlertEmail: OWNER_CONTACT_EMAIL,
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const appSecret = (process.env.WHATSAPP_APP_SECRET || '').trim();
    if (appSecret) {
      const signatureHeader = req.headers.get('x-hub-signature-256') || '';
      const expectedSig =
        'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const a = Buffer.from(expectedSig, 'utf8');
      const b = Buffer.from(signatureHeader, 'utf8');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return NextResponse.json({ error: 'Invalid Meta signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const messageText =
      body?.message ||
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ||
      'Hi, I want to audit a bill on NearMe India';
    const senderPhone =
      body?.from ||
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from ||
      'website-visitor';

    const ai = getGeminiClient();
    let reply =
      'NearMe India AI: Upload your hospital bill or wholesale quote at https://www.nearme-india.org to strip overcharges immediately.';

    if (ai) {
      try {
        const res = await generateGeminiWithFallback(ai, {
          model: GEMINI_MODEL,
          contents: `You are NearMe India's automated concierge (built in Bengaluru, Karnataka). Reply concisely (max 2 sentences) to customer (${senderPhone}): "${messageText}". Direct them to https://www.nearme-india.org and never share any personal phone number.`,
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
