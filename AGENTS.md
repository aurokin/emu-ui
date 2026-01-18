# Repository Guidelines

## Purpose

- This file guides agentic coding assistants in this repo.
- Keep changes minimal and consistent with existing patterns.
- Update this file if tooling or conventions change.

## Project Structure

- Source lives in `app/` with subfolders for components, routes, contexts, theme, types, utilities.
- Entry layout: `app/root.tsx`.
- Routes are file-based under `app/routes/`.
- Route manifest is centralized in `app/routes.ts`.
- Route types are generated into `app/routes/+types` and `.react-router/types` (do not edit).
- Server-side helpers live in `app/server/`.
- Shared domain types live in `app/types/`.
- UI/state code lives in `app/components/` and `app/contexts/`.
- Client utilities live in `app/utilities/`.
- Global styles live in `app/app.css`.
- Static assets live in `public/`.
- Build output goes to `build/client` and `build/server`.

## Configuration

- React Router SSR config lives in `react-router.config.ts` (SSR stays enabled).
- Vite plugins are wired in `vite.config.ts` (React Router, Tailwind, tsconfig paths).
- TypeScript settings and the `~/` path alias live in `tsconfig.json`.
- Prettier settings live in `.prettierrc` (`tabWidth: 4`).
- No ESLint config exists today; avoid adding one unless requested.
- Tailwind is enabled via the Vite plugin (no standalone config file).
- No Cursor or Copilot rule files exist in this repo currently.

## Package Manager

- Scripts are defined in `package.json` and use `bunx` internally.
- Use `bun run <script>` to execute scripts.
- Use `bunx` for one-off CLI invocations.

## Dev / Build / Run

- `bun run dev`: start the dev server with HMR at `http://localhost:5173`.
- `bun run build`: create the production build in `build/`.
- `bun run start`: serve the built server bundle (defaults to port 3000).
- `bun run typecheck`: run React Router typegen + TypeScript.
- `bun run format`: format the repo with Prettier.
- Docker: `docker build -t emu-react .` then `docker run -p 3000:3000 emu-react`.

## Linting & Tests

- ESLint is not configured yet.
- Use `bun run typecheck` as the primary static analysis step.
- There is no automated test runner configured in the repo.
- If tests are added, prefer Vitest + React Testing Library.
- Single test file (after adding Vitest): `bunx vitest path/to/file.test.tsx`.

## Local Setup

- Redis is required for server flows; default is `redis://localhost:6379`.
- Override Redis with `REDIS_URL` in environment when needed.
- Document env vars in `.env.example` and never commit secrets.

## Formatting

- Prettier is configured via `.prettierrc` with 4-space indentation.
- Use double quotes for strings (matches existing code).
- Let Prettier manage trailing commas and line wrapping.

## Imports

- Prefer the `~/` alias for anything under `app/`.
- Keep import groups ordered: React/React Router, external libs, internal aliases, relative paths.
- Use `import type` for type-only imports.
- For MUI, import from explicit modules (e.g., `@mui/material/Box`).

## TypeScript & Types

- TypeScript runs in strict mode (see `tsconfig.json`).
- Add explicit types for exported functions and public APIs when helpful.
- Keep shared types in `app/types/` and server types in `app/server/types.ts`.
- Prefer `type` aliases for unions; use `interface` for object shapes.
- Avoid `any`; use `unknown` and narrow as needed.

## React & Router Patterns

- Use function components and hooks (no class components).
- Route modules typically export `meta`, `loader`, `action`, and a default component.
- Import route types from `./+types/<route>` (example: `import type { Route } ...`).
- Loaders/actions should return `Response.json` for API responses.
- Keep provider trees in `app/root.tsx` and use `ErrorBoundary` for routes.

## Server & API Conventions

- API routes live in `app/routes/api.*.ts` and use loader functions.
- Initialize server state with `initializeServer` before accessing devices.
- Keep Redis logic in `app/server/redis.ts`; avoid direct Redis calls in routes.
- Favor small helpers in `app/server/` over heavy logic in route files.
- Return JSON via `Response.json` and set status codes when needed.

## Data Fetching & Error Handling

- Check `response.ok` before parsing JSON in client fetches.
- Use `try/catch/finally` to manage loading and error states.
- Log server errors with `console.error` and keep UI messages friendly.

## State & Data Flow

- Contexts manage cross-component state (see `DeviceContext`).
- Keep async state transitions in one function (set loading/error/data together).
- Store request flags (e.g., `requestInProgress`) alongside data.

## Styling & UI

- Tailwind is available; use utilities sparingly and keep them readable.
- MUI `sx` props are the primary styling mechanism in components.
- Prefer design tokens defined in `app/app.css` for colors and fonts.
- Use responsive values with `{ xs, sm, md }` in MUI `sx`.

## Accessibility

- Use semantic HTML elements where possible.
- Ensure clickable elements have clear focus/hover states.
- Provide `aria-label` for interactive icons without text.

## Naming Conventions

- Components: PascalCase file and export names (e.g., `Header.tsx`).
- Hooks: camelCase starting with `use` (e.g., `useDevices`).
- Contexts: `XContext` plus `XProvider`.
- Routes: lowercase by segment (e.g., `routes/home.tsx`).
- API routes: `routes/api.*.ts` and dynamic params use `$id`.
- Files: `.tsx` for React components; `.ts` for utilities/server.
- Constants: `UPPER_SNAKE_CASE` when module-level constants are needed.

## Common Workflows

- Adding a route: create `app/routes/*.tsx`, then update `app/routes.ts`.
- Changing routes: run `bun run typecheck` to regenerate types.
- Adding server logic: place helpers in `app/server/` and keep routes thin.
- Adding shared data types: define them in `app/types/`.

## Performance Notes

- Avoid unnecessary re-renders; memoize heavy computations where needed.
- Keep async state updates batched to minimize UI churn.
- Reuse context values; avoid creating new objects in render paths.
- Prefer Redis caching over repeated IO when possible.

## Contribution Hygiene

- Keep changes minimal and avoid editing generated files.
- Run `bun run format` and `bun run typecheck` before PRs.
