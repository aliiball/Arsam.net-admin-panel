import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { LocationTree } from './LocationTree';
import { MOCK_PROVINCES } from '../pages/page-story-utils';
import type { Province } from '../schemas/location';

const meta = {
  title: 'Locations/LocationTree',
  component: LocationTree,
  parameters: { layout: 'padded' },
  args: { province: MOCK_PROVINCES[0]! },
} satisfies Meta<typeof LocationTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Kadıköy')).toBeInTheDocument();
    // Reorder affordance is present for the manager role.
    await expect(canvas.getByLabelText('Kadıköy aşağı taşı')).toBeInTheDocument();
    // Expanding a district reveals its neighborhoods.
    await userEvent.click(canvas.getByLabelText('Kadıköy mahallelerini göster'));
    await expect(await canvas.findByText('Moda')).toBeInTheDocument();
  },
};

const emptyProvince: Province = { ...MOCK_PROVINCES[1]!, districts: [] };

export const Empty: Story = {
  args: { province: emptyProvince },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Henüz ilçe yok')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="bg-muted h-14 animate-pulse rounded-md" />
      <div className="bg-muted h-14 animate-pulse rounded-md" />
    </div>
  ),
};
export const Error: Story = { args: { province: emptyProvince } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
