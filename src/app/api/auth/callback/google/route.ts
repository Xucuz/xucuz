import {NextRequest,NextResponse} from 'next/server';
import {cookieOptions,seal,unseal,type Member} from '@/lib/social-auth';
type Pending={state:string;verifier:string;exp:number};
export async function GET(request:NextRequest){
 const url=new URL(request.url);
 const fail=()=>NextResponse.redirect(new URL('/sohbet?error=login',url));
 const pending=unseal<Pending>(request.cookies.get('xucuz_oauth')?.value);
 const state=url.searchParams.get('state'),code=url.searchParams.get('code');
 if(!pending||pending.exp<Date.now()||!state||state!==pending.state||!code)return fail();
 const redirectUri='https://xucuz-git-feat-community-price-platform-yahya-763e.vercel.app/api/auth/callback/google';
 try{
 const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.AUTH_GOOGLE_ID!,client_secret:process.env.AUTH_GOOGLE_SECRET!,code,grant_type:'authorization_code',redirect_uri:redirectUri,code_verifier:pending.verifier}),cache:'no-store'});
 if(!tokenResponse.ok)return fail();
 const token=await tokenResponse.json() as {access_token?:string};
 if(!token.access_token)return fail();
 const profileResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{authorization:'Bearer '+token.access_token},cache:'no-store'});
 if(!profileResponse.ok)return fail();
 const profile=await profileResponse.json() as {sub?:string;name?:string};
 if(!profile.sub)return fail();
 const member:Member={sub:profile.sub,name:(profile.name||'Üye').slice(0,80),provider:'google',exp:Date.now()+7*86400000};
 const response=NextResponse.redirect(new URL('/sohbet',url));
 response.cookies.set('xucuz_member',seal(member),{...cookieOptions,maxAge:7*86400});
 response.cookies.delete('xucuz_oauth');
 return response;
 }catch{return fail();}
}
