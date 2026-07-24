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
  if (!import.meta.env.DEV) return;
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
