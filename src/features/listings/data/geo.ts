/**
 * Approximate geo centroids for the sample taxonomy (il → ilçe).
 * NOTE: coordinates are mock/approximate — real values arrive with the backend.
 * Kept as pure functions so map coordinate/jitter logic is unit-testable in jsdom
 * (Leaflet itself needs a real DOM and is only exercised in browser Storybook tests).
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** İl centroid (approx.), used as fallback when the district is unknown. */
export const IL_CENTROIDS: Record<string, LatLng> = {
  '34': { lat: 41.0082, lng: 28.9784 }, // İstanbul
  '06': { lat: 39.9334, lng: 32.8597 }, // Ankara
  '35': { lat: 38.4237, lng: 27.1428 }, // İzmir
};

/** İlçe centroids (approx.), keyed by `${il}:${ilce}`. */
export const ILCE_CENTROIDS: Record<string, LatLng> = {
  '34:kadikoy': { lat: 40.9833, lng: 29.0333 },
  '34:besiktas': { lat: 41.043, lng: 29.0094 },
  '06:cankaya': { lat: 39.9179, lng: 32.8627 },
  '06:kecioren': { lat: 39.9847, lng: 32.836 },
  '35:konak': { lat: 38.418, lng: 27.128 },
  '35:bornova': { lat: 38.47, lng: 27.22 },
};

/** Default map center (İstanbul) and zoom for an unresolved location. */
export const DEFAULT_CENTER: LatLng = { lat: 39.5, lng: 33.5 };

/** Base coordinate for an il/ilçe pair, preferring the district centroid. */
export function locationCentroid(il: string, ilce?: string): LatLng | undefined {
  if (ilce) {
    const district = ILCE_CENTROIDS[`${il}:${ilce}`];
    if (district) return district;
  }
  return IL_CENTROIDS[il];
}

/** Deterministic 32-bit hash of a string (FNV-1a). */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Deterministic listing-level coordinate: the il/ilçe centroid plus a small,
 * id-seeded jitter (~±0.02°, roughly ±2 km) so co-located listings don't stack
 * on one pixel. Returns `undefined` when the location can't be resolved.
 */
export function listingLatLng(listing: {
  id: string;
  il: string;
  ilce?: string;
}): LatLng | undefined {
  const base = locationCentroid(listing.il, listing.ilce);
  if (!base) return undefined;
  const h = hashString(listing.id);
  // Two independent [-0.5, 0.5) offsets from different halves of the hash.
  const jlat = (((h & 0xffff) / 0xffff) - 0.5) * 0.04;
  const jlng = ((((h >>> 16) & 0xffff) / 0xffff) - 0.5) * 0.04;
  return { lat: base.lat + jlat, lng: base.lng + jlng };
}
