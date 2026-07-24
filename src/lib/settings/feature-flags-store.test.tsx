import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { cloneFlags, DEFAULT_FLAGS } from './feature-flags';
import { resetFeatureFlags, setFeatureFlags, useFeatureFlag } from './feature-flags-store';

// The store is global mutable state — reset after each test so other suites
// (ListingDetailPage stories, etc.) see the default flags.
afterEach(() => resetFeatureFlags());

/** A tiny consumer standing in for the real gated behavior (map/AI badge). */
function MapCard() {
  const show = useFeatureFlag('listingDetailMap');
  return show ? <span>HARİTA</span> : null;
}

describe('feature-flag store bridge', () => {
  it('reflects a live flag toggle in a useFeatureFlag consumer', () => {
    render(<MapCard />);

    // Enabled in the seed → gated behavior renders.
    expect(screen.getByText('HARİTA')).toBeInTheDocument();

    // Disable the flag live via the store — the consumer must re-render and hide.
    const next = cloneFlags(DEFAULT_FLAGS);
    next.listingDetailMap = false;
    act(() => setFeatureFlags(next));

    expect(screen.queryByText('HARİTA')).not.toBeInTheDocument();

    // Re-enable — it comes back.
    act(() => resetFeatureFlags());
    expect(screen.getByText('HARİTA')).toBeInTheDocument();
  });
});
