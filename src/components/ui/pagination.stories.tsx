import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Sayfalama' })).toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () => (
    <div className="flex gap-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-muted size-9 animate-pulse rounded-md" />
      ))}
    </div>
  ),
};
export const Empty: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
export const Error: Story = {
  render: () => <div className="text-destructive text-sm">Sayfalama yüklenemedi.</div>,
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
