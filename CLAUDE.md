# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server (binds 0.0.0.0)
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint (flat config, TS + React hooks rules)
npm run preview      # Preview production build locally
npm run ii           # Clean npm cache and reinstall
```

No test framework is configured.

## Environment Setup

Copy `.env.example` to `.env` and set:
- `VITE_APP_LOGIN` / `VITE_APP_PASSWORD` — credentials
- `VITE_API_URL` — backend API base URL

The `.npmrc` configures a private GitLab registry for `@mrdn` scoped packages.

## Architecture

**Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4 (OKLCH theme variables, dark mode via `.dark` class)

### Feature-Based Module Structure

```
src/
├── app/                  # Shell: providers, layouts, router
├── features/             # Domain modules (Auth, Lines, Products, Tasks, etc.)
├── shared/               # Cross-cutting: api, components, hooks, types, lib
├── locales/              # i18n JSON files (EN, RU)
└── i18n.ts               # i18next config
```

Each feature module is self-contained with its own `routes.ts`, `ui/`, `hooks/`, `endpoints/`, and types. Features export route configs that are assembled in `src/app/router/`.

### Path Aliases (tsconfig.json)

`@app` → `src/app`, `@features` → `src/features`, `@shared` → `src/shared`, `@assets` → `src/assets`

### State Management

- **Zustand** for client state with localStorage persistence (e.g., `useOrganizationsStore` for selected INN)
- **React Query** for server state (retry=1, staleTime=30s, no refetch on window focus)
- **React Hook Form + Zod** for form state and validation

### API Layer

Axios singleton in `src/shared/api/http.ts`:
- Bearer token injected via request interceptor from localStorage
- Response interceptor handles errors and unwraps envelope (`isSuccess` flag)
- `setAxiosInn()` dynamically updates authorization headers per selected organization
- 15s timeout

Endpoints are defined with a type-safe builder in `src/shared/api/endpoints.ts`. Custom React Query hooks live in `src/shared/api/hooks/`.

### Routing & Layouts

React Router v7 with a custom route assembler (`src/app/router/assemble.tsx`) that:
- Wraps routes in one of 4 layouts: `app` (sidebar+header), `auth`, `blank`, `fullscreen`
- Applies RBAC Guards (permission-based and group-based)
- Lazy-loads feature components with Suspense

Route paths are centralized in `src/shared/config/pathRoute.ts` as `PATHS` constants.

### RBAC

Guard component in `src/app/router/` checks permissions/groups arrays. The `useCurrentUser()` hook is a placeholder returning empty sets — real integration pending.

### UI Components

- **shadcn/ui** primitives in `src/shared/components/ui/` (configured via `components.json`, style: new-york)
- Custom compound components: EntityList, Sidebar, SimpleTable, ExternalIframe
- Styling: `clsx` + `class-variance-authority` + `tailwind-merge`

### i18n

i18next with EN and RU translations in `src/locales/`. Russian is the default fallback. Language selection persists to localStorage.
