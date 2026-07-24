import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

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
