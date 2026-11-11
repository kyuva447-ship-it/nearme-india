import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { idea, phone } = await req.json();

    // Simulate App Spawning logic / Gemini logic
    const slug = idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);

    // Bypass RLS using Admin Client
    const { error } = await supabaseAdmin.from('spawned_mini_apps').insert({
        slug: slug,
        owner_phone: phone,
        app_name: idea,
        category: 'AI_Spawned',
        schema_json: { generated: true }
    });

    if (error) {
        throw new Error(error.message);
    }

    const simulatedResponse = {
      status: 'created',
      slug,
      url: `/live/${slug}`,
      commission_pct: 1.5,
      message: `App generated successfully for ${phone}`
    };

    return NextResponse.json(simulatedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to spawn app' }, { status: 500 });
  }
}
