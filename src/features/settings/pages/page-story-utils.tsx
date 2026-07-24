import { buildSeedSettings } from '../data/settings';
import type { Settings } from '../schemas/settings';

// Reuse the seeded-client + memory-router harness (+ real-error seeder).
export { renderPage, makeSeededClient } from '@/features/listings/pages/page-story-utils';
export { seedQueryError } from '@/features/messages/pages/page-story-utils';

/** Deterministic settings envelope for stories (a clone of the seed). */
export const MOCK_SETTINGS: Settings = buildSeedSettings();
