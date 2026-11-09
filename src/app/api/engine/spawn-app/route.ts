import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { idea, phone } = await req.json();

    // Simulate App Spawning logic
    const slug = idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);

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