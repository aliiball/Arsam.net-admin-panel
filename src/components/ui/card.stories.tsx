import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Aktif İlanlar</CardTitle>
        <CardDescription>Son 30 gün</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Detay
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums">1.284</p>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">Güncellendi: bugün</CardFooter>
    </Card>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Aktif İlanlar')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <div className="bg-muted h-3 w-16 animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="bg-muted h-8 w-20 animate-pulse rounded" />
      </CardContent>
    </Card>
  ),
};

export const Empty: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="text-muted-foreground py-10 text-center text-sm">
        Görüntülenecek veri yok.
      </CardContent>
    </Card>
  ),
};

export const Error: Story = {
  render: () => (
    <Card className="border-destructive/40 w-80">
      <CardHeader>
        <CardTitle className="text-destructive">Veri alınamadı</CardTitle>
        <CardDescription>Sunucuya ulaşılamadı, tekrar deneyin.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm">
          Tekrar dene
        </Button>
      </CardContent>
    </Card>
  ),
};

/**
 * `interactive` — a clickable surface with a token-driven hover-lift and a
 * focus-within ring (keyboard focus on the nested link/button is visible). Under
 * `prefers-reduced-motion` the transform is dropped (shadow only). Asserts the
 * end-state class wiring, not the animation.
 */
export const Interactive: Story = {
  render: () => (
    <Card interactive className="relative w-72">
      <CardHeader>
        <CardTitle>
          <a href="#void" className="after:absolute after:inset-0 focus-visible:outline-none">
            İlanları aç
          </a>
        </CardTitle>
        <CardDescription>Üzerine gelince hafifçe yükselir</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Yalnızca tıklanabilir kartlarda kullanılır.
      </CardContent>
    </Card>
  ),
  play: async ({ canvas }) => {
    const card = canvas.getByText('İlanları aç').closest('[data-slot="card"]');
    await expect(card).not.toBeNull();
    await expect(card).toHaveClass('card-interactive');
    await expect(card).toHaveAttribute('data-interactive');
  },
};

export const Mobile: Story = {
  ...Default,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {['Konut', 'İşyeri', 'Arsa', 'Devremülk'].map((label) => (
        <Card key={label} className="w-56">
          <CardHeader>
            <CardTitle>{label}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {Math.floor(Math.random() * 900) + 100}
          </CardContent>
        </Card>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Konut')).toBeVisible();
  },
};
