import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AuditListPage } from './AuditListPage';
import { auditKeys } from '../api/queries';
import { MOCK_AUDIT, renderPage, seedQueryError } from './page-story-utils';

const defaultQuery = { page: 1, pageSize: 25, sort: [], filters: {}, q: '' };

function seededList() {
  return renderPage(<AuditListPage />, {
    path: '/audit',
    initialPath: '/audit',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) =>
      qc.setQueryData(auditKeys.list(defaultQuery), {
        items: MOCK_AUDIT,
        total: MOCK_AUDIT.length,
        page: 1,
        pageSize: 25,
      }),
  });
}

const meta = {
  title: 'Audit/Pages/AuditList',
  parameters: { layout: 'fullscreen' },
  render: seededList,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Denetim Kaydı' })).toBeInTheDocument();
    await expect((await canvas.findAllByText('listing.approve')).length).toBeGreaterThan(0);
    // Both actor kinds render with their accessible labels.
    await expect((await canvas.findAllByLabelText('Yapay Zeka aktör: ai:moderator')).length).toBeGreaterThan(0);
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = {
  render: () =>
    renderPage(<AuditListPage />, {
      path: '/audit',
      initialPath: '/audit',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};
export const Empty: Story = {
  render: () =>
    renderPage(<AuditListPage />, {
      path: '/audit',
      initialPath: '/audit',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => qc.setQueryData(auditKeys.list(defaultQuery), { items: [], total: 0, page: 1, pageSize: 25 }),
    }),
};
// A real isError state (not a mirror of Empty) — deterministic, no network.
export const Error: Story = {
  render: () =>
    renderPage(<AuditListPage />, {
      path: '/audit',
      initialPath: '/audit',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => seedQueryError(qc, auditKeys.list(defaultQuery)),
    }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
  },
};
