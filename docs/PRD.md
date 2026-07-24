# arsam.net Admin Panel — Product Requirements (PRD)

## Product
Back-office admin panel for arsam.net, a Turkish real-estate-only classifieds marketplace (emlak vertical). Used all day by internal staff to moderate listings, manage users/agents, configure taxonomy, and analyze the marketplace.

## Personas / Roles
- **Super-admin** — full access, RBAC + config, feature flags, layout defaults.
- **Moderator** — listing moderation queue, complaints, content actions.
- **Support** — user/agent assistance, verification, messaging oversight.
- **Finance** — promotions (doping), payments, invoices, refunds.
- **Analyst** — read-only dashboards, reports, exports.

## Modules (one-line purpose)
1. **Listings (ilan)** — CRUD + moderation for konut/işyeri/arsa/devremülk/turistik.
2. **Users & Agents (emlak ofisleri)** — verification, ban, trust scoring.
3. **Categories & Attributes** — manage m², oda sayısı, bina yaşı, kat, ısıtma, tapu durumu, imar durumu (arsa); drives dynamic listing forms.
4. **Locations** — il/ilçe/mahalle hierarchy (cascading).
5. **Promotions (doping/öne çıkarma) & Payments** — packages, purchases, invoices.
6. **Messaging & Complaints** — moderation of user messages and reports.
7. **Reports & Analytics** — dashboards (listings, revenue, moderation throughput).
8. **Audit Log** — immutable record of who/what/when (actor may be `ai:<agent>`).
9. **RBAC** — roles, permissions, matrix.
10. **Settings/Config** — including LAYOUT configurability (sidebar on/off).

## Key flows
- **Listing moderation (OK / Uncertain / NOK):** AI copilot pre-scores a listing; moderator confirms OK (publish), Uncertain (needs-info/hold), or NOK (reject with reason). AI proposes, human disposes; every decision is audited.
- **Listing lifecycle:** draft -> pending -> active -> (expired | archived | rejected); edits re-enter moderation when policy-relevant fields change.
- **User/agent verification:** submit docs -> review -> verify/ban/trust adjust -> audit.
- **Doping purchase:** select listing -> choose package -> payment -> promotion applied -> invoice -> audit.

## Layout configurability (hard requirement)
The panel owner can turn the sidebar on/off from Settings. Two first-class modes: `sidebar` (collapsible sidebar + topbar) and `topnav` (sidebar-less; horizontal nav with overflow/mega-menu + command palette). One nav schema powers both. `layoutMode` is per-user, persisted (localStorage now, API later), switchable without reload. On mobile both converge to drawer + bottom nav + command palette.

## Non-functional requirements
- **Mobile-first**, responsive across breakpoints.
- **Accessibility:** WCAG 2.2 AA (4.5:1 text, 3:1 large/UI, visible focus, keyboard support, 44px targets).
- **Performance:** virtualized long lists; server-driven tables; code-split routes; optimistic mutations.
- **AI-first:** agent-ready attributes + guardrails.

## Success criteria
- A moderator can triage a listing queue end-to-end on desktop and mobile.
- Every form field has a help affordance; every list is server-driven, URL-synced, exportable.
- Layout mode can be switched and persists; both modes are fully navigable.
- All components have Storybook coverage incl. mobile (+ both modes for shell).
