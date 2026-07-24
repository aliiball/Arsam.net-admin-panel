import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { Button } from './button';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Üzerine gel</Button>
      </TooltipTrigger>
      <TooltipContent>Yardım metni (title attribute DEĞİL)</TooltipContent>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.hover(canvas.getByRole('button'));
    await expect(await within(document.body).findAllByText(/Yardım metni/)).not.toHaveLength(0);
  },
};
export const Loading: Story = { args: { open: true } };
export const Empty: Story = {
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild><Button variant="outline">Boş</Button></TooltipTrigger>
      <TooltipContent>—</TooltipContent>
    </Tooltip>
  ),
};
export const Error: Story = {
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild><Button variant="outline">Hata</Button></TooltipTrigger>
      <TooltipContent>Bir sorun oluştu</TooltipContent>
    </Tooltip>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
