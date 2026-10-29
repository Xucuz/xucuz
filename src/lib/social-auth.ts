import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
const secure=process.env.NODE_ENV==='production';
const key=()=>{const secret=process.env.AUTH_SECRET;if(!secret||secret.length<32)throw new Error('AUTH_SECRET missing');return secret;};
const sign=(value:string)=>createHmac('sha256',key()).update(value).digest('base64url');
export const socialConfigured=()=>Boolean(process.env.AUTH_GOOGLE_ID&&process.env.AUTH_GOOGLE_SECRET&&process.env.AUTH_SECRET);
export const facebookConfigured=()=>Boolean(process.env.AUTH_FACEBOOK_ID&&process.env.AUTH_FACEBOOK_SECRET&&process.env.AUTH_SECRET);
export const cookieOptions={httpOnly:true,secure,sameSite:'lax' as const,path:'/'};
export const nonce=()=>randomBytes(32).toString('base64url');
export const pkceChallenge=(verifier:string)=>createHash('sha256').update(verifier).digest('base64url');
export function seal(data:object){const value=Buffer.from(JSON.stringify(data)).toString('base64url');return value+'.'+sign(value);}
export function unseal<T>(token:string|undefined):T|null{if(!token)return null;const parts=token.split('.');if(parts.length!==2)return null;const expected=sign(parts[0]);const supplied=Buffer.from(parts[1]);const known=Buffer.from(expected);if(supplied.length!==known.length||!timingSafeEqual(supplied,known))return null;try{return JSON.parse(Buffer.from(parts[0],'base64url').toString()) as T;}catch{return null;}}
export type Member={sub:string;name:string;provider:'google'|'facebook';exp:number};
export async function member(){const token=(await cookies()).get('xucuz_member')?.value;const m=unseal<Member>(token);return m&&m.exp>Date.now()&&['google','facebook'].includes(m.provider)?m:null;}
