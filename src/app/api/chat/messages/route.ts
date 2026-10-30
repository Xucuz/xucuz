import {NextRequest,NextResponse} from 'next/server';
import {member} from '@/lib/social-auth';
import {sql} from '@/db';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await member();
 if(!user)return NextResponse.json({error:'unauthorized'},{status:401});
 try{
  const rows=await sql`SELECT id::text,display_name,body,created_at FROM (SELECT id,display_name,body,created_at FROM social_chat_messages WHERE hidden_at IS NULL ORDER BY id DESC LIMIT 50) recent ORDER BY id ASC`;
  return NextResponse.json({messages:rows},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
export async function POST(request:NextRequest){
 const user=await member();
 if(!user)return NextResponse.json({error:'unauthorized'},{status:401});
 const data=await request.json().catch(()=>null);
 const body=typeof data?.body==='string'?data.body.trim():'';
 if(!body||body.length>1000)return NextResponse.json({error:'invalid_message'},{status:400});
 try{
  const recent=await sql`SELECT count(*)::int AS total FROM social_chat_messages WHERE provider=${user.provider} AND provider_sub=${user.sub} AND created_at>now()-interval '15 seconds'`;
  if(Number(recent[0]?.total)>=3)return NextResponse.json({error:'rate_limited'},{status:429});
  await sql`INSERT INTO social_chat_messages (provider,provider_sub,display_name,body) VALUES (${user.provider},${user.sub},${user.name.slice(0,80)},${body})`;
  return NextResponse.json({ok:true},{status:201});
 }catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
