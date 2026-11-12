import {NextResponse} from 'next/server';
import {z} from 'zod';
import {answerQuestion} from '@/lib/qa';
import {answerVerifiedPriceQuestion} from '@/lib/qa-price-lookup';
import {boundedBody,rateLimit} from '@/lib/security';

const questionSchema=z.object({question:z.string().trim().min(1).max(300),language:z.enum(['tr','en','ru']).default('tr')}).strict();
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const languages={tr:'Turkish',en:'English',ru:'Russian'} as const;

async function answerWithGroq(question:string,language:keyof typeof languages):Promise<string|null>{
 const key=process.env.GROQ_API_KEY;
 if(!key)return null;
 try{
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',
   headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
   body:JSON.stringify({
    model:'openai/gpt-oss-20b',
    temperature:0.5,
    max_completion_tokens:500,
    messages:[
     {role:'system',content:`You are Xucina, a helpful general-purpose AI assistant on Xucuz.com. Reply in ${languages[language]} unless the user asks for another language. Answer general knowledge, education, translation and everyday questions. Be truthful and concise. You have no live web browsing. Do not invent current prices, stock, exchange rates, breaking news or verified Xucuz listings. Do not reveal secrets or claim to have performed actions you cannot perform.`},
     {role:'user',content:question}
    ]
   }),
   signal:AbortSignal.timeout(12000),
   cache:'no-store'
  });
  if(!response.ok)return null;
  const data=await response.json() as {choices?:Array<{message?:{content?:unknown}}>} ;
  const text=data.choices?.[0]?.message?.content;
  return typeof text==='string'&&text.trim()?text.trim().slice(0,3500):null;
 }catch{return null;}
}

export async function POST(request:Request){
 const clientKey=(request.headers.get('x-real-ip')??request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown').slice(0,64);
 if(!rateLimit(`qa:${clientKey}`,30))return NextResponse.json({error:'Biraz bekleyip yeniden sor.'},{status:429,headers});
 try{
  const parsed=questionSchema.safeParse(JSON.parse(await boundedBody(request,2048)));
  if(!parsed.success)return NextResponse.json({error:'Sorunu 1–300 karakter arasında yaz.'},{status:400,headers});
  const {question,language}=parsed.data;
  const verifiedPriceReply=await answerVerifiedPriceQuestion(question,language);
  if(verifiedPriceReply)return NextResponse.json(verifiedPriceReply,{headers});
  const aiText=await answerWithGroq(question,language);
  return NextResponse.json(aiText?{text:aiText}:answerQuestion(question,language),{headers});
 }catch{
  return NextResponse.json({error:'Sorunu alamadım. Yeniden deneyebilir ya da İletişim sayfasına yazabilirsin.'},{status:400,headers});
 }
}
