import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

// Fonts (self-hosted variable) + design tokens.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/inter';
import '@/styles/theme.css';

import { Providers } from '@/app/providers';
import { router } from '@/app/router';

async function enableMocking(): Promise<void> {
  // MSW runs in dev AND in the static Pages build (a mock-only demo with no
  // backend). Skipped only under unit tests, which never import this entry.
  if (import.meta.env.MODE === 'test') return;
  const { startMockWorker } = await import('@/lib/msw/browser');
  await startMockWorker();
}

void enableMocking().then(() => {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element #root not found');
  createRoot(rootEl).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
});
