import * as React from 'react';

import {
  cloneFlags,
  DEFAULT_FLAGS,
  type FeatureFlagKey,
  type FeatureFlags,
} from './feature-flags';

/**
 * The LIVE feature-flag state. Seeded from `DEFAULT_FLAGS`, but editable at
 * runtime by the settings screen. `useFeatureFlag(key)` reads this copy via
 * `useSyncExternalStore`, so a toggle on `/settings` reflects everywhere that
 * gates behavior immediately (mirrors `lib/permissions/permission-store`).
 */
let current: FeatureFlags = cloneFlags(DEFAULT_FLAGS);
const listeners = new Set<() => void>();

export function getFeatureFlags(): FeatureFlags {
  return current;
}

/** Replace the live flags (always pass a NEW object) and notify subscribers. */
export function setFeatureFlags(next: FeatureFlags): void {
  current = next;
  listeners.forEach((listener) => listener());
}

/** Reset the live flags back to defaults (tests, dev). */
export function resetFeatureFlags(): void {
  setFeatureFlags(cloneFlags(DEFAULT_FLAGS));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribe a React tree to the whole live flag record. */
export function useFeatureFlags(): FeatureFlags {
  return React.useSyncExternalStore(subscribe, getFeatureFlags, getFeatureFlags);
}

/** Subscribe to a single flag; re-renders only its consumers when it flips. */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const getSnapshot = React.useCallback(() => current[key], [key]);
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
