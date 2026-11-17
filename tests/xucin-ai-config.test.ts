import {describe,it,expect} from 'vitest';
import {selectXucinAiProvider} from '../src/lib/xucin-ai-config';

describe('Xucin AI provider selection',()=>{
 it('prefers authenticated Vercel AI Gateway when both providers exist',()=>{
  expect(selectXucinAiProvider({gatewayApiKey:' gateway-key ',groqApiKey:'groq-key'})).toBe('vercel-ai-gateway');
  expect(selectXucinAiProvider({vercelOidcToken:'oidc-token',groqApiKey:'groq-key'})).toBe('vercel-ai-gateway');
 });
 it('uses Groq as a fallback when Gateway is not configured',()=>{
  expect(selectXucinAiProvider({groqApiKey:'groq-key'})).toBe('groq');
 });
 it('does not treat blank credentials as configured',()=>{
  expect(selectXucinAiProvider({gatewayApiKey:'  ',vercelOidcToken:'',groqApiKey:' '})).toBeNull();
 });
});
