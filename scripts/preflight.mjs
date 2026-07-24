#!/usr/bin/env node
// Preflight check. Run `pnpm preflight` after `pnpm bootstrap` to confirm your
// environment is ready BEFORE the live session. Uses only Node built-ins so it
// runs even before dependencies are installed.
//
// NOTE: the script is named `preflight` (not `doctor`) and setup is `bootstrap`
// (not `setup`) on purpose — `pnpm doctor` and `pnpm setup` are reserved pnpm
// subcommands that would shadow same-named package scripts and silently no-op.
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const api = join(root, 'packages', 'api');
const web = join(root, 'packages', 'web');

let hardFailure = false;
const ok = (m) => console.log(`  \u2713 ${m}`);
const warn = (m) => console.log(`  \u26a0 ${m}`);
const fail = (m) => {
  console.log(`  \u2717 ${m}`);
  hardFailure = true;
};

console.log('\nACME interview — environment check\n');

const major = Number(process.versions.node.split('.')[0]);
if (major >= 24) ok(`Node ${process.versions.node}`);
else if (major >= 20)
  warn(`Node ${process.versions.node} — repo targets Node 24; use nvm/fnm to switch`);
else fail(`Node ${process.versions.node} is too old — install Node 24`);

try {
  const v = execSync('pnpm --version', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
  ok(`pnpm ${v}`);
} catch {
  fail('pnpm not found — run: corepack enable && corepack prepare pnpm@10.11.0 --activate');
}

if (existsSync(join(root, 'node_modules')) && existsSync(join(web, 'node_modules')))
  ok('Dependencies installed');
else fail('Dependencies missing — run: pnpm install');

// Prisma client generated — actually load it in a subprocess from the API
// package, rather than guessing at pnpm's store layout (which produced false
// negatives). If `prisma generate` hasn't run, constructing PrismaClient throws.
let clientGenerated = false;
try {
  execSync('node -e "new (require(\'@prisma/client\').PrismaClient)()"', {
    cwd: api,
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' },
  });
  clientGenerated = true;
} catch {
  clientGenerated = false;
}
if (clientGenerated) ok('Prisma client generated');
else fail('Prisma client not generated — run: pnpm --filter @acme/api db:generate');

if (existsSync(join(api, '.env'))) ok('API .env present');
else fail('API .env missing — run: cp packages/api/.env.example packages/api/.env');

if (existsSync(join(api, 'prisma', 'dev.db')))
  ok('SQLite database present (migrated + seeded)');
else fail('Database not set up — run: pnpm --filter @acme/api db:setup');

console.log('');
if (hardFailure) {
  console.log('Setup incomplete. Fix the items marked \u2717 above, then re-run `pnpm preflight`.\n');
  console.log('First-time setup, all in one step:  pnpm bootstrap && pnpm preflight\n');
  process.exit(1);
} else {
  console.log('All good. Start both apps with:  pnpm dev');
  console.log('  API  -> http://localhost:3000/api');
  console.log('  Web  -> http://localhost:5173\n');
}
