import { supabaseAdmin } from '@/lib/supabase/server';
import { SEEDED_MERCHANTS, validateGstinMod36 } from '@/lib/seeded-marketplace';

export interface PublicShopProfile {
  slug: string;
  refId: string;
  source: 'merchant_wallet' | 'outreach_lead' | 'seeded';
  businessName: string;
  city: string;
  category: string;
  address: string | null;
  phone: string | null;
  gstin: string | null;
  gstVerified: boolean;
  trustScore: number;
  isVerifiedPro: boolean;
  isClaimed: boolean;
  claimToken: string | null;
  rating: number | null;
  updatedAt: string;
}

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return Boolean(url && !url.includes('placeholder') && key && !key.includes('placeholder'));
}

export function slugifyPart(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function buildShopSlug(businessName: string, city: string, refId: string): string {
  const base = [slugifyPart(businessName), slugifyPart(city)].filter(Boolean).join('-') || 'local-shop';
  return `${base}--${refId}`;
}

export function extractRefIdFromSlug(slug: string): string {
  const decoded = decodeURIComponent(slug || '').trim();
  const idx = decoded.lastIndexOf('--');
  return idx >= 0 ? decoded.slice(idx + 2) : decoded;
}

export async function fetchPublicShops(limit = 120): Promise<PublicShopProfile[]> {
  const shops: PublicShopProfile[] = [];
  const seenNames = new Set<string>();

  if (isSupabaseLive()) {
    try {
      const [{ data: wallets }, { data: leads }] = await Promise.all([
        supabaseAdmin
          .from('merchant_wallets')
          .select(
            'merchant_id, business_name, city, category, phone, gstin, is_verified_pro, trust_score, updated_at, created_at'
          )
          .order('is_verified_pro', { ascending: false })
          .order('trust_score', { ascending: false })
          .limit(Math.min(limit, 200)),
        supabaseAdmin
          .from('outreach_leads')
          .select(
            'id, business_name, city, category, address, phone, rating, claim_token, status, claimed_merchant_id, created_at'
          )
          .order('created_at', { ascending: false })
          .limit(Math.min(limit, 500)),
      ]);

      for (const w of wallets || []) {
        const name = String(w.business_name || '').trim();
        if (!name) continue;
        const city = String(w.city || 'India').trim();
        const dedupKey = `${name.toLowerCase()}|${city.toLowerCase()}`;
        seenNames.add(dedupKey);
        const gstValid = w.gstin ? validateGstinMod36(String(w.gstin)).checksumValid : false;
        shops.push({
          slug: buildShopSlug(name, city, String(w.merchant_id)),
          refId: String(w.merchant_id),
          source: 'merchant_wallet',
          businessName: name,
          city,
          category: String(w.category || 'Local Services'),
          address: `${city}, India`,
          phone: w.phone ? String(w.phone) : null,
          gstin: w.gstin ? String(w.gstin) : null,
          gstVerified: gstValid,
          trustScore: Number(w.trust_score || 90),
          isVerifiedPro: Boolean(w.is_verified_pro),
          isClaimed: true,
          claimToken: null,
          rating: 4.8,
          updatedAt: String(w.updated_at || w.created_at || new Date().toISOString()),
        });
      }

      for (const l of leads || []) {
        const name = String(l.business_name || '').trim();
        if (!name || !l.id) continue;
        const city = String(l.city || 'India').trim();
        const dedupKey = `${name.toLowerCase()}|${city.toLowerCase()}`;
        if (seenNames.has(dedupKey)) continue;
        seenNames.add(dedupKey);
        const refId = `lead-${l.id}`;
        const claimed = l.status === 'claimed' || Boolean(l.claimed_merchant_id);
        shops.push({
          slug: buildShopSlug(name, city, refId),
          refId,
          source: 'outreach_lead',
          businessName: name,
          city,
          category: String(l.category || 'Local Services'),
          address: l.address ? String(l.address) : `${city}, India`,
          phone: l.phone ? String(l.phone) : null,
          gstin: null,
          gstVerified: false,
          trustScore: claimed ? 92 : 84,
          isVerifiedPro: false,
          isClaimed: claimed,
          claimToken: claimed ? null : l.claim_token ? String(l.claim_token) : null,
          rating: l.rating ? Number(l.rating) : null,
          updatedAt: String(l.created_at || new Date().toISOString()),
        });
      }
    } catch {
      // Fall back gracefully to seeded merchants below
    }
  }

  for (const s of SEEDED_MERCHANTS) {
    const dedupKey = `${s.business_name.toLowerCase()}|${s.city.toLowerCase()}`;
    if (seenNames.has(dedupKey)) continue;
    seenNames.add(dedupKey);
    const gstValid = s.gstin ? validateGstinMod36(s.gstin).checksumValid : false;
    shops.push({
      slug: buildShopSlug(s.business_name, s.city, s.id),
      refId: s.id,
      source: 'seeded',
      businessName: s.business_name,
      city: s.city,
      category: s.category,
      address: `${s.city} ${s.pincode}, India`,
      phone: null,
      gstin: s.gstin || null,
      gstVerified: gstValid,
      trustScore: s.trust_score,
      isVerifiedPro: s.trust_score >= 95,
      isClaimed: true,
      claimToken: null,
      rating: 4.9,
      updatedAt: new Date().toISOString(),
    });
  }

  return shops.slice(0, limit);
}

export async function fetchPublicShopBySlug(slug: string): Promise<PublicShopProfile | null> {
  const refId = extractRefIdFromSlug(slug);
  if (!refId) return null;

  if (isSupabaseLive()) {
    try {
      if (refId.startsWith('lead-')) {
        const uuid = refId.slice(5);
        const { data: l } = await supabaseAdmin
          .from('outreach_leads')
          .select(
            'id, business_name, city, category, address, phone, rating, claim_token, status, claimed_merchant_id, created_at'
          )
          .eq('id', uuid)
          .single();

        if (l) {
          const claimed = l.status === 'claimed' || Boolean(l.claimed_merchant_id);
          const name = String(l.business_name);
          const city = String(l.city || 'India');
          return {
            slug: buildShopSlug(name, city, `lead-${l.id}`),
            refId: `lead-${l.id}`,
            source: 'outreach_lead',
            businessName: name,
            city,
            category: String(l.category || 'Local Services'),
            address: l.address ? String(l.address) : `${city}, India`,
            phone: l.phone ? String(l.phone) : null,
            gstin: null,
            gstVerified: false,
            trustScore: claimed ? 92 : 84,
            isVerifiedPro: false,
            isClaimed: claimed,
            claimToken: claimed ? null : l.claim_token ? String(l.claim_token) : null,
            rating: l.rating ? Number(l.rating) : null,
            updatedAt: String(l.created_at || new Date().toISOString()),
          };
        }
      } else {
        const { data: w } = await supabaseAdmin
          .from('merchant_wallets')
          .select(
            'merchant_id, business_name, city, category, phone, gstin, is_verified_pro, trust_score, updated_at, created_at'
          )
          .eq('merchant_id', refId)
          .single();

        if (w) {
          const name = String(w.business_name);
          const city = String(w.city || 'India');
          const gstValid = w.gstin ? validateGstinMod36(String(w.gstin)).checksumValid : false;
          return {
            slug: buildShopSlug(name, city, String(w.merchant_id)),
            refId: String(w.merchant_id),
            source: 'merchant_wallet',
            businessName: name,
            city,
            category: String(w.category || 'Local Services'),
            address: `${city}, India`,
            phone: w.phone ? String(w.phone) : null,
            gstin: w.gstin ? String(w.gstin) : null,
            gstVerified: gstValid,
            trustScore: Number(w.trust_score || 90),
            isVerifiedPro: Boolean(w.is_verified_pro),
            isClaimed: true,
            claimToken: null,
            rating: 4.8,
            updatedAt: String(w.updated_at || w.created_at || new Date().toISOString()),
          };
        }
      }
    } catch {
      // Continue to seeded lookup
    }
  }

  const seeded = SEEDED_MERCHANTS.find((m) => m.id === refId);
  if (seeded) {
    const gstValid = seeded.gstin ? validateGstinMod36(seeded.gstin).checksumValid : false;
    return {
      slug: buildShopSlug(seeded.business_name, seeded.city, seeded.id),
      refId: seeded.id,
      source: 'seeded',
      businessName: seeded.business_name,
      city: seeded.city,
      category: seeded.category,
      address: `${seeded.city} ${seeded.pincode}, India`,
      phone: null,
      gstin: seeded.gstin || null,
      gstVerified: gstValid,
      trustScore: seeded.trust_score,
      isVerifiedPro: seeded.trust_score >= 95,
      isClaimed: true,
      claimToken: null,
      rating: 4.9,
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}
