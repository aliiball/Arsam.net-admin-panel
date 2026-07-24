import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Breadcrumbs } from './Breadcrumbs';
import { shellRouterDecorator } from './story-helpers';

const meta = {
  title: 'Shell/Breadcrumbs',
  component: Breadcrumbs,
  parameters: { layout: 'padded' },
  decorators: [shellRouterDecorator({ title: 'İlanlar', permission: 'listing.view', aiEntity: 'listing' })],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('İlanlar')).toBeInTheDocument();
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };

export const Loading: Story = {
  render: () => <div className="bg-muted h-4 w-40 animate-pulse rounded" />,
  decorators: [(Story) => <Story />],
};

export const Empty: Story = {
  render: () => <div className="text-muted-foreground text-sm">Konum yok.</div>,
  decorators: [(Story) => <Story />],
};

export const Error: Story = {
  render: () => <div className="text-destructive text-sm">Konum yüklenemedi.</div>,
  decorators: [(Story) => <Story />],
};
