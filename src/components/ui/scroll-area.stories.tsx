import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ScrollArea } from './scroll-area';

const rows = Array.from({ length: 30 }, (_, i) => `Satır ${i + 1}`);

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: { layout: 'centered' },
  render: () => (
    <ScrollArea className="h-48 w-56 rounded-md border border-border p-3">
      <div className="space-y-1 text-sm">
        {rows.map((r) => (
          <div key={r}>{r}</div>
        ))}
      </div>
    </ScrollArea>
  ),
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Satır 1')).toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () => (
    <div className="h-48 w-56 space-y-2 rounded-md border border-border p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-muted h-4 w-full animate-pulse rounded" />
      ))}
    </div>
  ),
};
export const Empty: Story = {
  render: () => (
    <div className="text-muted-foreground grid h-48 w-56 place-items-center rounded-md border border-border text-sm">
      Öğe yok
    </div>
  ),
};
export const Error: Story = {
  render: () => (
    <div className="text-destructive grid h-48 w-56 place-items-center rounded-md border border-destructive/40 text-sm">
      Yüklenemedi
    </div>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
