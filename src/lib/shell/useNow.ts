import * as React from 'react';

/**
 * A ticking "now" for chrome clocks (the command dock). Injectable for
 * determinism: pass a fixed `injected` Date in stories/tests and the hook
 * returns it verbatim WITHOUT starting a timer (so browser tests stay stable).
 * With no injection it ticks every 30s off the wall clock.
 */
export function useNow(injected?: Date): Date {
  const [now, setNow] = React.useState<Date>(() => injected ?? new Date());

  React.useEffect(() => {
    // Injected clock is fixed — no timer, no state churn (deterministic tests).
    if (injected) return;
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [injected]);

  return injected ?? now;
}

/** Zero-padded 24h clock, e.g. `09:07`. Pure — safe to unit-test. */
export function formatClock(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
