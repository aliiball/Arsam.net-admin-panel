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

/** Card grid of permitted modules + a natural-language box. */
export const Default: Story = {
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByText('Komut merkezi')).toBeInTheDocument();
    // Module cards render (İlanlar is visible to the default role).
    await expect(within(dialog).getByText('İlanlar')).toBeInTheDocument();

    // Affordance split: a LEAF module (Genel Bakış, no children) is a single click
    // target → shared `Card interactive` hover-lift. A PARENT module (İlanlar, has
    // child quick-action chips) is multi-action → plain container, NOT interactive.
    const leaf = within(dialog).getByText('Genel Bakış').closest('[data-slot="card"]');
    await expect(leaf).not.toBeNull();
    await expect(leaf).toHaveAttribute('data-interactive');
    await expect(within(dialog).getByText('İlanlar').closest('[data-slot="card"]')).toBeNull();
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
