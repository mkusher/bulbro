# Project Instructions for Agents

## Project Summary

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

### Type checking — use `tsgo` (not `tsc`)

```bash
tsgo --project web       # Type-check web
tsgo --project server    # Type-check server
```

## Testing

- **Runner**: Bun's built-in test runner (`bun:test`)
- **File convention**: `*.spec.ts` co-located with source files (not `.test.ts`)
- **DOM mocking**: happy-dom preloaded via `web/bunfig.toml`
- **All tests live in `web/src/`** — there are no server tests currently
- **Run from `web/` directory**, not monorepo root
- Import `describe`, `it`, `expect`, `beforeEach` from `"bun:test"`

## TypeScript Rules

- `erasableSyntaxOnly: true` — only erasable TS syntax allowed
- `verbatimModuleSyntax: true` — must use `import type` / `export type`
- `strict: true` with `noUncheckedIndexedAccess: true`
- `noEmit: true` — TS is for type-checking only, Vite/Bun handle compilation
- JSX: `react-jsx` with `jsxImportSource: "preact"`
- Path alias: `@/*` maps to `./src/*` (in web and server)

### Erasable syntax

- **No `enum`** — use union string literal types instead:
  `type WeaponType = "hand" | "fist" | "pistol"`
- **No `namespace`**
- **No constructor parameter properties** (`public x: number` in constructors)

### Verbatim module syntax

Always use `import type` for type-only imports and `export type` for type-only
exports. Use inline `type` keyword in mixed imports:

```typescript
import type { Logger } from "pino";
import { type GameEvent, withEventMeta } from "./game-events/GameEvents";
export type { WeaponState };
```

### Access modifiers

- **Never** use `private`, `protected`, or `public` keywords
- Use `#` for private fields and methods
- Exception: `protected` is acceptable only for abstract class hierarchies
  where subclass access is required (e.g., `BaseScene`)

## Code Style

### Formatting (Biome)

- Formatter: **Biome** v2 (no Prettier)
- Linter: Biome with recommended rules
- `lineWidth: 2` — extremely narrow, tokens wrap to individual lines
- Run `bun check` to verify, `bun format` to auto-fix

### Imports

- External packages first, then internal/project imports
- Both `@/*` path aliases and relative imports are used (mixed style)
- Barrel re-exports via `index.ts` files

### Naming conventions

| Entity             | Convention  | Example                            |
|--------------------|-------------|------------------------------------|
| Classes / Types    | PascalCase  | `GameProcess`, `WeaponType`        |
| Functions / vars   | camelCase   | `createPlayer`, `deltaTime`        |
| Size constants     | UPPER_SNAKE | `BULBRO_SIZE`, `ENEMY_SIZE`        |
| Files (class/type) | PascalCase  | `GameProcess.ts`, `BulbroState.ts` |
| Files (utility)    | kebab-case  | `game-formulas.ts`                 |
| Test files         | *.spec.ts   | `TickProcess.spec.ts`              |
| Directories        | kebab-case  | `game-events/`, `weapons-definitions/` |
| Event type strings | camelCase   | `"bulbroMoved"`, `"enemyAttacked"` |

- No `I` prefix on interfaces
- No `public` keyword on class members — leave them undecorated

### Functions

- **Arrow functions** (`const`) for pure utilities and simple transforms
- **Function declarations** for complex logic and Preact components
- Return types are usually inferred; explicit when it aids clarity

### Exports

- **Named exports** exclusively — no default exports
- Exception: Storybook stories (required by convention) and `server/src/index.ts`

### Error handling

- Guard clauses with early return (dominant pattern)
- `arktype` for runtime validation on server, checking `instanceof type.errors`
- `try/catch` only at I/O boundaries (WebSocket messages, etc.)
- No Result/Either monads — use `undefined` returns and thrown errors

### Types

- Define types inline alongside their implementation, not in separate files
- Use `type` for unions, aliases, intersections; `interface` for object shapes
- Branded types for type safety: `type DeltaTime = number & { readonly __brand: "DeltaTime" }`
- Derive TS types from arktype validators: `export type Player = typeof Player.infer`

## Architecture

- **Event sourcing**: game state via pure `updateState()` reducer in `waveState.ts`
- **Immutable state classes**: `BulbroState`, `EnemyState` store data in `#props`, return new instances
- **Preact signals** for reactive state; **Pino** for structured logging
- **Manual DI**: constructor params for deps; module-level singletons for registries
- **Runtime validation**: `arktype` on both client and server
