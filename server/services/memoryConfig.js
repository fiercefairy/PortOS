/**
 * Shared memory configuration defaults.
 *
 * Extracted into its own module to avoid circular dependencies between
 * memoryBackend.js (which re-exports both backends) and the backend
 * implementations (memory.js, memoryDB.js) that it imports.
 */

export const DEFAULT_MEMORY_CONFIG = {
  enabled: true,
  embeddingProvider: 'lmstudio',
  embeddingEndpoint: 'http://localhost:1234/v1/embeddings',
  embeddingModel: 'text-embedding-nomic-embed-text-v2-moe',
  embeddingDimension: 768,
  maxMemories: 10000,
  maxContextTokens: 2000,
  minRelevanceThreshold: 0.7,
  autoExtractEnabled: true,
  consolidationIntervalMs: 86400000,
  decayIntervalMs: 86400000
};
