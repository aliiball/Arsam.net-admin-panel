# ADR 0006 — Configurable Layout (Sidebar / Topnav)
**Status:** Accepted
**Context:** The panel owner must be able to turn the sidebar on/off; both a sidebar and a sidebar-less topbar navigation must give equivalent access to every module.
**Decision:** AppShell supports `layoutMode: 'sidebar' | 'topnav'`, driven by ONE `navSchema`. Runtime switch without reload; per-user persistence (localStorage now, API later). topnav uses priority+ overflow ("More"/mega-menu) + command palette; mobile converges to drawer + bottom nav + palette. Shell components ship Storybook stories for BOTH modes.
**Consequences:** Single nav source avoids drift; users choose their layout; extra story/testing burden accepted for shell parts.
