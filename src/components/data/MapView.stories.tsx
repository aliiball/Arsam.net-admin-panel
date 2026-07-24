import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { MapView } from './MapView';

const markers = [
  { id: '1', lat: 41.0082, lng: 28.9784, label: 'Kadıköy dairesi', popup: '2.450.000 ₺' },
  { id: '2', lat: 41.043, lng: 29.0094, label: 'Beşiktaş ofisi', popup: '5.100.000 ₺' },
  { id: '3', lat: 39.9179, lng: 32.8627, label: 'Çankaya arsası', popup: '1.200.000 ₺' },
  { id: '4', lat: 38.418, lng: 27.128, label: 'Konak dükkanı', popup: '3.300.000 ₺' },
];

const meta = {
  title: 'Data/MapView',
  component: MapView,
  parameters: { layout: 'padded' },
  args: { markers, height: 360 },
  render: (args) => (
    <div className="max-w-2xl">
      <MapView {...args} />
    </div>
  ),
} satisfies Meta<typeof MapView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onMarkerClick: fn() },
  play: async ({ canvas, args }) => {
    // Accessible alternative: every marker is a focusable button.
    const btn = await canvas.findByRole('button', { name: /Kadıköy dairesi/ });
    await expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    await expect(args.onMarkerClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', label: 'Kadıköy dairesi' }),
    );
  },
};

export const SingleMarker: Story = {
  args: {
    markers: [markers[0]!],
    center: { lat: markers[0]!.lat, lng: markers[0]!.lng },
    zoom: 12,
  },
};

export const Loading: Story = { args: { markers: [] } };

export const Empty: Story = {
  args: { markers: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Gösterilecek konum yok.')).toBeInTheDocument();
  },
};

export const Error: Story = { args: { markers: [], ariaLabel: 'Harita yüklenemedi' } };

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
