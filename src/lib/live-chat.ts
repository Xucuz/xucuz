import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {sql} from '@/db';
import {hashPassword,verifyPassword} from './security';

export const CHAT_COOKIE='xucuz_chat_session';
export const CHAT_SESSION_MS=14*24*60*60*1000;
const bannedTerms=new Set([
 'amk','aq','siktir','sikeyim','sikiyim','sikerim','sikim','sikik','sikis','sikiyor','sikicem','sikecem',
 'orospu','orospucocugu','orospuçocuğu','pic','piç','yarrak','yarak','got','göt','gotveren','gotveren',
 'ibne','pezevenk','kahpe','serefsiz','şerefsiz','haysiyetsiz','ananiskim','ananisikeyim','ananıavradını',
 'fuck','fucking','motherfucker','shit','bitch','asshole','bastard','cunt','puta','mierda','сука','блядь','хуй','пизда'
]);
const bannedPatterns=[/^sik(?:er|erim|erim|tir|tim|tik|iyor|icem|ecem|is|ik|im|sin|in|ecek)/,/^amina(?:koy|koyayim|sikeyim)/,/^anan(?:i|in|a)(?:sik|sikeyim)/,/^fuck(?:er|ing|ed)?$/];
export function normalizeNickname(value:string){return value.normalize('NFKC').trim().replace(/\s+/g,' ');}
export function nicknameKey(value:string){return normalizeNickname(value).toLocaleLowerCase('tr-TR');}
export function validNickname(value:string){const n=normalizeNickname(value);return n.length>=3&&n.length<=20&&/^[\p{L}\p{N}_ -]+$/u.test(n)&&!containsProfanity(n);}
function normalizeForModeration(value:string){return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/\$/g,'s').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
export function containsProfanity(value:string){const normalized=normalizeForModeration(value);const tokens=normalized.split(/\s+/).filter(Boolean);const spacedAbuse=tokens.some((_,index)=>['amk','aq'].includes(tokens.slice(index,index+3).join('')));return spacedAbuse||tokens.some(token=>bannedTerms.has(token)||bannedPatterns.some(pattern=>pattern.test(token)))||/(?:amina koyayim|ananin ami|ananin amini)/.test(normalized);}
export function hashChatSession(token:string){return createHash('sha256').update(token).digest('hex');}
export function createChatToken(){return randomBytes(32).toString('hex');}
export function createChatMemberId(){return randomUUID();}

export async function registerChatMember(nickname:string,password:string){
 const id=createChatMemberId();
 const passwordHash=hashPassword(password);
 const rows=await sql`insert into chat_members(id,nickname,nickname_key,password_hash) values (${id},${normalizeNickname(nickname)},${nicknameKey(nickname)},${passwordHash}) returning id,nickname,banned_at`;
 return rows[0];
}
export async function loginChatMember(nickname:string,password:string){
 const rows=await sql`select id,nickname,password_hash,banned_at from chat_members where nickname_key=${nicknameKey(nickname)} limit 1`;
 const member=rows[0];
 if(!member||!verifyPassword(password,String(member.password_hash)))return {ok:false as const,reason:'invalid' as const};
 if(member.banned_at)return {ok:false as const,reason:'banned' as const};
 return {ok:true as const,member:{id:String(member.id),nickname:String(member.nickname)}};
}
export async function createChatSession(memberId:string,token:string,now=new Date()){
 const expiresAt=new Date(now.getTime()+CHAT_SESSION_MS);
 await sql`insert into chat_sessions(session_hash,member_id,expires_at) values (${hashChatSession(token)},${memberId},${expiresAt})`;
 return expiresAt;
}
export async function getChatMember(token:string|undefined,now=new Date()){
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const rows=await sql`select m.id,m.nickname,m.banned_at from chat_sessions s join chat_members m on m.id=s.member_id where s.session_hash=${hashChatSession(token)} and s.expires_at>${now} limit 1`;
 const member=rows[0];
 if(!member||member.banned_at)return null;
 return {id:String(member.id),nickname:String(member.nickname)};
}
export async function revokeChatSession(token:string|undefined){if(token&&/^[a-f0-9]{64}$/.test(token))await sql`delete from chat_sessions where session_hash=${hashChatSession(token)}`;}
export async function insertChatMessage(member:{id:string;nickname:string},body:string){
 return await sql.begin(async tx=>{
  await tx`select pg_advisory_xact_lock(hashtext(${member.id}))`;
  const recent=await tx`select count(*)::int as count from chat_messages where member_id=${member.id} and created_at>now()-interval '1 minute'`;
  if(Number(recent[0]?.count??0)>=10){const error=new Error('Message rate limit');error.name='ChatRateLimitError';throw error;}
  await tx`delete from chat_messages where created_at<now()-interval '30 days'`;
  await tx`delete from chat_sessions where expires_at<now()`;
  const rows=await tx`insert into chat_messages(member_id,nickname,body) values (${member.id},${member.nickname},${body}) returning id::text as id,nickname,body,created_at`;
  return rows[0];
 });
}
export async function readChatMessages(afterId='0'){
 if(!/^\d+$/.test(afterId))throw new Error('Invalid message cursor');
 if(afterId==='0')return await sql`select id::text as id,nickname,body,created_at from chat_messages order by id desc limit 50`;
 return await sql`select id::text as id,nickname,body,created_at from chat_messages where id>${afterId}::bigint order by id asc limit 50`;
}
export async function banChatMember(memberId:string,reason='Küfür veya hakaret'){
 await sql.begin(async tx=>{await tx`update chat_members set banned_at=now(),ban_reason=${reason} where id=${memberId} and banned_at is null`;await tx`delete from chat_sessions where member_id=${memberId}`;});
}
