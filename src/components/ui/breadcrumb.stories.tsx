import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

const meta = {
  title: 'UI/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'centered' },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">İlanlar</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Moderasyon Kuyruğu</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Moderasyon Kuyruğu')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-4 w-40 animate-pulse rounded" /> };
export const Empty: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>Genel Bakış</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
export const Error: Story = {
  render: () => <div className="text-destructive text-sm">Konum yüklenemedi.</div>,
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
