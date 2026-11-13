import {describe,expect,it} from 'vitest';
import {createReportDraft,isPubliclyEligible} from './report-policy';

describe('report moderation policy',()=>{
  it('accepts only predefined categories',()=>{
    expect(createReportDraft('unwanted')).toEqual({category:'unwanted',state:'pending'});
    expect(createReportDraft('advertising')).toEqual({category:'advertising',state:'pending'});
    expect(createReportDraft('suspicious')).toEqual({category:'suspicious',state:'pending'});
    expect(createReportDraft('other')).toBeNull();
    expect(createReportDraft({category:'unwanted'})).toBeNull();
  });
  it('does not mark a new report approved',()=>{
    expect(createReportDraft('suspicious')?.state).toBe('pending');
  });
  it('requires approval before public eligibility',()=>{
    expect(isPubliclyEligible('pending')).toBe(false);
    expect(isPubliclyEligible('rejected')).toBe(false);
    expect(isPubliclyEligible('approved')).toBe(true);
  });
});
