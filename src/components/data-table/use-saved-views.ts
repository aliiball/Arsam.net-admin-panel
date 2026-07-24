import { useCallback, useState } from 'react';

import type { SavedView } from './types';

function loadViews(storageKey: string): SavedView[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

/** Persisted saved views per table key (localStorage now, API later). */
export function useSavedViews(tableKey: string) {
  const storageKey = `arsam.views.${tableKey}`;
  const [views, setViews] = useState<SavedView[]>(() => loadViews(storageKey));

  const persist = useCallback(
    (next: SavedView[]) => {
      setViews(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const saveView = useCallback(
    (name: string, query: string): SavedView => {
      const view: SavedView = { id: `${Date.now()}-${name}`, name, query };
      persist([...views.filter((v) => v.name !== name), view]);
      return view;
    },
    [views, persist],
  );

  const deleteView = useCallback((id: string) => persist(views.filter((v) => v.id !== id)), [views, persist]);

  return { views, saveView, deleteView };
}
