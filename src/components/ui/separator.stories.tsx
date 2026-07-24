import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from './separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  render: () => (
    <div className="w-64">
      <p className="text-sm">Bölüm A</p>
      <Separator className="my-3" />
      <p className="text-sm">Bölüm B</p>
      <div className="mt-3 flex h-5 items-center gap-3 text-sm">
        <span>Sol</span>
        <Separator orientation="vertical" />
        <span>Sağ</span>
      </div>
    </div>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { render: () => <div className="bg-muted h-px w-48 animate-pulse" /> };
export const Empty: Story = { render: () => <Separator className="w-48" /> };
export const Error: Story = { render: () => <Separator className="bg-destructive/40 w-48" /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
