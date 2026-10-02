#!/usr/bin/env bash
# Preflight check, modeled on `flutter doctor`. Run `./scripts/preflight.sh`
# after the README setup steps to confirm your environment is ready BEFORE the
# live session. Warnings (!) are worth a look; failures (✗) must be fixed.
set -u

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
api="$root/packages/api"
web="$root/packages/web"

# Color only when writing to a terminal and NO_COLOR is not set.
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  green=$'\033[32m' yellow=$'\033[33m' red=$'\033[31m' bold=$'\033[1m' dim=$'\033[2m' reset=$'\033[0m'
else
  green='' yellow='' red='' bold='' dim='' reset=''
fi

now_ms() {
  if [ -n "${EPOCHREALTIME:-}" ]; then
    local t="${EPOCHREALTIME/[.,]/}"
    echo $((t / 1000))
  elif command -v perl >/dev/null 2>&1; then
    perl -MTime::HiRes=time -e 'printf "%d", time * 1000'
  else
    echo $(($(date +%s) * 1000))
  fi
}

warn_sections=0
fail_sections=0
sec_name='' sec_start=0 sec_status=ok
sec_lines=()

begin() {
  sec_name="$1"
  sec_start="$(now_ms)"
  sec_status=ok
  sec_lines=()
}
detail() { sec_lines+=("    • $1"); }
warn() {
  sec_lines+=("    ${yellow}!${reset} $1")
  [ "$sec_status" = ok ] && sec_status=warn
}
fail() {
  sec_lines+=("    ${red}✗${reset} $1")
  sec_status=fail
}
finish() {
  local elapsed=$(($(now_ms) - sec_start)) marker
  case "$sec_status" in
    ok) marker="${green}[✓]${reset}" ;;
    warn)
      marker="${yellow}[!]${reset}"
      warn_sections=$((warn_sections + 1))
      ;;
    fail)
      marker="${red}[✗]${reset}"
      fail_sections=$((fail_sections + 1))
      ;;
  esac
  printf '%s %s %s[%sms]%s\n' "$marker" "$sec_name" "$dim" "$elapsed" "$reset"
  printf '%s\n' ${sec_lines[@]+"${sec_lines[@]}"}
  echo
}

# Prints the process listening on a TCP port, or nothing if the port is free.
port_listener() {
  command -v lsof >/dev/null 2>&1 || return 0
  lsof -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | awk 'NR == 2 { printf "%s (pid %s)", $1, $2 }'
}

printf '\n%sACME interview - environment check%s\n\n' "$bold" "$reset"

# --- Node.js ---------------------------------------------------------------
begin 'Node.js'
have_node=0
if ! command -v node >/dev/null 2>&1; then
  fail 'Node not found - install Node 24 (nvm install 24 / fnm install 24)'
else
  have_node=1
  node_version="$(node --version | sed 's/^v//')"
  node_major="${node_version%%.*}"
  if [ "$node_major" -ge 24 ]; then
    detail "Node version $node_version"
  elif [ "$node_major" -ge 20 ]; then
    warn "Node $node_version - repo targets Node 24; use nvm/fnm to switch"
  else
    fail "Node $node_version is too old - install Node 24"
  fi
  detail "Node binary at $(command -v node)"
  if command -v npm >/dev/null 2>&1; then
    detail "npm version $(npm --version)"
  else
    fail 'npm not found - it ships with Node, reinstall Node 24'
  fi
fi
finish

# --- API -------------------------------------------------------------------
begin 'API - NestJS + Prisma (packages/api)'
if [ -d "$api/node_modules" ]; then
  detail 'Dependencies installed'
else
  fail 'Dependencies missing - run: npm --prefix packages/api install'
fi

# Actually load the Prisma client from the API package, rather than guessing at
# the node_modules layout. If `prisma generate` hasn't run, constructing
# PrismaClient throws.
if [ "$have_node" -eq 0 ]; then
  fail 'Prisma client not checked - Node is missing'
elif (
  cd "$api" &&
    DATABASE_URL="${DATABASE_URL:-file:./dev.db}" \
      node -e "new (require('@prisma/client').PrismaClient)()" >/dev/null 2>&1
); then
  prisma_version="$(cd "$api" && node -p "require('@prisma/client/package.json').version" 2>/dev/null)"
  detail "Prisma client ${prisma_version:-unknown version} generated"
else
  fail 'Prisma client not generated - run: npm --prefix packages/api run db:generate'
fi

if [ -f "$api/.env" ]; then
  detail "Environment file at $api/.env"
else
  fail 'API .env missing - run: cp packages/api/.env.example packages/api/.env'
fi

if [ -f "$api/prisma/dev.db" ]; then
  detail "SQLite database at $api/prisma/dev.db (migrated + seeded)"
else
  fail 'Database not set up - run: npm --prefix packages/api run db:setup'
fi
finish

# --- Web -------------------------------------------------------------------
begin 'Web - React + Vite (packages/web)'
if [ -d "$web/node_modules" ]; then
  detail 'Dependencies installed'
else
  fail 'Dependencies missing - run: npm --prefix packages/web install'
fi
finish

# --- Ports -----------------------------------------------------------------
begin 'Network ports'
for entry in 3000:API 5173:Web; do
  port="${entry%%:*}"
  name="${entry#*:}"
  listener="$(port_listener "$port")"
  if [ -z "$listener" ]; then
    detail "Port $port is free for the $name server"
  else
    warn "Port $port is in use by $listener - the $name server will not start until it is stopped"
  fi
done
finish

# --- Summary ---------------------------------------------------------------
if [ "$fail_sections" -gt 0 ]; then
  printf '%s✗ Setup incomplete,%s fix the items marked ✗ above\n' "$red$bold" "$reset"
  printf '  First-time setup: see the Setup section of README.md\n\n'
  exit 1
fi

if [ "$warn_sections" -gt 0 ]; then
  printf '%s! Preflight found warnings in %d %s%s\n\n' "$yellow" "$warn_sections" \
    "$([ "$warn_sections" -eq 1 ] && echo category || echo categories)" "$reset"
else
  printf '• %sAll good%s\n\n' "$green$bold" "$reset"
fi
