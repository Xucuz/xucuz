import {NextRequest,NextResponse} from 'next/server';
import {member} from '@/lib/social-auth';
import {sql} from '@/db';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await member();if(!user)return NextResponse.json({error:'unauthorized'},{status:401});
 const rows=await sql`SELECT nickname FROM social_chat_profiles WHERE provider=${user.provider} AND provider_sub=${user.sub} LIMIT 1`;
 return NextResponse.json({nickname:rows[0]?.nickname??null,name:user.name},{headers:{'Cache-Control':'no-store'}});
}
export async function PUT(request:NextRequest){
 const user=await member();if(!user)return NextResponse.json({error:'unauthorized'},{status:401});
 const data=await request.json().catch(()=>null);
 if(typeof data?.nickname!=='string')return NextResponse.json({error:'invalid'},{status:400});
 const nickname=data.nickname.trim().replace(/\s+/g,' ');
 if(nickname&&!/^[\p{L}\p{N}_ ]{3,24}$/u.test(nickname))return NextResponse.json({error:'invalid'},{status:400});
 const key=nickname?nickname.toLocaleLowerCase('tr-TR'):null;
 try{
 await sql`INSERT INTO social_chat_profiles(provider,provider_sub,nickname,nickname_key) VALUES(${user.provider},${user.sub},${nickname||null},${key}) ON CONFLICT(provider,provider_sub) DO UPDATE SET nickname=EXCLUDED.nickname,nickname_key=EXCLUDED.nickname_key,updated_at=now()`;
 return NextResponse.json({nickname:nickname||null});
 }catch(error){
 if(error&&typeof error==='object'&&'code' in error&&error.code==='23505')return NextResponse.json({error:'taken'},{status:409});
 return NextResponse.json({error:'unavailable'},{status:503});
 }
}
