import { CommandPalette } from './CommandPalette';
import { CommandCardLauncher } from './CommandCardLauncher';

export type CommandLauncherVariant = 'list' | 'cards';

/**
 * Shared ⌘K entry point. `list` renders the classic command palette (cmdk) used
 * by sidebar/topnav — unchanged, regression-safe. `cards` renders the dock's
 * card-grid launcher (module cards + NL box). Both read the same open state from
 * `CommandPaletteContext`, so the ⌘K shortcut works identically in every mode.
 */
export function CommandLauncher({ variant }: { variant: CommandLauncherVariant }) {
  return variant === 'cards' ? <CommandCardLauncher /> : <CommandPalette />;
}
