import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PackageKindBadge } from './PackageKindBadge';
import { PACKAGE_KINDS } from '../data/promotions';

const meta = {
  title: 'Promotions/PackageKindBadge',
  component: PackageKindBadge,
  parameters: { layout: 'centered' },
  args: { kind: 'featured' },
} satisfies Meta<typeof PackageKindBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {PACKAGE_KINDS.map((k) => (
        <PackageKindBadge key={k} kind={k} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // Kind reaches assistive tech via aria-label (color/icon are never the sole signal).
    await expect(canvas.getByLabelText('Tür: Öne Çıkar')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Tür: Vitrin')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-20 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { kind: 'urgent' } };
export const Error: Story = { args: { kind: 'top' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
