import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {boundedBody,rateLimit,sameOrigin} from '@/lib/security';
import {banChatMember,containsProfanity,getChatMember,insertChatMessage,readChatMessages} from '@/lib/live-chat';

export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const unavailable=()=>NextResponse.json({error:'Canlı sohbet şu an kullanılamıyor.'},{status:503,headers});
function clientKey(request:Request){return (request.headers.get('x-real-ip')??request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown').slice(0,64);}
async function memberFor(request:NextRequest){return getChatMember(request.cookies.get('xucuz_chat_session')?.value);}

export async function GET(request:NextRequest){
 if(!rateLimit(`chat-read:${clientKey(request)}`,90,60000))return NextResponse.json({error:'Biraz bekleyip yeniden dene.'},{status:429,headers});
 try{const member=await memberFor(request);if(!member)return NextResponse.json({error:'Sohbet için rumuzunla giriş yap.'},{status:401,headers});const after=request.nextUrl.searchParams.get('after')??'0';const messages=await readChatMessages(after);const ordered=after==='0'?[...messages].reverse():messages;return NextResponse.json({messages:ordered.map(row=>({id:String(row.id),nickname:row.nickname,body:row.body,createdAt:row.created_at})),member},{headers});}catch{return unavailable();}
}

export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:'İstek kaynağı doğrulanamadı.'},{status:403,headers});
 if(!rateLimit(`chat-write:${clientKey(request)}`,12,60000))return NextResponse.json({error:'Mesaj hız sınırına ulaştın. Biraz bekleyip yeniden dene.'},{status:429,headers});
 let member;try{member=await memberFor(request);}catch{return unavailable();}
 if(!member)return NextResponse.json({error:'Canlı sohbet için üye girişi gerekli.'},{status:401,headers});
 let parsed;try{parsed=z.object({message:z.string().trim().min(1).max(500)}).strict().safeParse(JSON.parse(await boundedBody(request,2048)));}catch{return NextResponse.json({error:'Geçersiz mesaj.'},{status:400,headers});}
 if(!parsed.success)return NextResponse.json({error:'Mesaj 1–500 karakter olmalı.'},{status:400,headers});
 try{
  if(containsProfanity(parsed.data.message)){await banChatMember(member.id);return NextResponse.json({error:'Küfür ve hakaret yasak. Hesabın sohbetten engellendi.'},{status:403,headers});}
  let message;try{message=await insertChatMessage(member,parsed.data.message);}catch(error){if((error as Error)?.name==='ChatRateLimitError')return NextResponse.json({error:'Dakikada en fazla 10 mesaj gönderebilirsin.'},{status:429,headers});throw error;}
  return NextResponse.json({message:{...message,id:String(message.id),createdAt:message.created_at}},{status:201,headers});
 }catch{return unavailable();}
}
