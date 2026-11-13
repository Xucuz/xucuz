import {describe, expect, it} from 'vitest';
import {normalizeTurkishMobile} from './normalize';

describe('normalizeTurkishMobile', () => {
  it.each(['0532 123 45 67','5321234567','+90 532 123 45 67','905321234567'])('normalizes valid input', value => {
    expect(normalizeTurkishMobile(value)).toBe('+905321234567');
  });
  it.each(['','123','02121234567','+12025550123','0532abc4567','+905321234567999'])('rejects invalid input', value => {
    expect(normalizeTurkishMobile(value)).toBeNull();
  });
});
