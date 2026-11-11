/** Validation only. Do not log, persist or include phone numbers in URLs. */
export function normalizeTurkishMobile(input: string): string | null {
  const cleaned = input.replace(/[\s().-]/g, '');
  if (!/^\+?\d+$/.test(cleaned)) return null;
  let national: string;
  if (cleaned.startsWith('+90')) national = cleaned.slice(3);
  else if (cleaned.startsWith('90') && cleaned.length === 12) national = cleaned.slice(2);
  else if (cleaned.startsWith('0')) national = cleaned.slice(1);
  else national = cleaned;
  if (!/^5\d{9}$/.test(national)) return null;
  return '+90' + national;
}
