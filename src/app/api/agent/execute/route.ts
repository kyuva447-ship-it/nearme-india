import { NextResponse } from 'next/server';
import { AgentBrain } from '@/lib/agentBrain';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, query, city } = body;

        if (!query || !city) {
            return NextResponse.json({ error: 'Missing query or city' }, { status: 400 });
        }

        const brain = new AgentBrain(query, city);
        const data = await brain.executePipeline();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Agent Execution Error:', error);
        // Fallback to 200 OK with empty array to prevent 500 crashes
        return NextResponse.json({ results: [], log: ['Error occurred. Retrying...'] });
    }
}
