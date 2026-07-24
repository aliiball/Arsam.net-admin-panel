import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { UsersListPage } from './UsersListPage';
import { userKeys } from '../api/queries';
import { MOCK_USERS, renderPage } from './page-story-utils';

const defaultQuery = { page: 1, pageSize: 25, sort: [], filters: {}, q: '' };

function render() {
  return renderPage(<UsersListPage />, {
    path: '/users',
    initialPath: '/users',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) =>
      qc.setQueryData(userKeys.list(defaultQuery), {
        items: MOCK_USERS,
        total: MOCK_USERS.length,
        page: 1,
        pageSize: 25,
      }),
  });
}

const meta = {
  title: 'Users/Pages/List',
  parameters: { layout: 'fullscreen' },
  render,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: /Kullanıcılar/ })).toBeInTheDocument();
    await expect((await canvas.findAllByText('İstanbul Kaya Emlak')).length).toBeGreaterThan(0);
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = {
  render: () =>
    renderPage(<UsersListPage />, {
      path: '/users',
      initialPath: '/users',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};
export const Empty: Story = {
  render: () =>
    renderPage(<UsersListPage />, {
      path: '/users',
      initialPath: '/users',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) =>
        qc.setQueryData(userKeys.list(defaultQuery), { items: [], total: 0, page: 1, pageSize: 25 }),
    }),
};
export const Error: Story = { ...Empty };
