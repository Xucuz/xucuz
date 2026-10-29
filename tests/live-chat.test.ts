import {describe,expect,it} from 'vitest';
import {containsProfanity,hashChatSession,nicknameKey,validNickname} from '@/lib/live-chat';

describe('member chat moderation and identity helpers',()=>{
 it('normalizes case and spacing without changing the displayed nickname',()=>{
  expect(nicknameKey('  Çay Meraklısı  ')).toBe('çay meraklısı');
  expect(validNickname('Çay Meraklısı')).toBe(true);
  expect(validNickname('xy')).toBe(false);
  expect(validNickname('isim!')).toBe(false);
 });
 it('detects common Turkish profanity and simple obfuscation',()=>{
  expect(containsProfanity('amk')).toBe(true);
  expect(containsProfanity('SİKTİR')).toBe(true);
  expect(containsProfanity('a.m.k')).toBe(true);
  expect(containsProfanity('OROSPU çocuk')).toBe(true);
 });
 it('does not ban normal words that merely begin with a profanity root',()=>{
  expect(containsProfanity('sikayet oluşturmak istiyorum')).toBe(false);
  expect(containsProfanity('ürün hakkında bilgi rica ederim')).toBe(false);
 });
 it('stores only a one-way digest of session tokens',()=>{
  expect(hashChatSession('example-session-token')).not.toBe('example-session-token');
  expect(hashChatSession('example-session-token')).toHaveLength(64);
 });
});
