# Bulbro

Bulbro is an open-source clone of Brotato — a roguelike arcade shooter built with
Pixi.js and Preact. Players control potato characters ("bulbros") through 60-second
rounds with weapons, stats, and a shop between rounds. The project uses **Bun** as
runtime, package manager, and test runner throughout.

## Monorepo Structure

Bun workspaces monorepo with three package groups:

- `web/` — Game client (Pixi.js + Preact + Tailwind CSS + shadcn/ui)
- `server/` — Backend (Hono + Bun WebSocket, port 8080)
- `packages/*` — Shared packages (e.g. `storybook-dev-tools`)

**Respect package roots** — run commands from the relevant workspace, not the
monorepo root, unless using a root script. Tests especially must run from
their workspace (e.g. `web/`).

## Build / Lint / Test Commands

### From monorepo root

```bash
bun install              # Install all dependencies
bun run build            # Build web client (outputs to server/public)
bun types                # Type-check with tsgo (web + server)
bun format               # Format with Biome (web/src + server/src)
bun check                # Lint + format check with Biome
bun start:server         # Start the server
```

### From `web/`

```bash
bun test                 # Run all tests (bun test runner + happy-dom)
bun test src/path/to/file.spec.ts          # Run a single test file
bun test --test-name-pattern "pattern"     # Run tests matching a name
bun run build            # Vite build
bun run start            # Vite dev server
bun run storybook        # Storybook dev server (port 6006)
bun run types            # Type-check web with tsgo
bun run format           # Format web/src with Biome
```

### From `server/`

```bash
bun run start            # Start server (port 8080)
bun run dev              # Start server with --watch
bun run format           # Format server/src with Biome
```
