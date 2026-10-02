# ACME Interview Exercise

A small, self-contained CMMS (facilities maintenance) application that mirrors our
production stack. You'll extend it during a live session. Please complete **Setup**
below _before_ the session so we can spend our time together on the work itself.

## Stack

| Layer                | Tech                                       |
| -------------------- | ------------------------------------------ |
| API (`packages/api`) | NestJS · TypeScript · Prisma · SQLite      |
| Web (`packages/web`) | React 19 · TanStack Router · MUI v7 · Vite |
| Tooling              | npm · Node 24                              |

SQLite is used instead of PostgreSQL purely to keep setup dependency-free — no
database server to install.

## Setup (do this in advance)

**Prerequisites:** Node 24 (`nvm install 24` / `fnm install 24`).

```bash
cp packages/api/.env.example packages/api/.env
npm --prefix packages/api install
npm --prefix packages/web install
npm --prefix packages/api run db:setup   # runs migrations, seeds the database
node scripts/preflight.mjs              # verifies your environment is ready
```

`node scripts/preflight.mjs` should end with "All good"
If it doesn't, follow the commands it prints.
**If you can't get to a clean preflight, tell us before the session** -
we'd rather sort setup out ahead of time than spend the interview on it.

## Running

Start the API and the web app in separate terminals:

```bash
npm --prefix packages/api start    # http://localhost:3000/api
npm --prefix packages/web start    # http://localhost:5173
```

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
