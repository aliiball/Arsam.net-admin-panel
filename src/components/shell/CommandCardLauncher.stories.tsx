import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CommandCardLauncher } from './CommandCardLauncher';
import { CommandPaletteProvider } from './command-palette-context';
import { shellRouterDecorator } from './story-helpers';

const meta = {
  title: 'Shell/CommandCardLauncher',
  component: CommandCardLauncher,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <CommandPaletteProvider defaultOpen>
        <Story />
      </CommandPaletteProvider>
    ),
    shellRouterDecorator({ title: 'Genel Bakış', aiEntity: 'dashboard' }),
  ],
} satisfies Meta<typeof CommandCardLauncher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Identity header + navigation icon-tiles + a natural-language box. */
export const Default: Story = {
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    // Identity header: default user name + role badge (ref #47 chrome).
    await expect(within(dialog).getByText('Ahmet Yönetici')).toBeInTheDocument();
    await expect(within(dialog).getByText('Süper Admin')).toBeInTheDocument();

    // Modules render as navigable icon-tiles; the active module (route `/`) is marked.
    const overview = within(dialog).getByRole('button', { name: /Genel Bakış/ });
    await expect(overview).toHaveAttribute('aria-current', 'page');
    const listings = within(dialog).getByRole('button', { name: /İlanlar/ });
    await expect(listings).toBeInTheDocument();
    await expect(listings).not.toHaveAttribute('aria-current');

    // Footer status is present.
    await expect(within(dialog).getByText('AI hazır')).toBeInTheDocument();
  },
};

/** The NL box PROPOSES an action; nothing applies until the user confirms. */
export const NaturalLanguage: Story = {
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    const input = within(dialog).getByLabelText('Doğal dil komutu');
    await userEvent.type(input, 'ilanlara git');
    await userEvent.click(within(dialog).getByRole('button', { name: /Yorumla/ }));
    // Proposed navigate intent with a confirm button (guardrail: confirm-before-apply).
    await expect(within(dialog).getByText('Sayfaya git')).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: /Git/ })).toBeInTheDocument();
  },
};

/** Module search filters the card grid. */
export const Search: Story = {
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    const search = within(dialog).getByLabelText('Modül ara');
    await userEvent.type(search, 'ilan');
    await expect(within(dialog).getByText('İlanlar')).toBeInTheDocument();
    // Dashboard ("Genel Bakış") is filtered out by the query.
    await expect(within(dialog).queryByText('Genel Bakış')).toBeNull();
  },
};

/** No module matches the search query. */
export const EmptySearch: Story = {
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Modül ara'), 'zzzznope');
    await expect(within(dialog).getByText('Sonuç bulunamadı.')).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
