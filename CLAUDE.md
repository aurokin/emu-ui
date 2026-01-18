# EmuSync UI

## Package Manager

This project uses **Bun** as the package manager and runtime.

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Production build
bun run build

# Start production server
bun run start
```

## Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `bun run dev`       | Start development server with hot reload |
| `bun run build`     | Build for production                     |
| `bun run start`     | Serve production build                   |
| `bun run typecheck` | Run TypeScript type checking             |
| `bun run format`    | Format code with Prettier                |

## Tech Stack

- **Runtime**: Bun
- **Framework**: React Router v7 (with SSR)
- **Build Tool**: Vite
- **UI**: Material UI (MUI) + Tailwind CSS
- **State**: React Context API

## Important Notes

- Server-side code in `app/server/` uses `child_process.spawn` for SSH/SCP operations
- Redis is used for job tracking (`REDIS_URL` env var)
- Database config loaded from `db.json` (`DB_PATH` env var)
- Path alias `~/*` maps to `./app/*`

## Docker

Build and run with Docker:

```bash
docker build -t emu-ui .
docker run -p 3000:3000 -v /path/to/db.json:/app/db.json -e REDIS_URL=redis://host:6379 emu-ui
```
