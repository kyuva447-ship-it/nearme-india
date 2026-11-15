import { NextResponse } from 'next/server';
import { AgentBrain } from '@/lib/agentBrain';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query : '';
    const city = typeof body.city === 'string' && body.city.trim() ? body.city : 'All India';

    const brain = new AgentBrain(query, city);
    const data = await brain.executePipeline();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Agent Execution Error:', error);
    const fallback = await new AgentBrain('', 'All India').executePipeline();
    return NextResponse.json(fallback);
  }
}

