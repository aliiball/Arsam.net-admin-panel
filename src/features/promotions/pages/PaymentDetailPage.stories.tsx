import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PaymentDetailPage } from './PaymentDetailPage';
import { paymentKeys } from '../api/queries';
import { MOCK_PAYMENTS, renderPage, seedQueryError } from './page-story-utils';

const PAID = MOCK_PAYMENTS[0]!; // PAY-5000, paid → refundable
const REFUNDED = MOCK_PAYMENTS[2]!; // PAY-5002, fully refunded → not refundable

function renderDetail(payment = PAID) {
  return renderPage(<PaymentDetailPage />, {
    path: '/promotions/payments/:id',
    initialPath: `/promotions/payments/${payment.id}`,
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => qc.setQueryData(paymentKeys.detail(payment.id), payment),
  });
}

const meta = {
  title: 'Promotions/Pages/PaymentDetail',
  parameters: { layout: 'fullscreen' },
  render: () => renderDetail(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect((await canvas.findAllByText(PAID.invoiceNo)).length).toBeGreaterThan(0);
    // A paid payment is refundable → the refund action is available.
    await expect(canvas.getByRole('button', { name: /İade et/ })).toBeInTheDocument();
    await expect(canvas.getByText(PAID.packageName)).toBeInTheDocument();
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Refunded: Story = {
  render: () => renderDetail(REFUNDED),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/iade yapılamaz/i)).toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () =>
    renderPage(<PaymentDetailPage />, {
      path: '/promotions/payments/:id',
      initialPath: '/promotions/payments/PAY-5000',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};
export const Empty: Story = { ...Refunded };
// A real isError state (not a mirror of Empty) — deterministic, no network.
export const Error: Story = {
  render: () =>
    renderPage(<PaymentDetailPage />, {
      path: '/promotions/payments/:id',
      initialPath: '/promotions/payments/PAY-5000',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => seedQueryError(qc, paymentKeys.detail('PAY-5000')),
    }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Ödeme bulunamadı')).toBeInTheDocument();
  },
};
