import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DockLogo } from './DockLogo';

const meta = {
  title: 'Shell/DockLogo',
  component: DockLogo,
  parameters: { layout: 'centered' },
  args: { className: 'size-8' },
} satisfies Meta<typeof DockLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The dock-mode launcher logo carries a slow breathing pulse. The play test asserts
 * the motion CLASS wiring (not the animation timing) + that it's decorative, so it's
 * independent of animation duration and stable under reduced motion.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const logo = canvasElement.querySelector('[data-slot="dock-logo"]');
    await expect(logo).not.toBeNull();
    // Breathing pulse is applied via the token-backed utility…
    await expect(logo).toHaveClass('animate-pulse-soft');
    // …and explicitly disabled under reduced motion.
    await expect(logo).toHaveClass('motion-reduce:animate-none');
    // Decorative — the adjacent "arsam" label carries the accessible name.
    await expect(logo).toHaveAttribute('aria-hidden', 'true');
  },
};

/** Both dock sizes: `size-7` (desktop dock) and `size-8` (mobile pill). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <DockLogo className="size-7" />
      <DockLogo className="size-8" />
    </div>
  ),
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
