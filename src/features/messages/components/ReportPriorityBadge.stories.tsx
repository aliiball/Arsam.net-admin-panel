import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ReportPriorityBadge } from './ReportPriorityBadge';
import { REPORT_PRIORITIES } from '../data/reports';

const meta = {
  title: 'Messages/ReportPriorityBadge',
  component: ReportPriorityBadge,
  parameters: { layout: 'centered' },
  args: { priority: 'high' },
} satisfies Meta<typeof ReportPriorityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {REPORT_PRIORITIES.map((p) => (
        <ReportPriorityBadge key={p} priority={p} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // Priority reaches assistive tech via aria-label (color is never the sole signal).
    await expect(canvas.getByLabelText('Öncelik: Yüksek')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { priority: 'low' } };
export const Error: Story = { args: { priority: 'normal' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
