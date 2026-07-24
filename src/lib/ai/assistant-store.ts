import * as React from 'react';

/**
 * Live open/closed state for the global AssistantDock. A tiny
 * `useSyncExternalStore` bridge (mirrors `permission-store` / `feature-flags-store`)
 * so ANY surface — the FAB launcher, the ⌘K command palette, a topbar affordance —
 * can open the assistant without prop-drilling. Route context is read reactively
 * from the router inside the panel, so it is NOT duplicated here.
 */

let open = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function getAssistantOpen(): boolean {
  return open;
}

export function setAssistantOpen(next: boolean): void {
  if (open === next) return;
  open = next;
  emit();
}

export function toggleAssistant(): void {
  setAssistantOpen(!open);
}

/** Reset to closed (tests, story cleanup). */
export function resetAssistant(): void {
  setAssistantOpen(false);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface AssistantState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/** Subscribe a React tree to the live assistant open state. */
export function useAssistant(): AssistantState {
  const value = React.useSyncExternalStore(subscribe, getAssistantOpen, getAssistantOpen);
  return React.useMemo(
    () => ({ open: value, setOpen: setAssistantOpen, toggle: toggleAssistant }),
    [value],
  );
}
