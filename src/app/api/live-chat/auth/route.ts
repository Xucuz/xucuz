import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {boundedBody,rateLimit,sameOrigin} from '@/lib/security';
import {CHAT_COOKIE,CHAT_SESSION_MS,createChatToken,createChatSession,getChatMember,loginChatMember,normalizeNickname,registerChatMember,revokeChatSession,validNickname} from '@/lib/live-chat';

export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const credentialSchema=z.object({action:z.enum(['register','login','logout']),nickname:z.string().max(80).optional(),password:z.string().max(128).optional()}).strict();
const unavailable=()=>NextResponse.json({error:'Canlı sohbet şu an kullanılamıyor. Lütfen daha sonra yeniden dene.'},{status:503,headers});
function clientKey(request:Request){return (request.headers.get('x-real-ip')??request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown').slice(0,64);}
function setSession(response:NextResponse,token:string){response.cookies.set(CHAT_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/live-chat',maxAge:CHAT_SESSION_MS/1000});}

export async function GET(request:NextRequest){
 const token=request.cookies.get(CHAT_COOKIE)?.value;
 try{return NextResponse.json({member:await getChatMember(token)},{headers});}catch{return unavailable();}
}

export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:'İstek kaynağı doğrulanamadı.'},{status:403,headers});
 if(!rateLimit(`chat-auth:${clientKey(request)}`,12,300000))return NextResponse.json({error:'Çok fazla deneme yapıldı. Birkaç dakika sonra yeniden dene.'},{status:429,headers});
 let parsed;try{parsed=credentialSchema.safeParse(JSON.parse(await boundedBody(request,4096)));}catch{return NextResponse.json({error:'Geçersiz istek.'},{status:400,headers});}
 if(!parsed.success)return NextResponse.json({error:'Rumuz veya parola geçersiz.'},{status:400,headers});
 const {action}=parsed.data;const token=request.cookies.get(CHAT_COOKIE)?.value;
 try{
  if(action==='logout'){await revokeChatSession(token);const response=NextResponse.json({ok:true},{headers});response.cookies.set(CHAT_COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/live-chat',maxAge:0});return response;}
  const nickname=normalizeNickname(parsed.data.nickname??'');const password=parsed.data.password??'';
  if(!validNickname(nickname)||password.length<10||password.length>128)return NextResponse.json({error:'Rumuz 3–20 karakter olmalı; parola en az 10 karakter olmalı. Küfür içeren rumuzlara izin verilmez.'},{status:400,headers});
  let member;
  if(action==='register'){
   try{const created=await registerChatMember(nickname,password);member={id:String(created.id),nickname:String(created.nickname)};}
   catch(error){if((error as {code?:string})?.code==='23505')return NextResponse.json({error:'Bu rumuz zaten kullanılıyor.'},{status:409,headers});throw error;}
  }else{
   const result=await loginChatMember(nickname,password);
   if(!result.ok)return NextResponse.json({error:result.reason==='banned'?'Bu hesap sohbet kuralları ihlali nedeniyle engellendi.':'Rumuz veya parola hatalı.'},{status:401,headers});
   member=result.member;
  }
  const newToken=createChatToken();await createChatSession(member.id,newToken);
  const response=NextResponse.json({member},{headers});setSession(response,newToken);return response;
 }catch{return unavailable();}
}
