import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AuditTimeline } from './AuditTimeline';
import { MOCK_AUDIT } from '../pages/page-story-utils';

const meta = {
  title: 'Audit/AuditTimeline',
  component: AuditTimeline,
  parameters: { layout: 'padded' },
  args: { entries: MOCK_AUDIT },
} satisfies Meta<typeof AuditTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // Semantic ordered list.
    await expect(canvas.getByRole('list')).toBeInTheDocument();
    // Human + AI actors are both present and labelled.
    await expect(canvas.getByLabelText('Yapay Zeka aktör: ai:moderator')).toBeInTheDocument();
    await expect(canvas.getAllByLabelText('İnsan aktör: user:current').length).toBeGreaterThan(0);
    // Diff + reason surface.
    await expect(canvas.getByText(/pending → active/)).toBeInTheDocument();
    await expect(canvas.getByText(/Kısmi iade talebi onaylandı/)).toBeInTheDocument();
  },
};
export const WithRenderResource: Story = {
  args: {
    renderResource: (resource: string) => resource.split(':')[1] ?? resource,
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-24 w-full animate-pulse rounded-md" /> };
export const Empty: Story = {
  args: { entries: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Henüz denetim kaydı yok.')).toBeInTheDocument();
  },
};
export const Error: Story = { args: { entries: [], emptyMessage: 'Denetim kaydı yüklenemedi.' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
