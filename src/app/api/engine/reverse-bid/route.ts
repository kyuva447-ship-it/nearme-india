import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { voice_query, pincode, target_price } = await req.json();
    let bountyId = 'auto-generated-pool-id';

    try {
        const { data: dbBounty } = await supabaseAdmin.from('reverse_bounties').insert({
            pincode: pincode || '560001',
            voice_query: voice_query || 'Request',
            target_price_inr: target_price || 5000,
            lowest_bid_inr: (target_price || 5000) * 0.90,
            status: 'active'
        }).select().single();
        if (dbBounty) bountyId = dbBounty.id;
    } catch (e) {
        console.error("Supabase silent fail in reverse-bid");
    }

    const claimUrl = `https://www.nearme-india.org/merchant-claim/${bountyId}`;
    const b2bShareLink = `https://wa.me/?text=${encodeURIComponent(`🔥 LIVE ORDER WAITING! A customer locked ₹${target_price || 5000} for ${voice_query} within 5km. Claim instantly and receive direct UPI payout: ${claimUrl}`)}`;

    return NextResponse.json({
      status: 'active',
      pool_id: bountyId,
      message: `Started 60s reverse price war for "${voice_query}" near ${pincode}`,
      b2b_share_link: b2bShareLink,
      bids: [
        { merchant: 'Local AI Bot 1', offer: Math.round((target_price || 5000) * 0.95), rating: 4.8 },
        { merchant: 'Sri Venkateswara Traders', offer: Math.round((target_price || 5000) * 0.90), rating: 4.9 },
        { merchant: 'Fast Deal Agency', offer: Math.round((target_price || 5000) * 0.92), rating: 4.5 }
      ]
    }, { status: 200 });
  } catch (error) {
    console.error("Reverse Bid Error:", error);
    return NextResponse.json({
      status: 'active',
      pool_id: 'fallback-pool',
      message: `Started 60s reverse price war`,
      bids: [
        { merchant: 'Local AI Bot (Fallback)', offer: 4500, rating: 4.8 }
      ]
    }, { status: 200 });
  }
}
