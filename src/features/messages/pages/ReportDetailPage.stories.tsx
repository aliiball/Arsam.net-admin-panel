import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ReportDetailPage } from './ReportDetailPage';
import { reportKeys } from '../api/queries';
import { MOCK_REPORTS, renderPage, seedQueryError } from './page-story-utils';

const OPEN = MOCK_REPORTS[0]!; // R-3000, open + high
const CLOSED = MOCK_REPORTS[2]!; // R-3002, resolved

function renderDetail(report = OPEN) {
  return renderPage(<ReportDetailPage />, {
    path: '/messages/:id',
    initialPath: `/messages/${report.id}`,
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => qc.setQueryData(reportKeys.detail(report.id), report),
  });
}

const meta = {
  title: 'Messages/Pages/Detail',
  parameters: { layout: 'fullscreen' },
  render: () => renderDetail(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    // The subject label appears in the title and the "Konu" link.
    await expect((await canvas.findAllByText(OPEN.subjectLabel)).length).toBeGreaterThan(0);
    // Open complaint → three-tier moderation is available.
    await expect(canvas.getByRole('button', { name: /Çözüldü/ })).toBeInTheDocument();
    await expect(canvas.getByText(OPEN.description)).toBeInTheDocument();
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Closed: Story = {
  render: () => renderDetail(CLOSED),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/ek işlem yapılamaz/i)).toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () =>
    renderPage(<ReportDetailPage />, {
      path: '/messages/:id',
      initialPath: '/messages/R-3000',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};
export const Empty: Story = { ...Closed };
// A real isError state (not a mirror of Empty) — deterministic, no network.
export const Error: Story = {
  render: () =>
    renderPage(<ReportDetailPage />, {
      path: '/messages/:id',
      initialPath: '/messages/R-3000',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => seedQueryError(qc, reportKeys.detail('R-3000')),
    }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Şikayet bulunamadı')).toBeInTheDocument();
  },
};
