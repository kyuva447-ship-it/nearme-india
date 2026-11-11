import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    // Simulate finding active swarm
    const { data: swarm } = await supabaseAdmin
        .from('swarm_pools')
        .select('*')
        .limit(1)
        .single();

    const poolId = swarm?.id;

    // We normally would insert user phone to a junction table here.

    return NextResponse.json({
        status: 'joined',
        poolId,
        message: 'Joined Swarm Successfully'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to join swarm' }, { status: 500 });
  }
}
