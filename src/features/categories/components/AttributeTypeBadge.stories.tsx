import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AttributeTypeBadge } from './AttributeTypeBadge';
import { ATTRIBUTE_TYPES } from '../data/categories';

const meta = {
  title: 'Categories/AttributeTypeBadge',
  component: AttributeTypeBadge,
  parameters: { layout: 'centered' },
  args: { type: 'number' },
} satisfies Meta<typeof AttributeTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {ATTRIBUTE_TYPES.map((t) => (
        <AttributeTypeBadge key={t} type={t} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Sayı')).toBeInTheDocument();
    // Type is conveyed by an accessible name, not color alone.
    await expect(canvas.getByLabelText('Alan tipi: Seçim')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-20 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { type: 'text' } };
export const Error: Story = { args: { type: 'boolean' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
