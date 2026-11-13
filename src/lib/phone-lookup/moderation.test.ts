import {describe,expect,it} from 'vitest';
import {applyModerationDecision} from './moderation';

describe('moderation state transitions',()=>{
  it('allows review of pending reports',()=>{
    expect(applyModerationDecision('pending','approved')).toBe('approved');
    expect(applyModerationDecision('pending','rejected')).toBe('rejected');
  });
  it('does not silently reverse an existing decision',()=>{
    for(const state of ['approved','rejected'] as const){
      expect(applyModerationDecision(state,'approved')).toBeNull();
      expect(applyModerationDecision(state,'rejected')).toBeNull();
    }
  });
});
