import {generateText} from 'ai';
import type {ModelMessage} from 'ai';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {answerVerifiedPriceQuestion} from '@/lib/qa-price-lookup';
import {sameOrigin,rateLimit,boundedBody} from '@/lib/security';

export const dynamic='force-dynamic';
const defaultModel='alibaba/qwen3.8-flash';
const languages=['tr','en','ru'] as const;
const schema=z.object({language:z.enum(languages),messages:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().trim().min(1).max(1200)})).min(1).max(12)}).strict();
const moneyIntent=/(?:\bfiyat\w*|\bkaç\s*(?:tl|lira)?\b|\btl\b|\btry\b|\bdolar\b|\beuro\b|\bkur\b|\bprice\w*|\bcost\w*|\bhow much\b|\bcheapest\b|\bexchange rate\b|\busd\b|\beur\b|\bgbp\b|цена|стоим|сколько|курс|лир|доллар|евро)/i;
const moneyOutput=/(?:[$€£₺]\s*\d|\d[\d,. ]*\s*(?:[$€£₺]|\b(?:TRY|TL|USD|EUR|GBP)\b)|(?:price|cost|fare|rate|стоимост|цен[аы])[^\n]{0,36}\d)/i;
function gatewayConfigured(){return Boolean(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN);}
function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
function genericError(language:'tr'|'en'|'ru'){
 return language==='en'?'Xucuz AI is not configured yet. Set up Vercel AI Gateway for general answers.':language==='ru'?'Xucuz AI пока не настроен. Для общих ответов настройте Vercel AI Gateway.':'Xucuz AI henüz yapılandırılmadı. Genel yanıtlar için Vercel AI Gateway ayarlayın.';
}
function safeFallback(language:'tr'|'en'|'ru'){
 return language==='en'?'I can help with shopping guidance, but I cannot provide a current price, fare, exchange rate, or seller quote without a verified source.':language==='ru'?'Я могу помочь с выбором, но без подтверждённого источника не сообщаю актуальные цены, тарифы, курсы или предложения продавцов.':'Alışveriş rehberliğinde yardımcı olabilirim; doğrulanmış kaynak olmadan güncel fiyat, ücret, kur veya satıcı teklifi veremem.';
}

export async function GET(){
 return json({assistantReady:Boolean(process.env.AI_GATEWAY_MODEL||defaultModel)&&gatewayConfigured(),priceDatabaseConfigured:Boolean(process.env.DATABASE_URL),providerConfigured:gatewayConfigured()});
}

export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Invalid request origin.'},403);
 const peer=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'anonymous';
 if(!rateLimit(`world-ai:${peer}`,15,60_000))return json({error:'Too many questions. Please wait a moment.'},429);
 let parsed;
 try{parsed=schema.safeParse(JSON.parse(await boundedBody(request,16_000)));}catch{return json({error:'Invalid request body.'},400);}
 if(!parsed.success)return json({error:'Invalid question or conversation.'},400);
 const {language,messages}=parsed.data;
 const latest=messages.findLast(message=>message.role==='user')?.content;
 if(!latest)return json({error:'A question is required.'},400);

 if(moneyIntent.test(latest)){
  try{
   const verified=await answerVerifiedPriceQuestion(latest,language);
   return json({text:verified?.text??(language==='en'?'No current, approved record matched that request. I will not estimate a price.':language==='ru'?'Для этого запроса не найдено актуальной подтверждённой записи. Я не буду предполагать цену.':'Bu istekle eşleşen güncel, onaylı kayıt yok. Fiyat tahmini yapmıyorum.'),source:'verified-database-only'});
  }catch{
   return json({text:language==='en'?'Verified price records could not be reached. No price is being shown.':language==='ru'?'Не удалось получить подтверждённые записи цен. Цена не показывается.':'Doğrulanmış fiyat kayıtlarına erişilemedi. Fiyat gösterilmiyor.',source:'verified-database-only'},503);
  }
 }

 if(!gatewayConfigured())return json({error:genericError(language),code:'ai_gateway_not_configured'},503);
 const langName=language==='en'?'English':language==='ru'?'Russian':'Turkish';
 const system=`You are Xucin, Xucuz World's concise and helpful AI guide for shopping and travel discovery. Reply in ${langName}. Explain that this preview does not yet have live global retailer, travel, booking, or currency-rate integrations. Never invent or state numeric prices, fares, exchange rates, inventory, seller offers, or current travel availability. The user may ask about such data: say that only verified, current database records can be quoted. Do not imply that a booking, payment, location check, or account action occurred. Do not ask for passwords, payment information, or sensitive personal data. Keep answers brief and practical.`;
 const history=messages.slice(-8).map(message=>({role:message.role,content:message.content})) as ModelMessage[];
 try{
  const result=await generateText({model:process.env.AI_GATEWAY_MODEL||defaultModel,system,messages:history,maxOutputTokens:400,abortSignal:AbortSignal.timeout(15_000)});
  const text=moneyOutput.test(result.text)?safeFallback(language):result.text;
  return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{
  console.error('[xucuz-world-ai] model request failed');
  return json({error:genericError(language),code:'ai_gateway_request_failed'},503);
 }
}
