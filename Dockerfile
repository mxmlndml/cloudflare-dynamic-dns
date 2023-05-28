FROM node:alpine AS base
# add pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate


FROM base as deps
WORKDIR /app
# install dependencies with pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile


FROM base as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build


FROM base as runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER node

CMD ["node", "./dist/index.js"]