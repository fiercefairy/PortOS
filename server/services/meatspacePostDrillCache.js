/**
 * POST Drill Cache — Pre-generates wordplay drills so users don't wait.
 *
 * On startup, fills cache to MIN_PER_TYPE. When a drill is consumed,
 * background replenishment kicks in. Cache persists to disk.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { PATHS, safeJSONParse } from '../lib/fileUtils.js';
import { generateLlmDrill } from './meatspacePostLlm.js';

const CACHE_FILE = join(PATHS.data, 'meatspace', 'post-drill-cache.json');
const MIN_PER_TYPE = 3;
const MAX_PER_TYPE = 10;

// Only cache LLM-generated drill types used in wordplay training
const CACHEABLE_TYPES = [
  'compound-chain', 'bridge-word', 'double-meaning', 'idiom-twist',
];

let cache = {}; // { type: [drill, drill, ...] }
let replenishing = new Set(); // types currently being refilled
let saveQueued = false;

async function loadCache() {
  const raw = await readFile(CACHE_FILE, 'utf-8').catch(() => '{}');
  cache = safeJSONParse(raw, {});
  for (const type of CACHEABLE_TYPES) {
    if (!Array.isArray(cache[type])) cache[type] = [];
  }
}

async function saveCache() {
  await mkdir(dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function debouncedSave() {
  if (saveQueued) return;
  saveQueued = true;
  setTimeout(async () => {
    saveQueued = false;
    await saveCache().catch(() => {});
  }, 500);
}

function replenishType(type, providerId, model) {
  if (replenishing.has(type)) return;
  if ((cache[type]?.length || 0) >= MIN_PER_TYPE) return;

  replenishing.add(type);
  const needed = MAX_PER_TYPE - (cache[type]?.length || 0);

  (async () => {
    let generated = 0;
    try {
      for (let i = 0; i < needed; i++) {
        const drill = await generateLlmDrill(type, { count: 5 }, providerId, model).catch(err => {
          console.log(`⚠️ POST cache: failed to generate ${type}: ${err.message}`);
          return null;
        });
        if (drill) {
          cache[type].push(drill);
          generated++;
        }
      }
      if (generated > 0) {
        await saveCache();
        console.log(`📦 POST cache: added ${generated} ${type} drills (total: ${cache[type].length})`);
      }
    } finally {
      replenishing.delete(type);
    }
  })();
}

/**
 * Pull a cached drill for the given type. Returns null if cache is empty.
 */
export function getCachedDrill(type) {
  if (!CACHEABLE_TYPES.includes(type)) return null;
  const drills = cache[type];
  if (!drills?.length) return null;
  const result = drills.shift();
  debouncedSave();
  return result;
}

/**
 * Trigger background replenishment after consuming a drill.
 */
export function triggerReplenish(type, providerId, model) {
  if (!CACHEABLE_TYPES.includes(type)) return;
  replenishType(type, providerId, model);
  debouncedSave();
}

/**
 * Get cache stats for debugging/status.
 */
export function getCacheStats() {
  const stats = {};
  for (const type of CACHEABLE_TYPES) {
    stats[type] = cache[type]?.length || 0;
  }
  return stats;
}

/**
 * Initialize cache: load from disk, start background fill for empty types.
 */
export async function initDrillCache(providerId, model) {
  await loadCache();
  const stats = CACHEABLE_TYPES.map(t => `${t}:${cache[t]?.length || 0}`).join(' ');
  console.log(`📦 POST drill cache loaded: ${stats}`);

  for (const type of CACHEABLE_TYPES) {
    if ((cache[type]?.length || 0) < MIN_PER_TYPE) {
      replenishType(type, providerId, model);
    }
  }
}
