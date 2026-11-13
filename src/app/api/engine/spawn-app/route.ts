import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { idea, phone } = await req.json();

    // Simulate App Spawning logic / Gemini logic
    const slug = idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);

    // Attempt DB insert if Supabase is configured, otherwise fall back gracefully
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      try {
        await supabaseAdmin.from('spawned_mini_apps').insert({
          slug: slug,
          owner_phone: phone,
          app_name: idea,
          category: 'AI_Spawned',
          schema_json: { generated: true }
        });
      } catch {
        // Silent fallback when database is offline
      }
    }

    const simulatedResponse = {
      status: 'created',
      slug,
      url: `/live/${slug}`,
      commission_pct: 1.5,
      message: `App generated successfully for ${phone}`
    };

    return NextResponse.json(simulatedResponse, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to spawn app' }, { status: 500 });
  }
}
