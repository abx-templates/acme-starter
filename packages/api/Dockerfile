# Node 24 is load-bearing: Node 24's AsyncContextFrame resolves a dd-trace
# memory leak observed on earlier majors. Do not downgrade without re-testing
# tracing memory behavior under sustained load.
FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml* ./
COPY packages/api/package.json ./packages/api/
RUN pnpm install --filter @acme/api... --frozen-lockfile || pnpm install --filter @acme/api...

COPY packages/api ./packages/api
RUN pnpm --filter @acme/api db:generate && pnpm --filter @acme/api build

ENV DATABASE_URL="file:./prisma/dev.db"
EXPOSE 3000
CMD ["node", "packages/api/dist/main.js"]
