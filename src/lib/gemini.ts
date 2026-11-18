import {
  GoogleGenAI,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from '@google/genai';

export const GEMINI_MODEL = 'gemini-3.8-flash';
export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
] as const;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientOrModelError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|404|NOT_FOUND|high demand|overloaded/i.test(
    msg
  );
}

export async function generateGeminiWithFallback(
  ai: GoogleGenAI,
  params: Omit<GenerateContentParameters, 'model'> & { model?: string }
): Promise<GenerateContentResponse> {
  const baseList = params.model
    ? [params.model, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== params.model)]
    : [...GEMINI_FALLBACK_MODELS];
  const candidateModels = [...baseList, baseList[0]];

  let lastError: unknown;
  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    try {
      return await ai.models.generateContent({
        ...params,
        model,
      });
    } catch (err) {
      lastError = err;
      if (!isTransientOrModelError(err)) {
        throw err;
      }
      if (i < candidateModels.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
      }
    }
  }

  throw lastError;
}
