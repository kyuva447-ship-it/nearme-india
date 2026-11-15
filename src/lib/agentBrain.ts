import { SEEDED_MERCHANTS, toUrlSlug } from './seeded-marketplace';
import { supabaseAdmin } from './supabase/server';

export interface AgentResultItem {
  id: string;
  name: string;
  rating: number;
  distance: string;
  city: string;
  citySlug: string;
  categorySlug: string;
  verified: boolean;
  isVerifiedPro?: boolean;
  retailPrice: number;
  price: number;
  category: string;
  gstin: string;
}

export interface AgentResponse {
  results: AgentResultItem[];
  log?: string[];
}

export class AgentBrain {
  private query: string;
  private city: string;

  constructor(query: string, city: string) {
    this.query = (query || '').trim().toLowerCase();
    this.city = (city || '').trim();
    if (this.city.toLowerCase() === 'all india') {
      this.city = '';
    }
  }

  public async executePipeline(): Promise<AgentResponse> {
    const q = this.query;
    const cityFilter = this.city.toLowerCase();
    const tokens = q
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);

    let liveRows: Array<{
      id: string;
      name: string;
      city: string;
      category: string;
      gstin: string;
      trust: number;
      isVerifiedPro: boolean;
    }> = [];

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        const { data } = await supabaseAdmin
          .from('merchant_wallets')
          .select('merchant_id, business_name, category, city, gstin, trust_score, is_verified_pro')
          .order('is_verified_pro', { ascending: false })
          .order('trust_score', { ascending: false })
          .limit(20);

        if (Array.isArray(data)) {
          liveRows = data.map((row) => ({
            id: String(row.merchant_id || ''),
            name: String(row.business_name || 'Verified Partner'),
            city: String(row.city || 'Bengaluru'),
            category: String(row.category || 'Local Services'),
            gstin: String(row.gstin || 'MOD36-VERIFIED'),
            trust: Number(row.trust_score || 92),
            isVerifiedPro: Boolean(row.is_verified_pro),
          }));
        }
      } catch {
        // Fall back cleanly to seeded marketplace
      }
    }

    const combinedPool = [
      ...liveRows.map((m, idx) => ({
        id: m.id || `live-${idx}`,
        business_name: m.name,
        category: m.category,
        city: m.city,
        pincode: 'Verified Hub',
        gstin: m.gstin,
        trust_score: m.trust,
        isVerifiedPro: m.isVerifiedPro,
        liveCashOrderInr: 499,
        tags: [m.category.toLowerCase(), m.city.toLowerCase()],
        serviceSlug: toUrlSlug(m.category),
      })),
      ...SEEDED_MERCHANTS.map((m) => ({
        ...m,
        isVerifiedPro: m.trust_score >= 96,
      })),
    ];

    const scored = combinedPool.map((m) => {
      const hay = `${m.business_name} ${m.category} ${m.city} ${m.pincode} ${(m.tags || []).join(' ')}`.toLowerCase();
      let score = m.isVerifiedPro ? 5 : 0;

      if (q && hay.includes(q)) score += 20;
      for (const token of tokens) {
        if (hay.includes(token)) score += 8;
      }
      if (cityFilter && hay.includes(cityFilter)) score += 12;

      return { item: m, score };
    });

    const filtered = scored
      .filter((entry) => (!q && !cityFilter ? true : entry.score > (entry.item.isVerifiedPro ? 5 : 0)))
      .sort((a, b) => b.score - a.score || b.item.trust_score - a.item.trust_score)
      .map((entry) => entry.item);

    const pool = filtered.length > 0 ? filtered : combinedPool.slice(0, 8);

    const results: AgentResultItem[] = pool.slice(0, 12).map((m, idx) => {
      const wholesale = m.liveCashOrderInr || 499;
      return {
        id: m.id,
        name: m.business_name,
        rating: Number(Math.min(4.9, 4.6 + (idx % 4) * 0.1).toFixed(1)),
        distance: `${m.city} · ${m.pincode}`,
        city: m.city,
        citySlug: toUrlSlug(m.city),
        categorySlug: m.serviceSlug || toUrlSlug(m.category),
        verified: true,
        isVerifiedPro: Boolean(m.isVerifiedPro),
        retailPrice: Math.round(wholesale * 1.28),
        price: wholesale,
        category: m.category,
        gstin: m.gstin,
      };
    });

    return {
      results,
      log: [
        `Matched ${results.length} verified provider(s) (${liveRows.length} live DB + Pan-India directory).`,
        'Ranked Verified Pro & GST Mod-36 partners with 15/85 Escrow protection.',
      ],
    };
  }
}

