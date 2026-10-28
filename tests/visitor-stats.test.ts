import {describe,it,expect} from 'vitest';
import {monthlyVisitors} from '../src/lib/visitor-stats';
describe('verified monthly visitor snapshot',()=>{const now=new Date('2026-10-28T07:00:00Z');const snapshot={month:'2026-10',visitors:123,measuredAt:'2026-10-28T06:00:00Z',source:'verified-aggregate'};const read=(changes:Record<string,unknown>={})=>monthlyVisitors(JSON.stringify({...snapshot,...changes}),now);
 it('does not invent missing or malformed counts',()=>{expect(monthlyVisitors('',now)).toBeNull();expect(monthlyVisitors('invalid',now)).toBeNull();expect(read({visitors:-1})).toBeNull();expect(read({visitors:1.5})).toBeNull();expect(read({source:''})).toBeNull();});
 it('only accepts current-month fresh data',()=>{expect(read({month:'2026-09'})).toBeNull();expect(read({measuredAt:'2026-10-25T00:00:00Z'})).toBeNull();expect(read({measuredAt:'2026-10-28T08:00:00Z'})).toBeNull();});
 it('returns aggregate without exposing source and permits measured zero',()=>{expect(read()).toEqual({count:123,measuredAt:snapshot.measuredAt});expect(read({visitors:0})?.count).toBe(0);});
 it('changes month in Istanbul, not UTC',()=>{expect(monthlyVisitors(JSON.stringify({...snapshot,month:'2026-11',measuredAt:'2026-10-31T21:30:00Z'}),new Date('2026-10-31T22:00:00Z'))?.count).toBe(123);});
});
