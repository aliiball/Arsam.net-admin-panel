import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import { writeAudit } from '@/lib/audit';
import { buildSeedSettings } from '../data/settings';
import {
  generalSettingsSchema,
  layoutDefaultsSchema,
  settingsPatchSchema,
  type FeatureFlagKey,
  type Settings,
} from '../schemas/settings';

// ---------------------------------------------------------------------------
// Runtime state — the "server" source of truth for settings.
// ---------------------------------------------------------------------------

let settingsDb: Settings = buildSeedSettings();

/** Reset the mock settings DB (tests). */
export function resetSettingsDb(): void {
  settingsDb = buildSeedSettings();
}

/** Read-only snapshot of the current server settings. */
export function getSettingsSnapshot(): Settings {
  return {
    general: { ...settingsDb.general },
    flags: { ...settingsDb.flags },
    layoutDefaults: { ...settingsDb.layoutDefaults },
  };
}

/** Shallow-diff two records into { before, after } of only the changed keys. */
function diffChanged<T extends Record<string, unknown>>(
  prev: T,
  next: T,
): { before: Partial<T>; after: Partial<T> } | null {
  const before: Partial<T> = {};
  const after: Partial<T> = {};
  let changed = false;
  for (const key of Object.keys(next) as (keyof T)[]) {
    if (prev[key] !== next[key]) {
      before[key] = prev[key];
      after[key] = next[key];
      changed = true;
    }
  }
  return changed ? { before, after } : null;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const settingsHandlers = [
  http.get(`${API_BASE_URL}/settings`, () => HttpResponse.json(getSettingsSnapshot())),

  http.patch(`${API_BASE_URL}/settings`, async ({ request }) => {
    const parsed = settingsPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' },
        { status: 422 },
      );
    }
    const patch = parsed.data;

    // General/system — one audit entry for the changed subset.
    if (patch.general) {
      // Re-parse the merge so the result is a clean, fully-typed GeneralSettings.
      const nextGeneral = generalSettingsSchema.parse({ ...settingsDb.general, ...patch.general });
      const delta = diffChanged(settingsDb.general, nextGeneral);
      if (delta) {
        settingsDb = { ...settingsDb, general: nextGeneral };
        writeAudit({
          actor: 'user:current',
          action: 'settings.update',
          resource: 'settings:general',
          before: delta.before,
          after: delta.after,
        });
      }
    }

    // Layout defaults — one audit entry for the changed subset.
    if (patch.layoutDefaults) {
      const nextLayout = layoutDefaultsSchema.parse({ ...settingsDb.layoutDefaults, ...patch.layoutDefaults });
      const delta = diffChanged(settingsDb.layoutDefaults, nextLayout);
      if (delta) {
        settingsDb = { ...settingsDb, layoutDefaults: nextLayout };
        writeAudit({
          actor: 'user:current',
          action: 'settings.update',
          resource: 'settings:layout',
          before: delta.before,
          after: delta.after,
        });
      }
    }

    // Feature flags — one audit entry PER changed flag (flag.enable/flag.disable).
    if (patch.flags) {
      const nextFlags = { ...settingsDb.flags };
      for (const [key, value] of Object.entries(patch.flags) as [FeatureFlagKey, boolean][]) {
        const was = settingsDb.flags[key];
        if (was === value) continue; // idempotent toggle — no-op, no audit
        nextFlags[key] = value;
        writeAudit({
          actor: 'user:current',
          action: value ? 'flag.enable' : 'flag.disable',
          resource: `flag:${key}`,
          before: { [key]: was ? 'açık' : 'kapalı' },
          after: { [key]: value ? 'açık' : 'kapalı' },
        });
      }
      settingsDb = { ...settingsDb, flags: nextFlags };
    }

    return HttpResponse.json(getSettingsSnapshot());
  }),
];
