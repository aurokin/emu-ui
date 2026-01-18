# Repository Guidelines

## Project Structure & Module Organization

- Source: `app/` with subfolders: `components/`, `routes/`, `contexts/`, `theme/`, `types/`, `utilities/`. Entry layout: `app/root.tsx`.
- Routes: file-based under `app/routes/` (e.g., `home.tsx`). Route config lives in `app/routes.ts`.
- Aliases: use `~` for app imports (e.g., `import { Header } from "~/components/Header"`).
- Assets: `public/` for static files. Build output: `build/client` and `build/server`.
- Config: `react-router.config.ts` (SSR on by default), `vite.config.ts`, `tsconfig.json`.

## Build, Test, and Development Commands

- `npm run dev`: start dev server with HMR (Vite/React Router) on `http://localhost:5173`.
- `npm run build`: create production build into `build/`.
- `npm run start`: serve the built server bundle (defaults to port 3000).
- `npm run typecheck`: generate route types and run TypeScript.
- `npm run format`: format the repo with Prettier.
- Docker: `docker build -t emu-react .` then `docker run -p 3000:3000 emu-react`.

## Coding Style & Naming Conventions

- Language: TypeScript with React function components.
- Formatting: Prettier enforced (`tabWidth: 4`). Run `npm run format` before commits.
- Components: PascalCase file and export names (e.g., `Header.tsx`).
- Routes: lowercase by segment (e.g., `home.tsx`). Types/interfaces: PascalCase in `app/types/`.
- Imports: prefer `~/...` alias for files under `app/`.
- Styling: Tailwind CSS and MUI are available; keep utility classes readable.

## Testing Guidelines

- Tests are not configured yet. If adding tests, prefer Vitest + React Testing Library.
- Place tests alongside files as `*.test.ts(x)` or under `app/__tests__/`.
- Aim for focused unit tests on utilities/components; snapshot only when valuable.

## Commit & Pull Request Guidelines

- Commits: short, imperative subject (e.g., `Fix theme toggle flicker`), optionally include scope.
- PRs: include purpose, linked issues (`Closes #123`), and screenshots/gifs for UI changes.
- Before opening: run `npm run format` and `npm run typecheck`; ensure `npm run build` succeeds.
- Keep PRs small and cohesive; note any follow-ups in the description.
