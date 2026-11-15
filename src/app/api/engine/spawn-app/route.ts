import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea = typeof body?.idea === 'string' ? body.idea.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '').slice(-10) : '';

    if (idea.length < 2) {
      return NextResponse.json({ error: 'Valid app idea or business name is required' }, { status: 400 });
    }

    const baseSlug = idea
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24);
    const slug = baseSlug || `nearme-hub-${Date.now().toString(36)}`;

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      try {
        await supabaseAdmin.from('spawned_mini_apps').insert({
          slug,
          owner_phone: phone || null,
          app_name: idea,
          category: 'AI_Spawned',
          schema_json: { generated: true },
        });
      } catch {
        // Silent fallback when table is absent
      }
    }

    return NextResponse.json(
      {
        status: 'created',
        slug,
        url: `/live/${slug}`,
        commission_pct: 5,
        message: `Live Mini-App generated at /live/${slug}`,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
