# Storybook Guidelines (Storybook 10)

## Config
- Framework `@storybook/react-vite`. Storybook 10 is **ESM-only** (Node 20.16+/22.19+/24+).
- Addons: `@storybook/addon-a11y`, `@storybook/addon-vitest` (interaction/play + a11y tests via Vitest + Playwright Chromium), autodocs enabled.
- Mobile viewports registered in `.storybook/preview.ts` (e.g., `mobile1` 360px, `mobile2` 414px); a `Mobile` story sets the viewport.
- Theme + Layout decorators expose light/dark and sidebar/topnav in the toolbar.

## Per-component story requirements
Every component: `Default`, `Loading`, `Empty`, `Error`, `Mobile`. Interactive ones include a `play` function with assertions. Form fields demonstrate the FieldHelp affordance.

## Shell components — BOTH layout modes (required)
AppShell, SidebarShell, TopnavShell, Topbar, MobileNav, CommandPalette, LayoutSwitcher MUST ship a `Sidebar` story and a `Topnav` story (plus `Mobile`).

## CSF3 template
```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from './Button';

const meta = {
  component: Button,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Approve' } };
export const Loading: Story = { args: { children: 'Approve', loading: true } };
export const Mobile: Story = {
  args: { children: 'Approve' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
export const Interaction: Story = {
  args: { children: 'Approve' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));
    await expect(canvas.getByRole('button')).toBeEnabled();
  },
};
```

## a11y
Keep `@storybook/addon-a11y` violations at zero for changed stories; use `parameters.a11y.test = 'error'` once a component is clean.
