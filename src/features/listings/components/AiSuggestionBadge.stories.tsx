import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AiSuggestionBadge } from './AiSuggestionBadge';

const meta = {
  title: 'Listings/AiSuggestionBadge',
  component: AiSuggestionBadge,
  parameters: { layout: 'centered' },
  args: { suggestion: 'ok', reasons: ['Kurallara uygun'] },
} satisfies Meta<typeof AiSuggestionBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <AiSuggestionBadge suggestion="ok" reasons={['Kurallara uygun']} />
      <AiSuggestionBadge suggestion="uncertain" reasons={['Fotoğraf sayısı az']} />
      <AiSuggestionBadge suggestion="nok" reasons={['Eksik tapu', 'Fiyat piyasa dışı']} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('AI: OK')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-20 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { suggestion: 'uncertain', reasons: [] } };
export const Error: Story = { args: { suggestion: 'nok', reasons: ['Eksik belge'] } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };

/**
 * Reasons are reachable by click/tap (the trigger is a real button), not hover
 * only — so touch + keyboard users can read them. Asserts the final open state.
 */
export const TapReasons: Story = {
  args: { suggestion: 'nok', reasons: ['Eksik tapu', 'Fiyat piyasa dışı'] },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /gerekçeleri gör/ });
    // Touch target: the invisible ::after hit-area expander must clear the 44px
    // minimum (locks in the -inset value against future regressions).
    const rect = trigger.getBoundingClientRect();
    await expect(rect.height + 24).toBeGreaterThanOrEqual(44); // -inset-3 adds 12px/side
    await userEvent.click(trigger);
    // PopoverContent renders in a portal → query the document body.
    const body = within(document.body);
    await expect(await body.findByText('AI gerekçeleri')).toBeInTheDocument();
    await expect(await body.findByText('Eksik tapu')).toBeInTheDocument();
  },
};
