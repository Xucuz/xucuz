import type {ModerationState} from './report-policy';

/** Pure transition policy for the offline demo; no persistence or side effects.
 * Re-review requires a separate future appeal workflow, never silent overwrite.
 */
export function applyModerationDecision(
  current:ModerationState,
  decision:'approved'|'rejected'
):ModerationState|null {
  if(current!=='pending') return null;
  return decision;
}
