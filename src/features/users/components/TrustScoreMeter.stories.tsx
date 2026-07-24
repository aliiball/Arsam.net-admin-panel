import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { TrustScoreMeter } from './TrustScoreMeter';

const meta = {
  title: 'Users/TrustScoreMeter',
  component: TrustScoreMeter,
  parameters: { layout: 'padded' },
  args: { score: 82 },
} satisfies Meta<typeof TrustScoreMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-xs space-y-4">
      <TrustScoreMeter score={88} />
      <TrustScoreMeter score={55} />
      <TrustScoreMeter score={22} />
    </div>
  ),
  play: async ({ canvas }) => {
    const meters = canvas.getAllByRole('meter');
    await expect(meters.length).toBe(3);
    await expect(meters[0]).toHaveAttribute('aria-valuenow', '88');
    await expect(canvas.getByText(/Yüksek/)).toBeInTheDocument();
  },
};
export const Compact: Story = { render: () => <div className="max-w-40"><TrustScoreMeter score={64} compact /></div> };
export const Loading: Story = { render: () => <div className="bg-muted h-8 w-full max-w-xs animate-pulse rounded-md" /> };
export const Empty: Story = { args: { score: 0 } };
export const Error: Story = { args: { score: 15 } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
