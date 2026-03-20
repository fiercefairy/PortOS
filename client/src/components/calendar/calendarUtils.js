/**
 * Build a Map of subcalendarId → color from the accounts array.
 * Used by Day, Week, and Month views for event color coding.
 */
export function buildSubcalendarColorMap(accounts) {
  const map = new Map();
  for (const account of (accounts || [])) {
    for (const sc of (account.subcalendars || [])) {
      if (sc.color) map.set(sc.calendarId, sc.color);
    }
  }
  return map;
}
