import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AttributeEditor } from './AttributeEditor';
import { MOCK_CATEGORIES } from '../pages/page-story-utils';
import type { Category } from '../schemas/category';

const meta = {
  title: 'Categories/AttributeEditor',
  component: AttributeEditor,
  parameters: { layout: 'padded' },
  args: { category: MOCK_CATEGORIES[0]! },
} satisfies Meta<typeof AttributeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Brüt Alan')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Alan tipi: Seçim')).toBeInTheDocument();
    // Reorder affordance is present for the manager role.
    await expect(canvas.getByLabelText('Brüt Alan aşağı taşı')).toBeInTheDocument();
  },
};

const emptyCategory: Category = { ...MOCK_CATEGORIES[2]!, attributes: [] };

export const Empty: Story = {
  args: { category: emptyCategory },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Henüz nitelik yok')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="bg-muted h-12 animate-pulse rounded-md" />
      <div className="bg-muted h-12 animate-pulse rounded-md" />
    </div>
  ),
};
export const Error: Story = { args: { category: emptyCategory } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
