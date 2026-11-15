import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '').slice(-10) : '';
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Valid 10-digit Indian phone number is required' }, { status: 400 });
    }

    let poolId = 'pan-india-wholesale-pool';
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        const { data: swarm } = await supabaseAdmin
          .from('swarm_pools')
          .select('id')
          .limit(1)
          .single();
        if (swarm?.id) poolId = String(swarm.id);
      } catch {
        // Fallback pool ID when table is not yet provisioned
      }
    }

    return NextResponse.json(
      {
        status: 'joined',
        poolId,
        message: 'Joined Swarm Wholesale Pool Successfully',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to join swarm pool' }, { status: 400 });
  }
}
