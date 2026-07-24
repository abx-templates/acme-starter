# ACME Interview Exercise

A small, self-contained CMMS (facilities maintenance) application that mirrors our
production stack. You'll extend it during a live session. Please complete **Setup**
below *before* the session so we can spend our time together on the work itself.

## Stack

| Layer | Tech |
|-------|------|
| API (`packages/api`) | NestJS · TypeScript · Prisma · SQLite |
| Web (`packages/web`) | React 19 · TanStack Router · MUI v7 · Vite |
| Tooling | pnpm workspaces · Node 24 |

SQLite is used instead of PostgreSQL purely to keep setup dependency-free — no
database server to install.

## Setup (do this in advance)

**Prerequisites:** Node 24 (`nvm install 24` / `fnm install 24`) and pnpm via Corepack.

```bash
corepack enable
corepack prepare pnpm@10.11.0 --activate

cp packages/api/.env.example packages/api/.env
pnpm bootstrap    # installs deps, runs migrations, seeds the database
pnpm preflight    # verifies your environment is ready
```

`pnpm preflight` should end with "All good." If it doesn't, follow the commands it
prints. **If you can't get to a clean `pnpm preflight`, tell us before the session** —
we'd rather sort setup out ahead of time than spend the interview on it.

> These scripts are named `bootstrap` and `preflight` rather than `setup` and
> `doctor` on purpose: `pnpm setup` and `pnpm doctor` are reserved pnpm
> subcommands that would shadow same-named package scripts and silently do
> nothing. If you ever add a script whose name collides with a pnpm command, run
> it with `pnpm run <name>`.

## Running

```bash
pnpm dev
```

- API → http://localhost:3000/api
- Web → http://localhost:5173

The web dev server proxies `/api` to the NestJS server. Requests are authenticated
via an `x-user-id` header (see `packages/web/src/api/client.ts`); seeded users are
`user_admin` (ADMIN) and `user_tech` (TECHNICIAN).

## What's in the box

A working vertical slice you can use as a reference pattern:

- **API:** `packages/api/src/buildings/` — controller → service → Prisma, with the
  `AuthGuard` + `@CurrentUser()` authorization pattern. `work-orders/` has read-only
  endpoints.
- **Web:** `packages/web/src/router.tsx` — TanStack Router routes using **loaders**
  plus the typed client in `src/api/client.ts`. The Buildings and Work Orders pages
  show the fetch-and-render pattern.

## The exercise

You'll implement the feature described in [`SPEC.md`](./SPEC.md). Pick **one track**:

- **Full stack** — backend + frontend
- **API only** — backend
- **Web only** — frontend

## Using AI

Use whatever AI tooling you normally work with — Claude Code, Cursor, Copilot, or
none. This is how we actually build, so we want to see how you work. You'll share
your screen, and we'll ask you to walk us through your choices as you go, including
where the AI got something wrong and how you caught it. There are no trick rules
here: real workflow, out loud.
