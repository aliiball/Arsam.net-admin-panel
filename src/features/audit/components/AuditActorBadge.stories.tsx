import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AuditActorBadge } from './AuditActorBadge';

const meta = {
  title: 'Audit/AuditActorBadge',
  component: AuditActorBadge,
  parameters: { layout: 'centered' },
  args: { actor: 'user:current' },
} satisfies Meta<typeof AuditActorBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <AuditActorBadge actor="user:current" />
      <AuditActorBadge actor="ai:moderator" />
      <AuditActorBadge actor="ai:risk-scanner" />
    </div>
  ),
  play: async ({ canvas }) => {
    // AI vs human reaches assistive tech via aria-label (color is never the sole signal).
    await expect(canvas.getByLabelText('İnsan aktör: user:current')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Yapay Zeka aktör: ai:moderator')).toBeInTheDocument();
  },
};
export const Human: Story = { args: { actor: 'user:current' } };
export const Ai: Story = { args: { actor: 'ai:moderator' } };
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-28 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { actor: 'user:system' } };
export const Error: Story = { args: { actor: 'ai:risk-scanner' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
