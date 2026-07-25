import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** MSW worker for the browser (dev + Storybook). */
export const worker = setupWorker(...handlers);

/** Start mocking in the browser. Safe to call once at boot. */
export async function startMockWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    // Base-aware so the worker resolves under the Pages `/<repo>/` subpath
    // (dev BASE_URL is `/`, i.e. the default `/mockServiceWorker.js`).
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}
