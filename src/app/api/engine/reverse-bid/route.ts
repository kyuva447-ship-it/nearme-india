import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { voice_query, pincode, target_price } = await req.json();

    // Simulate algorithmic bidding process & log to DB
    const { data: dbBounty, error } = await supabaseAdmin.from('reverse_bounties').insert({
        pincode: pincode,
        voice_query: voice_query,
        target_price_inr: target_price || 5000,
        lowest_bid_inr: (target_price || 5000) * 0.90,
        status: 'active'
    }).select().single();

    const bountyId = dbBounty?.id || 'auto-generated-pool-id';

    const simulatedResponse = {
      status: 'active',
      pool_id: bountyId,
      message: `Started 60s reverse price war for "${voice_query}" near ${pincode}`,
      bids: [
        { merchant: 'Local AI Bot 1', offer: Math.round((target_price || 5000) * 0.95), rating: 4.8 },
        { merchant: 'Sri Venkateswara Traders', offer: Math.round((target_price || 5000) * 0.90), rating: 4.9 },
        { merchant: 'Fast Deal Agency', offer: Math.round((target_price || 5000) * 0.92), rating: 4.5 }
      ]
    };

    return NextResponse.json(simulatedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start price war' }, { status: 500 });
  }
}
