import { describe, expect, it } from 'vitest';

import { ILCE_CENTROIDS, IL_CENTROIDS, listingLatLng, locationCentroid } from './geo';

describe('geo centroids + listing coordinate jitter', () => {
  it('prefers the district centroid when available', () => {
    expect(locationCentroid('34', 'kadikoy')).toEqual(ILCE_CENTROIDS['34:kadikoy']);
  });

  it('falls back to the il centroid for an unknown district', () => {
    expect(locationCentroid('34', 'nonexistent')).toEqual(IL_CENTROIDS['34']);
  });

  it('returns undefined for an unknown il', () => {
    expect(locationCentroid('99', 'x')).toBeUndefined();
    expect(listingLatLng({ id: 'a', il: '99' })).toBeUndefined();
  });

  it('is deterministic for the same id', () => {
    const l = { id: 'listing-42', il: '34', ilce: 'kadikoy' };
    expect(listingLatLng(l)).toEqual(listingLatLng(l));
  });

  it('jitters different ids to different points near the centroid', () => {
    const a = listingLatLng({ id: 'listing-1', il: '34', ilce: 'kadikoy' });
    const b = listingLatLng({ id: 'listing-2', il: '34', ilce: 'kadikoy' });
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a).not.toEqual(b);
    // Within the ±0.02° jitter envelope of the district centroid.
    const base = ILCE_CENTROIDS['34:kadikoy']!;
    expect(Math.abs(a!.lat - base.lat)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(a!.lng - base.lng)).toBeLessThanOrEqual(0.02);
  });
});
