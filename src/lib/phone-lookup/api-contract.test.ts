import {describe,expect,it} from 'vitest';
import {parseReportSubmission,parseModerationDecision} from './api-contract';

describe('future phone report API contracts (offline)',()=>{
  it('accepts only category and defaults to pending',()=>{
    expect(parseReportSubmission({category:'unwanted'})).toEqual({category:'unwanted',state:'pending'});
    expect(parseReportSubmission({category:'suspicious'})).toEqual({category:'suspicious',state:'pending'});
  });
  it('rejects arbitrary personal data and client-supplied approval',()=>{
    expect(parseReportSubmission({category:'unwanted',phone:'123'})).toBeNull();
    expect(parseReportSubmission({category:'unwanted',name:'Someone'})).toBeNull();
    expect(parseReportSubmission({category:'unwanted',state:'approved'})).toBeNull();
    expect(parseReportSubmission(null)).toBeNull();
    expect(parseReportSubmission(['unwanted'])).toBeNull();
  });
  it('validates only synthetic moderation IDs and known decisions',()=>{
    expect(parseModerationDecision({reportId:'DEMO-001',decision:'approved'})).toEqual({reportId:'DEMO-001',decision:'approved'});
    expect(parseModerationDecision({reportId:'DEMO-002',decision:'rejected'})).toEqual({reportId:'DEMO-002',decision:'rejected'});
    expect(parseModerationDecision({reportId:'DEMO-002',decision:'pending'})).toBeNull();
    expect(parseModerationDecision({reportId:'real-id',decision:'approved'})).toBeNull();
    expect(parseModerationDecision({reportId:'DEMO-001',decision:'approved',role:'admin'})).toBeNull();
  });
});
