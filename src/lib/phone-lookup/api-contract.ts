/**
 * Contract validation only; no API routes, network calls, database access or logging.
 * Real endpoints must not be enabled before Preview isolation and security review.
 */
import {createReportDraft,type ReportCategory} from './report-policy';

export type ReportSubmissionDraft=Readonly<{
  category:ReportCategory;
  state:'pending';
}>;

export function parseReportSubmission(value:unknown):ReportSubmissionDraft|null {
  if(typeof value!=='object'||value===null||Array.isArray(value)) return null;
  const record=value as Record<string,unknown>;
  // Fail closed: no arbitrary name, phone, description, identity, or URL fields.
  if(Object.keys(record).length!==1||!Object.hasOwn(record,'category')) return null;
  return createReportDraft(record.category);
}

export type ModerationDecision=Readonly<{reportId:string;decision:'approved'|'rejected'}>;

export function parseModerationDecision(value:unknown):ModerationDecision|null {
  if(typeof value!=='object'||value===null||Array.isArray(value)) return null;
  const record=value as Record<string,unknown>;
  if(Object.keys(record).length!==2||!Object.hasOwn(record,'reportId')||!Object.hasOwn(record,'decision')) return null;
  if(typeof record.reportId!=='string'||!/^DEMO-[0-9]{3}$/.test(record.reportId)) return null;
  if(record.decision!=='approved'&&record.decision!=='rejected') return null;
  return {reportId:record.reportId,decision:record.decision};
}
