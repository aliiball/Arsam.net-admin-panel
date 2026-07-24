import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ROLES, matrix, type PermissionMatrix } from '@/lib/permissions/permissions';
import { cloneMatrix } from '@/lib/permissions/permission-store';
import { PERMISSION_CATALOG } from '../data/rbac';
import { toggleMatrix } from '../schemas/rbac';
import { PermissionMatrixEditor } from './PermissionMatrixEditor';

/** Controlled harness so toggles actually flip in the story. */
function Interactive({ disabled }: { disabled?: boolean }) {
  const [m, setM] = useState<PermissionMatrix>(() => cloneMatrix(matrix));
  return (
    <div className="p-4">
      <PermissionMatrixEditor
        roles={ROLES}
        catalog={PERMISSION_CATALOG}
        matrix={m}
        {...(disabled ? { disabled } : {})}
        onToggle={(role, permission, granted) => setM((prev) => toggleMatrix(prev, role, permission, granted))}
      />
    </div>
  );
}

const meta = {
  title: 'RBAC/PermissionMatrixEditor',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // super-admin column is read-only '*'.
    await expect(canvas.getAllByLabelText(/Süper Admin: tüm izinler/).length).toBeGreaterThan(0);
    // moderator lacks user.view — the cell starts unchecked.
    const cell = canvas.getByRole('checkbox', { name: 'Moderatör için user.view' });
    await expect(cell).not.toBeChecked();
    // Toggling grants it (live, controlled state).
    await userEvent.click(cell);
    await expect(canvas.getByRole('checkbox', { name: 'Moderatör için user.view' })).toBeChecked();
  },
};

export const Loading: Story = {
  render: () => (
    <div className="p-4">
      <PermissionMatrixEditor roles={ROLES} catalog={PERMISSION_CATALOG} matrix={cloneMatrix(matrix)} onToggle={() => {}} loading />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-4">
      <PermissionMatrixEditor roles={ROLES} catalog={[]} matrix={cloneMatrix(matrix)} onToggle={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('İzin yok')).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  render: () => <Interactive disabled />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox', { name: 'Moderatör için user.view' })).toBeDisabled();
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Interactive />,
};
