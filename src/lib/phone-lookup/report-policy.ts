/** Pure domain validation. No storage, transport or publication. */
export const reportCategories = ['unwanted','advertising','suspicious'] as const;
export type ReportCategory = (typeof reportCategories)[number];

export type ModerationState = 'pending' | 'approved' | 'rejected';
export type DraftReport = Readonly<{category:ReportCategory; state:'pending'}>;

export function createReportDraft(category:unknown):DraftReport|null {
  if(typeof category !== 'string' || !reportCategories.some(value=>value===category)) return null;
  return {category:category as ReportCategory,state:'pending'};
}

/** Only moderated records can be considered for aggregate reporting.
 * Never expose reporter identities or unverified subscriber identities.
 */
export function isPubliclyEligible(state:ModerationState):boolean {
  return state === 'approved';
}
