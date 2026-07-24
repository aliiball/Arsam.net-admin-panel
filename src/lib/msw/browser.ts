import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** MSW worker for the browser (dev + Storybook). */
export const worker = setupWorker(...handlers);

/** Start mocking in the browser. Safe to call once at boot. */
export async function startMockWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
