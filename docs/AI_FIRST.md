# AI-First Layer

Enterprise apps are rapidly absorbing task-specific agents; we build the panel to be agent-operable from day one, with humans in control.

## Assistant (reinterpreted, not ported)
- **AssistantDock** — a FAB reinterpreted in "Calm Signal" (no liquid-glass). Opens the AssistantPanel.
- **AssistantPanel** — two modes: **suggestions** (contextual next actions for the current screen) and **modules** (jump to / operate a module). Styled with our tokens only.

## Natural-language filters (confirm-before-apply)
The NL filter box parses text (e.g., "pending arsa in Istanbul over 500 m²") into a proposed filter set, shown as chips for the user to CONFIRM before applying. Never auto-applies.

## Three-tier moderation (OK / Uncertain / NOK)
AI pre-scores a listing and proposes OK/Uncertain/NOK with reasons; the moderator confirms or overrides. AI never publishes/rejects on its own.

## AI bulk actions
AI can propose a bulk action over a filtered/selected set (e.g., "flag 12 listings with missing tapu durumu"); the user reviews the affected rows and confirms before execution.

## Agent-ready hooks
- `data-action` (e.g., `approve`, `reject`, `edit-field`, `open-detail`) + `data-entity` (e.g., `listing`, `user`) on interactive elements.
- Route `handle.routeMeta` includes `{ title, permission, aiEntity }` so agents can map intents to routes.

## Guardrails
- **AI proposes, human disposes.** Every AI-originated mutation requires explicit human confirmation.
- Audit actor recorded as `ai:<agent>` (e.g., `ai:moderation-copilot`).
- AI actions respect the same RBAC as the acting user; no privilege escalation.
