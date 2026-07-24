import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  render: () => (
    <div className="flex w-64 items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = {};
export const Empty: Story = { render: () => <Skeleton className="h-4 w-40" /> };
export const Error: Story = { render: () => <Skeleton className="border-destructive/40 h-4 w-40 border" /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
