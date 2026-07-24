import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { DEFAULT_LAYOUT_DEFAULTS, type LayoutDefaults } from '../schemas/settings';
import { LayoutDefaultsForm } from './LayoutDefaultsForm';

/** Controlled harness so selects actually update in the story. */
function Interactive({ disabled, withApply }: { disabled?: boolean; withApply?: boolean }) {
  const [value, setValue] = useState<LayoutDefaults>({ ...DEFAULT_LAYOUT_DEFAULTS });
  return (
    <div className="max-w-md p-4">
      <LayoutDefaultsForm
        value={value}
        {...(disabled ? { disabled } : {})}
        {...(withApply ? { onApplyToDevice: () => {} } : {})}
        onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))}
      />
    </div>
  );
}

const meta = {
  title: 'Settings/LayoutDefaultsForm',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Interactive withApply />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Every control exposes an accessible name via aria-label.
    await expect(canvas.getByRole('combobox', { name: 'Varsayılan yerleşim' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Bu cihaza uygula/ })).toBeInTheDocument();
    // Help affordance is present (never a title attribute).
    await userEvent.click(canvas.getAllByRole('button', { name: /hakkında/ })[0]!);
    await expect(await canvas.findByText(/varsayılan yerleşim modu/i)).toBeInTheDocument();
  },
};

// Loading placeholder — the form renders once settings resolve.
export const Loading: Story = {
  render: () => (
    <div className="max-w-md space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-muted h-9 w-full animate-pulse rounded" />
      ))}
    </div>
  ),
};

// Empty — form with no "apply to device" affordance (org-only editing).
export const Empty: Story = { render: () => <Interactive /> };

// Disabled stands in for the error/in-flight state (no error branch of its own).
export const Error: Story = { render: () => <Interactive disabled withApply /> };

export const Disabled: Story = {
  render: () => <Interactive disabled withApply />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Varsayılan tema' })).toBeDisabled();
  },
};

export const Mobile: Story = {
  render: () => <Interactive withApply />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
