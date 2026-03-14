/**
 * Google OAuth Auto-Configure via CDP Browser
 * Opens Google Cloud Console in the managed browser and guides/captures OAuth credentials.
 */
import { findOrOpenPage, evaluateOnPage, getPages } from './messagePlaywrightSync.js';
import { saveCredentials, getAuthUrl } from './googleAuth.js';

const GCP_CONSOLE_URL = 'https://console.cloud.google.com';
const GCP_CREDENTIALS_URL = 'https://console.cloud.google.com/apis/credentials';
const GCP_ENABLE_API_URL = 'https://console.cloud.google.com/apis/library/calendar-json.googleapis.com';

export async function startAutoConfig(io) {
  console.log('📅 Starting Google OAuth auto-configuration via CDP browser');
  io?.emit('calendar:google:autoconfig', { step: 'launching', message: 'Opening Google Cloud Console...' });

  // Open Google Cloud Console
  const page = await findOrOpenPage(GCP_CONSOLE_URL);
  if (!page) {
    return { error: 'Failed to open browser. Ensure portos-browser is running.', status: 503 };
  }

  io?.emit('calendar:google:autoconfig', { step: 'opened', message: 'Google Cloud Console opened. Please log in if needed.' });
  console.log('📅 Google Cloud Console opened in CDP browser');

  return {
    status: 'started',
    message: 'Google Cloud Console opened. Follow the steps in the UI to create OAuth credentials.',
    pageId: page.id
  };
}

export async function navigateToStep(step, io) {
  const urls = {
    'enable-api': GCP_ENABLE_API_URL,
    'credentials': GCP_CREDENTIALS_URL,
    'create-client': `${GCP_CREDENTIALS_URL}/oauthclient`
  };

  const url = urls[step];
  if (!url) return { error: `Unknown step: ${step}`, status: 400 };

  io?.emit('calendar:google:autoconfig', { step, message: `Navigating to ${step}...` });
  const page = await findOrOpenPage(url);
  if (!page) return { error: 'Browser not available', status: 503 };

  console.log(`📅 Auto-config navigated to ${step}`);
  return { status: 'navigated', step, pageId: page.id };
}

export async function captureCredentials(io) {
  console.log('📅 Attempting to capture OAuth credentials from browser');
  io?.emit('calendar:google:autoconfig', { step: 'capturing', message: 'Scanning for credentials...' });

  // Find the Google Cloud Console page
  const pages = await getPages();
  const gcpPage = pages.find(p => p.url?.includes('console.cloud.google.com'));
  if (!gcpPage) {
    return { error: 'Google Cloud Console not open in browser', status: 404 };
  }

  // Try to extract credentials from the OAuth client creation dialog
  // Google shows a modal with Client ID and Client Secret after creating
  const credentials = await evaluateOnPage(gcpPage, `
    (function() {
      // Strategy 1: Look for the "OAuth client created" dialog
      // The dialog contains two copyable text fields with client ID and secret
      const allText = document.body.innerText;

      // Look for client ID pattern (ends with .apps.googleusercontent.com)
      const clientIdMatch = allText.match(/([0-9]+-[a-zA-Z0-9_]+\\.apps\\.googleusercontent\\.com)/);

      // Look for client secret pattern (GOCSPX- prefix)
      const secretMatch = allText.match(/(GOCSPX-[a-zA-Z0-9_-]+)/);

      if (clientIdMatch && secretMatch) {
        return { clientId: clientIdMatch[1], clientSecret: secretMatch[1] };
      }

      // Strategy 2: Look in input/textarea fields that might contain the values
      const inputs = document.querySelectorAll('input[readonly], input[type="text"], textarea');
      let clientId = null;
      let clientSecret = null;

      for (const input of inputs) {
        const val = input.value || input.textContent || '';
        if (val.includes('.apps.googleusercontent.com')) clientId = val.trim();
        if (val.startsWith('GOCSPX-')) clientSecret = val.trim();
      }

      if (clientId && clientSecret) {
        return { clientId, clientSecret };
      }

      // Strategy 3: Look in any element with aria-label or data attributes
      const elements = document.querySelectorAll('[aria-label*="client"], [aria-label*="secret"], [data-value]');
      for (const el of elements) {
        const val = el.getAttribute('data-value') || el.textContent || '';
        if (val.includes('.apps.googleusercontent.com')) clientId = val.trim();
        if (val.startsWith('GOCSPX-')) clientSecret = val.trim();
      }

      if (clientId && clientSecret) {
        return { clientId, clientSecret };
      }

      // Return what we found (partial or null)
      return clientId ? { clientId, clientSecret: null, partial: true } : null;
    })()
  `);

  if (!credentials) {
    return {
      error: 'Could not find credentials on the page. Make sure the OAuth client creation dialog is visible.',
      status: 404
    };
  }

  if (credentials.partial || !credentials.clientSecret) {
    return {
      error: 'Found Client ID but not Client Secret. The secret is only shown once after creation. You may need to create a new OAuth client.',
      clientId: credentials.clientId,
      status: 404
    };
  }

  // Save the credentials
  await saveCredentials(credentials);
  io?.emit('calendar:google:autoconfig', { step: 'captured', message: 'Credentials captured and saved!' });
  console.log('📅 OAuth credentials captured from browser and saved');

  // Generate the auth URL for the next step
  const authResult = await getAuthUrl();

  return {
    status: 'captured',
    clientId: credentials.clientId,
    authUrl: authResult.url || null
  };
}
