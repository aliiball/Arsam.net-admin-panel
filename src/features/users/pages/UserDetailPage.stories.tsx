import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { UserDetailPage } from './UserDetailPage';
import { userKeys } from '../api/queries';
import { MOCK_USERS, renderPage } from './page-story-utils';

function render(seed: 'ok' | 'empty' = 'ok') {
  return renderPage(<UserDetailPage />, {
    path: '/users/:id',
    initialPath: '/users/U-2000',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => {
      if (seed === 'ok') qc.setQueryData(userKeys.detail('U-2000'), MOCK_USERS[0]);
    },
  });
}

const meta = {
  title: 'Users/Pages/Detail',
  parameters: { layout: 'fullscreen' },
  render: () => render('ok'),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect((await canvas.findAllByText('İstanbul Kaya Emlak')).length).toBeGreaterThan(0);
    await expect(canvas.getByRole('group', { name: 'Kullanıcı moderasyon kararı' })).toBeInTheDocument();
    await expect(canvas.getByRole('meter')).toHaveAttribute('aria-valuenow');
  },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render('empty') };
export const Empty: Story = { render: () => render('empty') };
export const Error: Story = { render: () => render('empty') };
