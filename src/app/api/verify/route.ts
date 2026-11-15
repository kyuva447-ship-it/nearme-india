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

  let merchants = SEEDED_MERCHANTS.map((m) => ({ ...m, is_verified_pro: false }));

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  ) {
    try {
      const { data: walletMerchants } = await supabaseAdmin
        .from('merchant_wallets')
        .select('*')
        .order('is_verified_pro', { ascending: false })
        .order('trust_score', { ascending: false })
        .limit(50);

      if (walletMerchants && walletMerchants.length > 0) {
        const dbList = walletMerchants.map((m) => ({
          id: String(m.merchant_id),
          business_name: String(m.business_name),
          gstin: String(m.gstin || '29AABCS1429B1ZQ'),
          category: String(m.category || 'Local Services'),
          city: String(m.city || 'Bengaluru'),
          pincode: '560001',
          trust_score: Number(m.trust_score || 90),
          verified: true,
          is_verified_pro: Boolean(m.is_verified_pro),
          avg_discount_pct: Boolean(m.is_verified_pro) ? 35 : 25,
          phone: '',
        }));
        merchants = [...dbList, ...merchants];
      }
    } catch {
      // Fall back to seeded directory
    }
  }

  const filtered = merchants
    .filter((m) => {
      const matchesQ =
        !query ||
        m.business_name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        m.gstin.toLowerCase().includes(query);
      const matchesCity = !city || city === 'all india' || m.city.toLowerCase().includes(city);
      return matchesQ && matchesCity;
    })
    .sort((a, b) => Number(b.is_verified_pro) - Number(a.is_verified_pro) || b.trust_score - a.trust_score);

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
