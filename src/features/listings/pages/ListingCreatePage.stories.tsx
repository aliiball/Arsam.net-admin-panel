import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { ListingCreatePage } from './ListingCreatePage';
import { renderPage } from './page-story-utils';

function render() {
  return renderPage(<ListingCreatePage />, {
    path: '/listings/create',
    initialPath: '/listings/create',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: () => {},
  });
}

const meta = {
  title: 'Listings/Pages/Create',
  parameters: { layout: 'fullscreen' },
  render,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Yeni İlan' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Temel Bilgiler' })).toBeInTheDocument();
  },
};

export const BlocksInvalidStep: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Devam' }));
    await expect(await canvas.findByText('En az 5 karakter')).toBeInTheDocument();
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render };
export const Empty: Story = { render };
export const Error: Story = { render };
