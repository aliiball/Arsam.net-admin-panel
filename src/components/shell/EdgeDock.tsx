import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Command, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { usePrimaryNav, isNavItemActive } from './nav-utils';
import { useCommandPalette } from './command-palette-context';

export type DockEdge = 'bottom' | 'left' | 'right';

/** A single dock target — a nav module link, or the ⌘K "all" action. */
interface DockItem {
  key: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  active: boolean;
  entity: string;
}

/* macOS-style magnification tuning (our own values). */
const BASE = 44; // icon box size (px) — meets the 44px touch-target rule at base scale
const GAP = 8;
const MIN_SCALE = 1;
const MAX_SCALE = 1.55;
const EFFECT = 170; // proximity falloff window along the main axis (px)

/** Icon center positions along the main axis, spaced by their (magnified) sizes. */
function positionsFromScales(scales: number[]): number[] {
  let x = 0;
  const out: number[] = [];
  for (const s of scales) {
    const w = BASE * s;
    out.push(x + w / 2);
    x += w + GAP;
  }
  return out;
}

/** Build the shared dock item list (permitted primary modules + ⌘K "all"). */
function useDockItems(): DockItem[] {
  const items = usePrimaryNav(5);
  const { pathname } = useLocation();
  const { setOpen: setPaletteOpen } = useCommandPalette();
  return useMemo(
    () => [
      ...items.map((item) => ({
        key: item.id,
        label: item.label,
        icon: item.icon,
        to: item.to,
        active: isNavItemActive(item.to, pathname),
        entity: item.aiEntity ?? 'module',
      })),
      {
        key: 'command',
        label: 'Tümü (⌘K)',
        icon: Command,
        onClick: () => setPaletteOpen(true),
        active: false,
        entity: 'command',
      },
    ],
    [items, pathname, setPaletteOpen],
  );
}

/** True when the OS asks for reduced motion (magnification is then disabled). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** A single icon tile — a nav link or the ⌘K button, with its module label. */
function DockTile({ item, onNavigate }: { item: DockItem; onNavigate?: (() => void) | undefined }) {
  const Icon = item.icon;
  const inner = <Icon className="size-5" aria-hidden="true" />;
  const cls = cn(
    'focus-visible:ring-ring flex size-full items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2',
    item.active
      ? 'bg-primary/15 text-primary'
      : 'text-glass-foreground/80 hover:bg-accent/40 hover:text-glass-foreground',
  );
  return item.to ? (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      aria-label={item.label}
      aria-current={item.active ? 'page' : undefined}
      onClick={() => onNavigate?.()}
      className={cls}
      data-action="navigate"
      data-entity={item.entity}
    >
      {inner}
    </NavLink>
  ) : (
    <button
      type="button"
      aria-label={item.label}
      onClick={() => {
        item.onClick?.();
        onNavigate?.();
      }}
      className={cls}
      data-action="open-command-palette"
      data-entity={item.entity}
    >
      {inner}
    </button>
  );
}

/**
 * Horizontal magnifying dock (bottom edge) — macOS-style: icons magnify toward the
 * cursor (cosine proximity falloff derived directly from the pointer; CSS transitions
 * smooth it — no rAF loop). On touch / reduced-motion the pointer never drives it, so
 * it renders as a calm, static icon row. Reinterprets the reference in OUR glass.
 */
function MagnifyDock({ items, onNavigate }: { items: DockItem[]; onNavigate?: (() => void) | undefined }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const lastMove = useRef(0);
  const reduced = usePrefersReducedMotion();
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  // Scales + positions are derived directly from the pointer (no rAF loop, no per-frame
  // state churn) — CSS transitions on the tiles smooth the magnify. Reduced-motion or
  // touch (no mousemove) → mouseX stays null → a calm static row.
  const active = reduced ? null : mouseX;
  const scales = items.map((_, i) => {
    if (active === null) return MIN_SCALE;
    const center = i * (BASE + GAP) + BASE / 2;
    const minX = active - EFFECT / 2;
    const maxX = active + EFFECT / 2;
    if (center < minX || center > maxX) return MIN_SCALE;
    const theta = ((center - minX) / EFFECT) * 2 * Math.PI;
    const f = (1 - Math.cos(theta)) / 2;
    return MIN_SCALE + f * (MAX_SCALE - MIN_SCALE);
  });
  const positions = positionsFromScales(scales);
  // Track box uses the RESTING layout only (never magnifies), so the glass pill stays
  // stable while the icons breathe — magnified tiles overflow (nav is overflow:visible).
  // `offset` re-centers the magnified group in the resting track so it spills evenly to
  // both sides instead of pushing everything rightward.
  const contentWidth = items.length * (BASE + GAP) - GAP;
  const magnifiedExtent = positions.length
    ? (positions[positions.length - 1] ?? 0) + (BASE * (scales[scales.length - 1] ?? MIN_SCALE)) / 2
    : contentWidth;
  const offset = (contentWidth - magnifiedExtent) / 2;

  // The icon closest to the cursor (or the keyboard-focused one) gets a floating
  // label with its module name — so keyboard users see the same affordance as mouse.
  const pointerIdx =
    active === null
      ? null
      : positions.reduce(
          (best, p, i) => (Math.abs(p - active) < Math.abs((positions[best] ?? 0) - active) ? i : best),
          0,
        );
  const labelIdx = pointerIdx ?? focusedIdx;
  const labelItem = labelIdx !== null ? items[labelIdx] : undefined;
  const labelPos = labelIdx !== null ? (positions[labelIdx] ?? 0) : 0;

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const now = performance.now();
    if (now - lastMove.current < 16) return;
    lastMove.current = now;
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) setMouseX(e.clientX - rect.left);
  };

  return (
    <div
      ref={trackRef}
      className="relative"
      style={{ width: contentWidth, height: BASE }}
      onMouseMove={onMove}
      onMouseLeave={() => setMouseX(null)}
    >
      {labelItem && labelIdx !== null && (
        <span
          key={labelItem.key}
          aria-hidden="true"
          className="bg-popover text-popover-foreground border-border animate-fade-in pointer-events-none absolute bottom-full z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs shadow-md"
          style={{ left: labelPos + offset }}
        >
          {labelItem.label}
        </span>
      )}
      {items.map((item, i) => {
        const scale = scales[i] ?? MIN_SCALE;
        const pos = (positions[i] ?? 0) + offset;
        return (
          <div
            key={item.key}
            onFocus={() => setFocusedIdx(i)}
            onBlur={() => setFocusedIdx((cur) => (cur === i ? null : cur))}
            className="absolute bottom-0 transition-[transform,left] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none"
            style={{
              left: pos - BASE / 2,
              width: BASE,
              height: BASE,
              transform: `scale(${scale})`,
              transformOrigin: '50% 100%',
              zIndex: Math.round(scale * 10),
            }}
          >
            <DockTile item={item} onNavigate={onNavigate} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Vertical dock (left / right edges) — static icons with a sliding highlight that
 * follows the hovered (or active) item, plus a gentle hover scale. Mirrors the
 * reference's vertical dock; our glass, our tokens.
 */
function SideDock({
  items,
  onNavigate,
  labelSide,
}: {
  items: DockItem[];
  onNavigate?: (() => void) | undefined;
  labelSide: 'left' | 'right';
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIdx = items.findIndex((i) => i.active);
  const target = hovered ?? activeIdx;
  const STEP = BASE + GAP;
  const hoveredItem = hovered !== null ? items[hovered] : undefined;

  return (
    <div
      className="relative flex flex-col items-center gap-2"
      onMouseLeave={() => setHovered(null)}
    >
      {hoveredItem && hovered !== null && (
        <span
          key={hoveredItem.key}
          aria-hidden="true"
          className={cn(
            'bg-popover text-popover-foreground border-border animate-fade-in pointer-events-none absolute z-50 -translate-y-1/2 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs shadow-md',
            labelSide === 'right' ? 'left-full ml-3' : 'right-full mr-3',
          )}
          style={{ top: hovered * STEP + BASE / 2 }}
        >
          {hoveredItem.label}
        </span>
      )}
      {target >= 0 && (
        <div
          aria-hidden="true"
          className="bg-primary/10 absolute left-1/2 rounded-full transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)] motion-reduce:transition-none"
          style={{
            top: 0,
            width: BASE,
            height: BASE,
            transform: `translate(-50%, ${target * STEP}px)`,
          }}
        />
      )}
      {items.map((item, idx) => (
        <div
          key={item.key}
          onMouseEnter={() => setHovered(idx)}
          onFocus={() => setHovered(idx)}
          onBlur={() => setHovered((cur) => (cur === idx ? null : cur))}
          className="relative z-[1] transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
          style={{ width: BASE, height: BASE }}
        >
          <DockTile item={item} onNavigate={onNavigate} />
        </div>
      ))}
    </div>
  );
}

interface EdgeShell {
  /** Wrapper anchor at the edge. */
  wrapper: string;
  /** Hint BUTTON hit box (≥44px cross-axis) — holds the focus ring; never fades. */
  hintBox: string;
  /** Visible slim glass bar inside the button — pulses collapsed, fades when open. */
  hintBar: string;
  /** Stage placement adjacent to the hint (no gap — avoids a hover dead zone). */
  stagePos: string;
  /** Stage transform when open vs collapsed (slides in from the edge). */
  stageOpen: string;
  stageClosed: string;
  origin: string;
  /** Heartbeat phase-offset so the edges don't pulse in unison (token-scaled). */
  pulseDelay: string;
  label: string;
}

const SHELL: Record<DockEdge, EdgeShell> = {
  bottom: {
    wrapper: 'bottom-1 left-1/2 -translate-x-1/2',
    // 44px hit box; the visible tab is a clear ~20px rounded bar at the edge.
    hintBox: 'min-h-11 w-24 items-end justify-center',
    hintBar: 'h-5 w-24 rounded-t-2xl',
    // Stage anchored AT the edge (not above the 44px hit box) so the open dock sits
    // right by the tab with no gap; it just slides up + fades in.
    stagePos: 'bottom-0 left-1/2',
    stageOpen: '-translate-x-1/2 translate-y-0 scale-100 opacity-100',
    stageClosed: '-translate-x-1/2 translate-y-4 scale-95 opacity-0',
    origin: 'origin-bottom',
    pulseDelay: 'calc(var(--stagger-step) * 6)',
    label: 'alt',
  },
  left: {
    wrapper: 'left-1 top-1/2 -translate-y-1/2',
    hintBox: 'min-w-11 h-24 items-center justify-start',
    hintBar: 'h-24 w-5 rounded-r-2xl',
    stagePos: 'left-0 top-1/2',
    stageOpen: '-translate-y-1/2 translate-x-0 scale-100 opacity-100',
    stageClosed: '-translate-y-1/2 -translate-x-4 scale-95 opacity-0',
    origin: 'origin-left',
    pulseDelay: 'calc(var(--stagger-step) * 12)',
    label: 'sol',
  },
  right: {
    wrapper: 'right-1 top-1/2 -translate-y-1/2',
    hintBox: 'min-w-11 h-24 items-center justify-end',
    hintBar: 'h-24 w-5 rounded-l-2xl',
    stagePos: 'right-0 top-1/2',
    stageOpen: '-translate-y-1/2 translate-x-0 scale-100 opacity-100',
    stageClosed: '-translate-y-1/2 translate-x-4 scale-95 opacity-0',
    origin: 'origin-right',
    pulseDelay: 'calc(var(--stagger-step) * 24)',
    label: 'sağ',
  },
};

/**
 * A collapsible edge navigation dock (dock layout, desktop AND mobile). Collapsed it is
 * a small rich-glass hint tab hugging the edge; hover / keyboard-focus / tap slides the
 * dock in. The revealed bottom dock is a macOS-style magnifying dock (icons grow toward
 * the cursor); the left/right docks are vertical rails with a sliding hover highlight.
 * Up to three frame the viewport, each independently flag-gated from Settings; all share
 * one nav source (usePrimaryNav). Golden Rule 1: reinterpreted in OUR glass + motion
 * tokens — NOT a clone of the reference's liquid-glass chrome.
 */
export function EdgeDock({ edge }: { edge: DockEdge }) {
  const items = useDockItems();
  const cfg = SHELL[edge];
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageId = `edge-dock-stage-${edge}`;

  const closeIfOutside = (next: Element | null) => {
    if (!wrapperRef.current?.contains(next)) setOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('fixed z-30', cfg.wrapper)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => closeIfOutside(document.activeElement)}
      onBlur={(e) => closeIfOutside(e.relatedTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          setOpen(false);
          wrapperRef.current?.querySelector<HTMLButtonElement>('[data-slot="edge-dock-hint"]')?.focus();
        }
      }}
      data-entity="dock"
      data-slot="edge-dock"
      data-edge={edge}
    >
      {/* Collapsed hint — a 44px hit box (holds the focus ring, never fades so the ring
          stays visible on keyboard focus) wrapping a slim visible glass bar. The bar
          pulses (heartbeat) while collapsed and fades out when open so no grey tab
          lingers behind the dock. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={stageId}
        aria-label={`Gezinme dock’u (${cfg.label}) — aç`}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        className={cn(
          'focus-visible:ring-ring group flex rounded-md outline-none focus-visible:ring-2',
          cfg.hintBox,
        )}
        data-slot="edge-dock-hint"
        data-action="toggle-edge-dock"
      >
        <span
          aria-hidden="true"
          style={{ animationDelay: cfg.pulseDelay }}
          className={cn(
            'bg-glass-foreground/40 group-hover:bg-glass-foreground/60 transition-opacity',
            cfg.hintBar,
            cfg.origin, // pulse puffs inward from the edge, not half off-screen
            open ? 'opacity-0' : 'animate-pulse-soft opacity-100 motion-reduce:animate-none',
          )}
        />
      </button>

      {/* Stage — the revealed dock. Adjacent to the hint (no gap). `inert` when collapsed
          so its links stay out of the tab order + a11y tree while it fades. */}
      <div
        id={stageId}
        inert={!open}
        className={cn(
          'absolute transition-[transform,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)] motion-reduce:transition-none',
          cfg.stagePos,
          cfg.origin,
          open ? cfg.stageOpen : cn('pointer-events-none', cfg.stageClosed),
        )}
      >
        <nav
          aria-label={`Kenar gezinme (${cfg.label})`}
          className={cn(
            'bg-glass text-glass-foreground border-glass-border m-1 flex items-center rounded-full border shadow-lg backdrop-blur-md',
            edge === 'bottom' ? 'px-2 py-1.5' : 'px-1.5 py-2',
          )}
          style={{ overflow: 'visible' }}
        >
          {edge === 'bottom' ? (
            <MagnifyDock items={items} onNavigate={() => setOpen(false)} />
          ) : (
            <SideDock
              items={items}
              onNavigate={() => setOpen(false)}
              labelSide={edge === 'left' ? 'right' : 'left'}
            />
          )}
        </nav>
      </div>
    </div>
  );
}
