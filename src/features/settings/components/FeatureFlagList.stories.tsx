import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { DEFAULT_FLAGS, type FeatureFlags } from '../schemas/settings';
import { FeatureFlagList } from './FeatureFlagList';

/** Controlled harness so switches actually flip in the story. */
function Interactive({ disabled }: { disabled?: boolean }) {
  const [flags, setFlags] = useState<FeatureFlags>({ ...DEFAULT_FLAGS });
  return (
    <div className="max-w-md p-4">
      <FeatureFlagList
        flags={flags}
        {...(disabled ? { disabled } : {})}
        onToggle={(key, value) => setFlags((prev) => ({ ...prev, [key]: value }))}
      />
    </div>
  );
}

const meta = {
  title: 'Settings/FeatureFlagList',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mapSwitch = canvas.getByRole('switch', { name: 'İlan detayında harita' });
    await expect(mapSwitch).toBeChecked();
    await userEvent.click(mapSwitch);
    await expect(mapSwitch).not.toBeChecked();
  },
};

export const Loading: Story = {
  render: () => (
    <div className="max-w-md p-4">
      <FeatureFlagList flags={DEFAULT_FLAGS} onToggle={() => {}} loading />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="max-w-md p-4">
      <FeatureFlagList flags={DEFAULT_FLAGS} catalog={[]} onToggle={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Bayrak yok')).toBeInTheDocument();
  },
};

// Presentational list has no error state of its own (the page owns errors);
// alias to the default render so the naming matrix stays complete.
export const Error: Story = { render: () => <Interactive /> };

export const Disabled: Story = {
  render: () => <Interactive disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch', { name: 'AI kopilot rozetleri' })).toBeDisabled();
  },
};

export const Mobile: Story = {
  render: () => <Interactive />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
