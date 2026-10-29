import {NextRequest,NextResponse} from 'next/server';
import {cookieOptions,nonce,pkceChallenge,seal,socialConfigured} from '@/lib/social-auth';
export async function GET(request:NextRequest){
 if(!socialConfigured())return NextResponse.redirect(new URL('/sohbet?error=setup',request.url));
 const state=nonce(),verifier=nonce();
 const redirect=new URL('/api/auth/callback/google',request.url);
 const params=new URLSearchParams({client_id:process.env.AUTH_GOOGLE_ID!,redirect_uri:redirect.origin+redirect.pathname,response_type:'code',scope:'openid profile',state,code_challenge:pkceChallenge(verifier),code_challenge_method:'S256',prompt:'select_account'});
 const response=NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth?'+params);
 response.cookies.set('xucuz_oauth',seal({state,verifier,exp:Date.now()+600000}),{...cookieOptions,maxAge:600});
 return response;
}
