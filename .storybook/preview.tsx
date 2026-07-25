import * as React from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';

// Fonts + design tokens for every story.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/inter';
import '../src/styles/theme.css';

import { Providers } from '../src/app/providers';
import type { LayoutMode, ThemePreference } from '../src/config/layout';

// Aligned to the 8-token breakpoint scale (task 019). xs/sm/lg map to the named
// tokens (320/480/768); tablet(768)+desktop(1024) bracket the shell/table
// convergence threshold (`xl` = 1024) for regression checks. 360/414 kept as the
// two most common real phone widths.
const CUSTOM_VIEWPORTS = {
  bpXs: {
    name: 'xs — 320px (küçük telefon)',
    styles: { width: '320px', height: '740px' },
    type: 'mobile' as const,
  },
  mobile1: {
    name: 'Telefon — 360px',
    styles: { width: '360px', height: '740px' },
    type: 'mobile' as const,
  },
  mobile2: {
    name: 'Telefon — 414px',
    styles: { width: '414px', height: '896px' },
    type: 'mobile' as const,
  },
  bpSm: {
    name: 'sm — 480px (telefon)',
    styles: { width: '480px', height: '900px' },
    type: 'mobile' as const,
  },
  bpMd: {
    name: 'md — 640px (büyük telefon)',
    styles: { width: '640px', height: '900px' },
    type: 'mobile' as const,
  },
  bpLg: {
    name: 'lg — 768px (tablet portre)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet' as const,
  },
  bpXl: {
    name: 'xl — 1024px (masaüstü switch)',
    styles: { width: '1024px', height: '800px' },
    type: 'desktop' as const,
  },
};

/** Wrap every story in the app providers, honoring the theme + layout toolbars. */
const withProviders: Decorator = (Story, context) => {
  const theme = (context.globals.theme as ThemePreference | undefined) ?? 'light';
  const mode = (context.globals.layout as LayoutMode | undefined) ?? 'sidebar';
  return (
    <Providers key={`${theme}-${mode}`} initialLayout={{ theme, mode }} persistLayout={false}>
      <div className="bg-background text-foreground min-h-svh p-4">
        <Story />
      </div>
    </Providers>
  );
};

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    viewport: { options: CUSTOM_VIEWPORTS },
    a11y: { test: 'error' },
  },
  initialGlobals: {
    theme: 'light',
    layout: 'sidebar',
  },
  globalTypes: {
    theme: {
      description: 'Tema (light/dark)',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Aydınlık' },
          { value: 'dark', title: 'Koyu' },
        ],
        dynamicTitle: true,
      },
    },
    layout: {
      description: 'Yerleşim modu (sidebar/topnav)',
      toolbar: {
        title: 'Yerleşim',
        icon: 'sidebar',
        items: [
          { value: 'sidebar', title: 'Sidebar' },
          { value: 'topnav', title: 'Topnav' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withProviders],
};

export default preview;
