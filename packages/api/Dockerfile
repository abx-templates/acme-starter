# Node 24 is load-bearing: Node 24's AsyncContextFrame resolves a dd-trace
# memory leak observed on earlier majors. Do not downgrade without re-testing
# tracing memory behavior under sustained load.
FROM node:24-alpine

WORKDIR /app

COPY packages/api/package.json packages/api/package-lock.json ./
RUN npm ci

COPY packages/api ./
RUN npm run db:generate && npm run build

ENV DATABASE_URL="file:./prisma/dev.db"
EXPOSE 3000
CMD ["node", "dist/main.js"]
