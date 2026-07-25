import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { RbacPage } from './RbacPage';
import { rbacKeys } from '../api/hooks';
import { MOCK_ENVELOPE, renderPage, seedQueryError } from './page-story-utils';

function seeded(envelope = MOCK_ENVELOPE) {
  return renderPage(<RbacPage />, {
    path: '/rbac',
    initialPath: '/rbac',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => qc.setQueryData(rbacKeys.matrix, envelope),
  });
}

const meta = {
  title: 'RBAC/Pages/Matrix',
  parameters: { layout: 'fullscreen' },
  render: () => seeded(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Roller & İzinler' })).toBeInTheDocument();
    // Matrix column headers render for every role.
    await expect(canvas.getByRole('columnheader', { name: /Moderatör/ })).toBeInTheDocument();
    // A known editable cell is present and reflects the seed (moderator has listing.approve).
    await expect(canvas.getByRole('checkbox', { name: 'Moderatör için listing.approve' })).toBeChecked();
    // super-admin read-only marker.
    await expect(canvas.getAllByLabelText(/Süper Admin: tüm izinler/).length).toBeGreaterThan(0);
  },
};

export const Loading: Story = {
  render: () =>
    renderPage(<RbacPage />, {
      path: '/rbac',
      initialPath: '/rbac',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};

export const Empty: Story = {
  render: () => seeded({ ...MOCK_ENVELOPE, catalog: [] }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('İzin yok')).toBeInTheDocument();
  },
};

// A real isError state (not a mirror of Empty) — deterministic, no network.
export const Error: Story = {
  render: () =>
    renderPage(<RbacPage />, {
      path: '/rbac',
      initialPath: '/rbac',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => seedQueryError(qc, rbacKeys.matrix),
    }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
/** Smallest phone (320px): the matrix scrolls horizontally; the gesture hint is shown. */
export const PhoneScroll: Story = {
  parameters: { viewport: { defaultViewport: 'bpXs' } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/tabloyu yana kaydırın/i)).toBeVisible();
    // The sticky permission column keeps a known cell reachable while scrolling.
    await expect(canvas.getByRole('checkbox', { name: 'Moderatör için listing.approve' })).toBeInTheDocument();
  },
};
