import {NextResponse} from 'next/server';
import {z} from 'zod';
import {answerQuestion} from '@/lib/qa';
import {boundedBody,rateLimit} from '@/lib/security';

const questionSchema=z.object({question:z.string().trim().min(1).max(300)}).strict();
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};

export async function POST(request:Request){
 const clientKey=(request.headers.get('x-real-ip')??request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown').slice(0,64);
 if(!rateLimit(`qa:${clientKey}`,30))return NextResponse.json({error:'Biraz bekleyip yeniden sor.'},{status:429,headers});
 try{
  const parsed=questionSchema.safeParse(JSON.parse(await boundedBody(request,2048)));
  if(!parsed.success)return NextResponse.json({error:'Sorunu 1–300 karakter arasında yaz.'},{status:400,headers});
  return NextResponse.json(answerQuestion(parsed.data.question),{headers});
 }catch{
  return NextResponse.json({error:'Sorunu alamadım. Yeniden deneyebilir ya da İletişim sayfasına yazabilirsin.'},{status:400,headers});
 }
}
