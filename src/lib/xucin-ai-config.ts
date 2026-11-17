export type XucinAiProvider = 'vercel-ai-gateway' | 'groq' | null;

export function selectXucinAiProvider(config: {
  gatewayApiKey?: string;
  vercelOidcToken?: string;
  groqApiKey?: string;
}): XucinAiProvider {
  if (config.gatewayApiKey?.trim() || config.vercelOidcToken?.trim()) return 'vercel-ai-gateway';
  if (config.groqApiKey?.trim()) return 'groq';
  return null;
}
