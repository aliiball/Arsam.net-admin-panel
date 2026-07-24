import * as React from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';

// Fonts + design tokens for every story.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/inter';
import '../src/styles/theme.css';

import { Providers } from '../src/app/providers';
import type { LayoutMode, ThemePreference } from '../src/config/layout';

const CUSTOM_VIEWPORTS = {
  mobile1: {
    name: 'Mobile (360px)',
    styles: { width: '360px', height: '740px' },
    type: 'mobile' as const,
  },
  mobile2: {
    name: 'Mobile (414px)',
    styles: { width: '414px', height: '896px' },
    type: 'mobile' as const,
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
