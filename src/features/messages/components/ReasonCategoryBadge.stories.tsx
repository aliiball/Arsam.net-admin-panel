import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ReasonCategoryBadge } from './ReasonCategoryBadge';
import { REASON_CATEGORIES } from '../data/reports';

const meta = {
  title: 'Messages/ReasonCategoryBadge',
  component: ReasonCategoryBadge,
  parameters: { layout: 'centered' },
  args: { category: 'fraud' },
} satisfies Meta<typeof ReasonCategoryBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {REASON_CATEGORIES.map((c) => (
        <ReasonCategoryBadge key={c} category={c} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Sebep: Dolandırıcılık')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-20 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { category: 'other' } };
export const Error: Story = { args: { category: 'inappropriate' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
