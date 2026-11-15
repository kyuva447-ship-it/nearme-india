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
        const prompt = `You are the 24/7 AI Self-Support Assistant for NearMe India (https://www.nearme-india.org, built in Bengaluru).
Website Features & Routes:
- Find Services (/search): Plumbers, Electricians, Tailors, Diagnostic Labs, AC Repair, Carpenters & wholesale suppliers across 19,300+ pincodes (incl. Bengaluru 560001 & Madanapalle 517325).
- List Your Business Free (/claim): Claim business in 30s -> 2 Free Customer Leads; extra leads ₹49/unlock; Verified Pro ₹299/mo (#1 ranking); Merchant Dashboard at /dashboard.
- Bill Stripper (/#auditor): Upload 1–500+ page hospital ICU bills or BOQs (PDF/CSV/photo); ₹199 audit unlock (/pricing).
- Escrow & Track Escrow (/escrow): 15/85 UPI Escrow, 6-digit Delivery OTP release, 5% escrow commission, 48-hour refund guarantee.
- Zero-Lockout Login (/login): 10-digit mobile + automatic Instant One-Tap Verify fallback if SMS fails.
- Support Email: support@nearme-india.org.

User Question: "${query}"
User Context: ${dbContext}
Reply concisely (2-3 sentences), accurately answering their question about the website with direct links/paths.`;
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
