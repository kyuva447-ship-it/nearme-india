// Edge Function to parse intent using a simulated LLM/heuristic approach
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { query } = await req.json();

  // Simulated AI Omnibar Intent Parser
  const lowerQuery = query.toLowerCase();
  let intent = "B2C";

  const b2bKeywords = ["bulk", "factory", "wholesale", "procurement", "tons", "corporate", "manufacturer", "supplier"];

  for (const keyword of b2bKeywords) {
    if (lowerQuery.includes(keyword)) {
      intent = "B2B";
      break;
    }
  }

  return new Response(
    JSON.stringify({ intent, parsed_query: query }),
    { headers: { "Content-Type": "application/json" } },
  );
});
