FROM node:20-alpine AS base
WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN corepack enable && pnpm install

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
RUN pnpm --filter @monotickets/api build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
