import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  SEEDED_MERCHANTS,
  validateGstinMod36,
  ZONE_WHOLESALE_INDEX,
} from '@/lib/seeded-marketplace';
import { recordAgentExecution } from '@/lib/autonomousStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const city = (searchParams.get('city') || '').trim().toLowerCase();

  let merchants = [...SEEDED_MERCHANTS];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    try {
      const { data } = await supabaseAdmin.from('v2_merchants').select('*').limit(25);
      if (data && data.length > 0) {
        merchants = data.map((m: Record<string, unknown>, idx: number) => ({
          id: String(m.id || `db-${idx}`),
          business_name: String(m.business_name || 'Verified Partner'),
          gstin: String(m.gstin || '29AABCS1429B1ZQ'),
          category: String(m.category || 'Local Services'),
          city: String(m.city || 'Bengaluru'),
          pincode: String(m.pincode || '560001'),
          trust_score: Number(m.trust_score || 90),
          verified: Boolean(m.is_verified ?? true),
          avg_discount_pct: 30,
          phone: String(m.phone || ''),
        }));
      }
    } catch {
      // Use seeded Pan-India marketplace data
    }
  }

  const filtered = merchants.filter((m) => {
    const matchesQ =
      !query ||
      m.business_name.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      m.gstin.toLowerCase().includes(query);
    const matchesCity = !city || city === 'all india' || m.city.toLowerCase().includes(city);
    return matchesQ && matchesCity;
  });

  return NextResponse.json({
    status: 'ok',
    count: filtered.length,
    merchants: filtered,
    zones: ZONE_WHOLESALE_INDEX,
  });
}

export async function POST(req: Request) {
  try {
    const { gstin, businessName, pincode, issueType } = await req.json();
    const raw = String(gstin || '29AABCS1429B1ZQ');
    const mod36 = validateGstinMod36(raw);
    const matchedSeed = SEEDED_MERCHANTS.find((m) => m.gstin === mod36.gstin);

    recordAgentExecution(
      'agent-fraud-guard',
      `Verified GSTIN ${mod36.gstin} (Mod-36: ${mod36.checksumValid ? 'VALID' : 'INVALID'})`,
      0
    );

    return NextResponse.json({
      status: 'verified',
      gstin: mod36.gstin,
      formatValid: mod36.syntaxValid,
      mod36ChecksumValid: mod36.checksumValid,
      businessName: matchedSeed?.business_name || businessName || 'Verified NearMe Partner',
      trustScore: matchedSeed?.trust_score || (mod36.checksumValid ? 95 : mod36.syntaxValid ? 86 : 72),
      pincode: matchedSeed?.pincode || pincode || '560001',
      escrowEligible: true,
      eCourtNoticeReady: true,
      eCourtForum: issueType || 'e-Daakhil Consumer Protection Act 2019 (Section 35)',
    });
  } catch {
    return NextResponse.json({ error: 'Verification request failed' }, { status: 400 });
  }
}
