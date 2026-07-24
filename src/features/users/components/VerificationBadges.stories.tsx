import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { VerificationBadges } from './VerificationBadges';

const meta = {
  title: 'Users/VerificationBadges',
  component: VerificationBadges,
  parameters: { layout: 'padded' },
  args: { verification: { identity: 'verified', office: 'pending', phone: 'verified' } },
} satisfies Meta<typeof VerificationBadges>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list', { name: 'Doğrulama durumu' })).toBeInTheDocument();
    // The level must reach assistive tech via the accessible name, not just color/icon.
    await expect(canvas.getByRole('listitem', { name: 'Kimlik: Doğrulandı' })).toBeInTheDocument();
    await expect(canvas.getByRole('listitem', { name: 'Ofis Belgesi: İnceleniyor' })).toBeInTheDocument();
  },
};
export const AllLevels: Story = {
  args: { verification: { identity: 'verified', office: 'rejected', phone: 'none' } },
};
export const Loading: Story = { render: () => <div className="bg-muted h-6 w-40 animate-pulse rounded-md" /> };
export const Empty: Story = {
  args: { verification: { identity: 'none', office: 'none', phone: 'none' }, hideNone: true },
};
export const Error: Story = {
  args: { verification: { identity: 'rejected', office: 'rejected', phone: 'rejected' } },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
