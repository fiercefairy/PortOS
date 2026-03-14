import { google } from 'googleapis';
import { getAuthenticatedClient } from './googleAuth.js';
import { getAccount } from './calendarAccounts.js';
import { pushSyncEvents } from './calendarGoogleSync.js';

export async function apiSyncAccount(accountId, io) {
  const account = await getAccount(accountId);
  if (!account) return { error: 'Account not found', status: 404 };
  if (account.type !== 'google-calendar') return { error: 'Not a Google Calendar account', status: 400 };

  const auth = await getAuthenticatedClient();
  if (!auth) return { error: 'Google OAuth not configured. Set up credentials in Config tab.', status: 401 };

  const enabledCalendars = (account.subcalendars || []).filter(sc => sc.enabled && !sc.dormant);
  if (enabledCalendars.length === 0) return { error: 'No enabled subcalendars', status: 400 };

  io?.emit('calendar:sync:started', { accountId, method: 'api' });
  console.log(`📅 Starting Google API sync for ${account.name} (${enabledCalendars.length} calendars)`);

  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 7);
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 30);

  let totalNew = 0;
  let totalUpdated = 0;
  let totalPruned = 0;
  const results = [];

  for (const sc of enabledCalendars) {
    io?.emit('calendar:sync:progress', { accountId, message: `Fetching ${sc.name}...` });

    const allEvents = [];
    let pageToken;

    do {
      const response = await calendar.events.list({
        calendarId: sc.calendarId,
        timeMin: pastDate.toISOString(),
        timeMax: futureDate.toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
        pageToken
      });
      const items = response.data.items || [];
      allEvents.push(...items.map(item => ({
        id: item.id,
        summary: item.summary || '',
        start: item.start,
        end: item.end,
        location: item.location || '',
        description: item.description || '',
        status: item.status || 'confirmed'
      })));
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    const syncResult = await pushSyncEvents(accountId, sc.calendarId, sc.name, allEvents, null);
    totalNew += syncResult.newEvents;
    totalUpdated += syncResult.updated;
    totalPruned += syncResult.pruned;
    results.push({ calendarId: sc.calendarId, calendarName: sc.name, events: allEvents.length, ...syncResult });
    console.log(`📅 Google API: ${sc.name} → ${allEvents.length} events`);
  }

  io?.emit('calendar:sync:completed', { accountId, newEvents: totalNew, updated: totalUpdated, pruned: totalPruned, status: 'success', method: 'api' });
  console.log(`📅 Google API sync complete for ${account.name}: ${totalNew} new, ${totalUpdated} updated, ${totalPruned} pruned`);

  return { newEvents: totalNew, updated: totalUpdated, pruned: totalPruned, calendars: results, status: 'success' };
}

export async function apiDiscoverCalendars(accountId) {
  const account = await getAccount(accountId);
  if (!account) return { error: 'Account not found', status: 404 };

  const auth = await getAuthenticatedClient();
  if (!auth) return { error: 'Google OAuth not configured', status: 401 };

  const calendar = google.calendar({ version: 'v3', auth });
  const allCalendars = [];
  let pageToken;

  do {
    const response = await calendar.calendarList.list({ pageToken });
    allCalendars.push(...(response.data.items || []));
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  // Merge with existing subcalendars
  const existingMap = new Map((account.subcalendars || []).map(sc => [sc.calendarId, sc]));
  const merged = allCalendars.map(cal => {
    const existing = existingMap.get(cal.id);
    return {
      calendarId: cal.id,
      name: cal.summaryOverride || cal.summary || cal.id,
      color: cal.backgroundColor || existing?.color || '',
      enabled: existing?.enabled ?? false,
      dormant: existing?.dormant ?? false,
      goalIds: existing?.goalIds || [],
      addedAt: existing?.addedAt || new Date().toISOString()
    };
  });

  const { updateSubcalendars } = await import('./calendarAccounts.js');
  await updateSubcalendars(accountId, merged);

  console.log(`📅 Discovered ${allCalendars.length} calendars via Google API for ${account.name}`);
  return { calendars: merged, status: 'success' };
}
