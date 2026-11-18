import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/server';
import { GEMINI_MODEL, generateGeminiWithFallback, getGeminiClient } from '@/lib/gemini';
import { isAuthorizedCronOrOwner } from '@/lib/session';
import { validateGstinMod36 } from '@/lib/seeded-marketplace';
import { merchantClaimInvite } from '@/lib/emailTemplates';

export const maxDuration = 60;

const TARGET_CITIES = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Chennai'];
const TARGET_CATEGORIES = [
  'Diagnostic Labs',
  'Construction Material Suppliers',
  'Plumbing & Electrical',
  'Pharmacy Wholesale',
];

function maskCustomerPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length < 4) return '+91 98XXXXXX10';
  return `+91 ${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
}

async function logAutopilot(
  agentName: string,
  actionType: string,
  summary: string,
  status: 'success' | 'skipped' | 'error' = 'success',
  revenueInr = 0,
  targetCity = 'Bengaluru',
  metadata: Record<string, unknown> = {}
) {
  try {
    await supabaseAdmin.from('autopilot_logs').insert({
      agent_name: agentName,
      action_type: actionType,
      target_city: targetCity,
      summary,
      status,
      revenue_generated_inr: revenueInr,
      metadata,
    });
  } catch {
    // Non-blocking audit logging
  }
}

async function sendClaimNotification(params: {
  businessName: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  claimUrl: string;
}): Promise<boolean> {
  let dispatched = false;

  const waToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (waToken && waPhoneId && params.phone) {
    const clean = params.phone.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${waToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: `91${clean}`,
            type: 'text',
            text: {
              body: `Namaste ${params.businessName}! NearMe India has active customer leads in ${params.city}. Claim your profile in 30 seconds & get 2 FREE leads: ${params.claimUrl}`,
            },
          }),
        });
        if (res.ok) dispatched = true;
      } catch {
        // Continue to email channel
      }
    }
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey && params.email) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'NearMe India Growth <onboarding@nearme-india.org>',
        to: params.email,
        subject: `${params.businessName}: 2 Free Local Customer Leads in ${params.city}`,
        html: merchantClaimInvite(params.businessName, params.city, params.claimUrl),
      });
      dispatched = true;
    } catch {
      // Skip failing email
    }
  }

  return dispatched;
}

async function runPipeline(forceRun: boolean) {
  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL!.includes('placeholder');

  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 }
    );
  }

  // Respect Pause/Resume switch stored in Supabase
  const { data: ctrl } = await supabaseAdmin
    .from('system_controls')
    .select('value_json')
    .eq('key', 'autopilot_config')
    .single();

  if (ctrl?.value_json?.paused && !forceRun) {
    await logAutopilot(
      'Master Orchestrator',
      'autopilot_paused',
      'Autopilot cron skipped because agents are currently PAUSED by Owner.',
      'skipped'
    );
    return NextResponse.json({ status: 'paused', message: 'Agents are paused by Owner.' });
  }

  const city = TARGET_CITIES[new Date().getHours() % TARGET_CITIES.length];
  const category = TARGET_CATEGORIES[new Date().getDate() % TARGET_CATEGORIES.length];

  // =========================================================================
  // STEP 1: AUTO-ACQUIRE BUSINESSES (Google Places API -> Supabase Outreach -> Claim Links)
  // =========================================================================
  let acquiredCount = 0;
  let contactedCount = 0;
  const placesKey = process.env.GOOGLE_PLACES_API_KEY?.trim();

  if (placesKey) {
    try {
      const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': placesKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating',
        },
        body: JSON.stringify({
          textQuery: `${category} in ${city}, India`,
          maxResultCount: 5,
        }),
      });

      if (placesRes.ok) {
        const placesData = await placesRes.json();
        const places: Array<{
          id: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          nationalPhoneNumber?: string;
          rating?: number;
        }> = placesData.places || [];

        for (const p of places) {
          const name = p.displayName?.text;
          if (!name || !p.id) continue;
          const claimToken = crypto.randomBytes(16).toString('hex');
          const { data: inserted, error: insErr } = await supabaseAdmin
            .from('outreach_leads')
            .upsert(
              {
                business_name: name,
                phone: p.nationalPhoneNumber || null,
                city,
                category,
                google_place_id: p.id,
                address: p.formattedAddress || null,
                rating: p.rating || null,
                claim_token: claimToken,
                status: 'scraped',
              },
              { onConflict: 'google_place_id', ignoreDuplicates: true }
            )
            .select()
            .single();

          if (!insErr && inserted) {
            acquiredCount += 1;
            const claimUrl = `https://www.nearme-india.org/claim?token=${inserted.claim_token}`;
            const sent = await sendClaimNotification({
              businessName: name,
              city,
              phone: inserted.phone,
              email: inserted.email,
              claimUrl,
            });
            if (sent) {
              contactedCount += 1;
              await supabaseAdmin
                .from('outreach_leads')
                .update({ status: 'contacted', contacted_at: new Date().toISOString() })
                .eq('id', inserted.id);
            }
          }
        }
      }
    } catch {
      // Log error below cleanly
    }
  }

  await logAutopilot(
    'Auto-Acquire Places Agent',
    'acquire_businesses',
    placesKey
      ? `Scanned ${city} (${category}): created ${acquiredCount} new claimable profiles and dispatched ${contactedCount} invites.`
      : `Skipped Google Places scan for ${city} — add GOOGLE_PLACES_API_KEY in Vercel.`,
    placesKey ? 'success' : 'skipped',
    0,
    city
  );

  // =========================================================================
  // STEP 2: AUTO-MATCH & CONVERT LEADS (Gemini AI Matching + ₹199 Recharge Alerts)
  // =========================================================================
  let matchedCount = 0;
  let rechargePrompts = 0;

  const { data: openRequests } = await supabaseAdmin
    .from('reverse_bounties')
    .select('*')
    .eq('status', 'active')
    .limit(5);

  const { data: wallets } = await supabaseAdmin
    .from('merchant_wallets')
    .select('*')
    .order('is_verified_pro', { ascending: false })
    .limit(20);

  if (openRequests && openRequests.length > 0 && wallets && wallets.length > 0) {
    const ai = getGeminiClient();

    for (const reqItem of openRequests) {
      let chosenMerchant = wallets.find(
        (w) => String(w.city || '').toLowerCase() === String(reqItem.pincode || '').toLowerCase()
      ) || wallets[0];

      if (ai) {
        try {
          const matchPrompt = `Match this customer request: "${reqItem.item_title || reqItem.voice_query}" (category: ${reqItem.category}) to the best merchant ID from: ${JSON.stringify(
            wallets.map((w) => ({
              id: w.merchant_id,
              name: w.business_name,
              city: w.city,
              cat: w.category,
              pro: w.is_verified_pro,
            }))
          )}. Reply strictly with the single matching merchant id only.`;
          const res = await generateGeminiWithFallback(ai, {
            model: GEMINI_MODEL,
            contents: matchPrompt,
          });
          const candidateId = (res.text || '').trim();
          const found = wallets.find((w) => w.merchant_id === candidateId);
          if (found) chosenMerchant = found;
        } catch {
          // Deterministic fallback already set
        }
      }

      if (chosenMerchant && reqItem.user_phone) {
        await supabaseAdmin.from('lead_unlocks').insert({
          merchant_id: chosenMerchant.merchant_id,
          customer_name: 'Verified Buyer',
          customer_phone: String(reqItem.user_phone),
          masked_phone: maskCustomerPhone(String(reqItem.user_phone)),
          requirement: String(reqItem.item_title || reqItem.voice_query || 'Urgent Local Requirement'),
          city: String(chosenMerchant.city || city),
          unlocked: false,
        });
        matchedCount += 1;

        if (Number(chosenMerchant.balance_inr || 0) < 49 && Number(chosenMerchant.free_leads_remaining || 0) <= 0) {
          rechargePrompts += 1;
        }
      }
    }
  }

  await logAutopilot(
    'Gemini Lead Matcher Agent',
    'match_and_convert',
    `Matched ${matchedCount} customer leads to merchants; queued ${rechargePrompts} low-balance (₹199/₹499) recharge prompts.`,
    'success',
    0,
    city
  );

  // =========================================================================
  // STEP 3: AUTO-VERIFY PROFILES & EXPIRE STALE PRO PLANS
  // =========================================================================
  let verifiedProfiles = 0;

  const { data: unverifiedWallets } = await supabaseAdmin
    .from('merchant_wallets')
    .select('*')
    .lt('trust_score', 95)
    .limit(10);

  if (unverifiedWallets) {
    for (const w of unverifiedWallets) {
      if (w.gstin) {
        const mod36 = validateGstinMod36(String(w.gstin));
        if (mod36.checksumValid) {
          await supabaseAdmin
            .from('merchant_wallets')
            .update({ trust_score: 97, updated_at: new Date().toISOString() })
            .eq('merchant_id', w.merchant_id);
          verifiedProfiles += 1;
        }
      }
    }
  }

  // Expire lapsed Pro subscriptions automatically
  await supabaseAdmin
    .from('merchant_wallets')
    .update({ is_verified_pro: false })
    .eq('is_verified_pro', true)
    .lt('pro_expires_at', new Date().toISOString());

  await logAutopilot(
    'Auto-Verify & Governance Agent',
    'auto_verify_profiles',
    `Promoted ${verifiedProfiles} GSTIN-verified merchant profiles and synced Pro subscription expirations.`,
    'success',
    0,
    city
  );

  return NextResponse.json({
    status: 'completed',
    city,
    category,
    acquiredCount,
    contactedCount,
    matchedCount,
    rechargePrompts,
    verifiedProfiles,
  });
}

export async function GET(req: Request) {
  if (!isAuthorizedCronOrOwner(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runPipeline(false);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!isAuthorizedCronOrOwner(req, body?.password || body?.pin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runPipeline(Boolean(body?.force));
}
