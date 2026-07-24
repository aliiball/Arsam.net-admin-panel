import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AppShell } from './AppShell';
import { shellRouterDecorator } from './story-helpers';

const SampleContent = (
  <div className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-semibold">Genel Bakış</h1>
    <p className="text-muted-foreground mt-1">
      Kenar çubuğu ve üst menü modları tek nav şemasından beslenir.
    </p>
  </div>
);

const meta = {
  title: 'Shell/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  decorators: [shellRouterDecorator()],
  args: { children: SampleContent },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('sidebar')).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: 'Ana gezinme' })).toBeInTheDocument();
  },
};

export const Topnav: Story = {
  globals: { layout: 'topnav' },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('topnav')).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  globals: { layout: 'sidebar' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Alt gezinme' })).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: {
    children: (
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="bg-muted h-6 w-40 animate-pulse rounded" />
        <div className="bg-muted h-24 w-full animate-pulse rounded" />
      </div>
    ),
  },
};

export const Empty: Story = {
  args: {
    children: (
      <div className="text-muted-foreground grid min-h-40 place-items-center text-sm">
        Görüntülenecek içerik yok.
      </div>
    ),
  },
};

export const Error: Story = {
  args: {
    children: (
      <div className="text-destructive grid min-h-40 place-items-center text-sm">
        İçerik yüklenemedi.
      </div>
    ),
  },
};

export const CommandPaletteOpen: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvasElement }) => {
    await userEvent.keyboard('{Meta>}k{/Meta}');
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(within(dialog).getByPlaceholderText(/Modül ara/i)).toBeInTheDocument();
    // Close to keep the DOM clean for a11y checks.
    await userEvent.keyboard('{Escape}');
    void canvasElement;
  },
};
