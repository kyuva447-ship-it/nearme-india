import { GEMINI_MODEL, getGeminiClient } from './gemini';
import { OWNER_CONTACT_EMAIL } from './seeded-marketplace';
import {
  founderControls,
  recordAgentExecution,
  runMapsAndWebHarvester,
  runWebSyndicationEngine,
} from './autonomousStore';

export interface GrowthDispatchReport {
  timestamp: string;
  modelUsed: string;
  ownerEmail: string;
  bountyMultiplier: number;
  campaignsGenerated: Array<{
    city: string;
    category: string;
    whatsappHook: string;
    estimatedSavingsPct: number;
  }>;
  harvesterSummary?: {
    discoveredCount: number;
    usedLiveSearch: boolean;
  };
}

export async function runAutonomousGrowthCycle(
  targetCity = 'Bengaluru',
  pincode = '560001'
): Promise<GrowthDispatchReport> {
  const ai = getGeminiClient();
  const multiplier = founderControls.viralBountyMultiplier;

  const fallbackCampaigns = [
    {
      city: targetCity,
      category: 'Hospital & ICU Bill Audit (1–500+ Pages)',
      whatsappHook: `Hospital bill overcharged? Upload your multi-page PDF on NearMe India and strip NPPA/Jan Aushadhi markups in 60s (${multiplier.toFixed(1)}x QR Bounty live).`,
      estimatedSavingsPct: 36,
    },
    {
      city: 'Delhi NCR',
      category: 'Cement & TMT Wholesale BOQ',
      whatsappHook: `Direct factory rake pricing for OPC-53 & Fe-550D steel with 15/85 Escrow & MSME 43B(h) settlement on NearMe India.`,
      estimatedSavingsPct: 18,
    },
  ];

  let usedLive = false;
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Generate 2 crisp hyper-local promotional deal hooks for NearMe India in ${targetCity} (one for multi-page hospital bill auditing, one for B2B wholesale). Return concise plain text lines.`,
      });

      const summaryLine = (response.text || '').trim().slice(0, 220);
      if (summaryLine) {
        fallbackCampaigns[0].whatsappHook = summaryLine;
        usedLive = true;
      }
    } catch {
      // Keep resilient fallback campaigns
    }
  }

  const harvester = await runMapsAndWebHarvester(targetCity, pincode);
  runWebSyndicationEngine(targetCity);
  recordAgentExecution(
    'agent-viral',
    `Executed Viral Wave in ${targetCity} (${multiplier.toFixed(1)}x QR Bounty)`,
    0
  );

  return {
    timestamp: new Date().toISOString(),
    modelUsed: usedLive ? GEMINI_MODEL : `${GEMINI_MODEL} (offline-fallback)`,
    ownerEmail: OWNER_CONTACT_EMAIL,
    bountyMultiplier: multiplier,
    campaignsGenerated: fallbackCampaigns,
    harvesterSummary: {
      discoveredCount: harvester.discoveredCount,
      usedLiveSearch: harvester.usedLiveSearch,
    },
  };
}
