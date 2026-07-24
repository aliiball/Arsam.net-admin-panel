import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ReportStatusBadge } from './ReportStatusBadge';
import { REPORT_STATUSES } from '../data/reports';

const meta = {
  title: 'Messages/ReportStatusBadge',
  component: ReportStatusBadge,
  parameters: { layout: 'centered' },
  args: { status: 'open' },
} satisfies Meta<typeof ReportStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {REPORT_STATUSES.map((s) => (
        <ReportStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Açık')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { status: 'dismissed' } };
export const Error: Story = { args: { status: 'escalated' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
