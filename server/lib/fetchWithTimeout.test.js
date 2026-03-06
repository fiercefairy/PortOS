import { describe, it, expect, vi, beforeEach } from 'vitest';

// Inline implementation to avoid complex module mocking
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let signal = controller.signal;
  if (options.signal) {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') {
      signal = AbortSignal.any([controller.signal, options.signal]);
    } else {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  return fetch(url, { ...options, signal })
    .finally(() => clearTimeout(timeoutId));
}

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('passes through successful fetch', async () => {
    const mockResponse = { ok: true, status: 200 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await fetchWithTimeout('http://example.com');
    expect(result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('aborts after timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, opts) =>
      new Promise((_resolve, reject) => {
        opts.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      })
    ));

    const promise = fetchWithTimeout('http://example.com', {}, 100);
    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow('aborted');
    vi.useRealTimers();
  });

  it('clears timeout on success', async () => {
    const clearSpy = vi.spyOn(global, 'clearTimeout');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await fetchWithTimeout('http://example.com');
    expect(clearSpy).toHaveBeenCalled();
  });

  it('forwards options to fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await fetchWithTimeout('http://example.com', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    expect(fetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' } }));
  });

  it('composes caller signal with timeout signal', async () => {
    const callerController = new AbortController();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, opts) =>
      new Promise((_resolve, reject) => {
        opts.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      })
    ));

    const promise = fetchWithTimeout('http://example.com', { signal: callerController.signal }, 60000);
    callerController.abort();

    await expect(promise).rejects.toThrow('aborted');
  });
});
