import { NextResponse } from 'next/server';

export async function GET() {
  // Machine-to-Machine Model Context Protocol endpoint
  const mcpData = {
    protocol_version: "1.0",
    services_available: ["pricing", "inventory", "bidding"],
    toll_rate: "0.01_USD_per_query",
    description: "Global AI Agents pay a protocol toll to transact with Indian businesses."
  };

  return NextResponse.json(mcpData, { status: 200 });
}