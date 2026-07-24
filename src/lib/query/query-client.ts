import { QueryClient } from '@tanstack/react-query';

/** Shared QueryClient factory (fresh instance per app/test to avoid cache bleed). */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
