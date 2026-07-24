# ADR 0001 — React Router v7 in Data Mode
**Status:** Accepted
**Context:** Need robust SPA routing with loaders/actions but no server. React Router v7 offers declarative, data, and framework modes; framework mode adds a Vite plugin + SSR concerns we explicitly reject.
**Decision:** Use DATA mode via `createBrowserRouter` + `<RouterProvider>`. Forbid framework mode, SSR/RSC, Next.js.
**Consequences:** Clean object-based routes with loaders/actions and route guards; no SSR complexity; pairs well with TanStack Query for client data.
