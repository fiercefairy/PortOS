import { request } from './apiCore.js';

export const getOpenClawStatus = () => request('/openclaw/status', { silent: true });
export const getOpenClawSessions = () => request('/openclaw/sessions', { silent: true });
export const getOpenClawMessages = (sessionId, options = {}) => {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit);
  const query = params.toString();
  return request(`/openclaw/sessions/${encodeURIComponent(sessionId)}/messages${query ? `?${query}` : ''}`, { silent: true });
};
export const sendOpenClawMessage = (sessionId, message, context) => request(`/openclaw/sessions/${encodeURIComponent(sessionId)}/messages`, {
  method: 'POST',
  body: JSON.stringify({ message, context }),
  silent: true
});
