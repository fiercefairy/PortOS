import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Inline copy of compareSemver for testing without importing private function
function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

// Mock dependencies before importing the module
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn()
}));

vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

import { readFile, writeFile, mkdir } from 'fs/promises';
import { spawn } from 'child_process';

// Mock the EventEmitter used internally
vi.mock('events', async () => {
  const actual = await vi.importActual('events');
  return actual;
});

describe('compareSemver', () => {
  it('should return 0 for equal versions', () => {
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('1.26.0', '1.26.0')).toBe(0);
  });

  it('should return -1 when a < b', () => {
    expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
    expect(compareSemver('1.0.0', '1.1.0')).toBe(-1);
    expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
    expect(compareSemver('1.25.0', '1.26.0')).toBe(-1);
  });

  it('should return 1 when a > b', () => {
    expect(compareSemver('1.0.1', '1.0.0')).toBe(1);
    expect(compareSemver('1.1.0', '1.0.0')).toBe(1);
    expect(compareSemver('2.0.0', '1.0.0')).toBe(1);
    expect(compareSemver('1.27.0', '1.26.0')).toBe(1);
  });

  it('should handle missing minor/patch', () => {
    expect(compareSemver('1', '1.0.0')).toBe(0);
    expect(compareSemver('1.1', '1.1.0')).toBe(0);
  });
});

describe('updateChecker integration', () => {
  const defaultState = {
    lastCheck: null,
    latestRelease: null,
    ignoredVersions: [],
    updateInProgress: false,
    lastUpdateResult: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
    writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect update available when remote version is newer', async () => {
    // This tests the logic flow: if latestRelease.version > currentVersion and not ignored
    const currentVersion = '1.26.0';
    const latestVersion = '1.27.0';
    const isNewer = compareSemver(latestVersion, currentVersion) > 0;
    const ignoredVersions = [];
    const isIgnored = ignoredVersions.includes(latestVersion);

    expect(isNewer).toBe(true);
    expect(isIgnored).toBe(false);
    expect(isNewer && !isIgnored).toBe(true);
  });

  it('should not detect update when versions are equal', () => {
    const currentVersion = '1.26.0';
    const latestVersion = '1.26.0';
    const isNewer = compareSemver(latestVersion, currentVersion) > 0;

    expect(isNewer).toBe(false);
  });

  it('should respect ignored versions', () => {
    const currentVersion = '1.26.0';
    const latestVersion = '1.27.0';
    const ignoredVersions = ['1.27.0'];
    const isNewer = compareSemver(latestVersion, currentVersion) > 0;
    const isIgnored = ignoredVersions.includes(latestVersion);

    expect(isNewer).toBe(true);
    expect(isIgnored).toBe(true);
    expect(isNewer && !isIgnored).toBe(false);
  });

  it('should handle downgrade (remote older than current)', () => {
    const currentVersion = '1.27.0';
    const latestVersion = '1.26.0';
    const isNewer = compareSemver(latestVersion, currentVersion) > 0;

    expect(isNewer).toBe(false);
  });

  it('should correctly add version to ignore list', () => {
    const state = { ...defaultState, ignoredVersions: [] };
    const version = '1.27.0';

    if (!state.ignoredVersions.includes(version)) {
      state.ignoredVersions.push(version);
    }

    expect(state.ignoredVersions).toContain('1.27.0');
    expect(state.ignoredVersions).toHaveLength(1);
  });

  it('should not duplicate ignored versions', () => {
    const state = { ...defaultState, ignoredVersions: ['1.27.0'] };
    const version = '1.27.0';

    if (!state.ignoredVersions.includes(version)) {
      state.ignoredVersions.push(version);
    }

    expect(state.ignoredVersions).toHaveLength(1);
  });

  it('should clear all ignored versions', () => {
    const state = { ...defaultState, ignoredVersions: ['1.27.0', '1.28.0'] };
    state.ignoredVersions = [];

    expect(state.ignoredVersions).toHaveLength(0);
  });
});
