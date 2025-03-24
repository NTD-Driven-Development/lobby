###############
# BUILD STAGE # This stage is used to build application before production (Typescript => Javascript)
###############
FROM node:20-alpine AS builder

# Create and move into /app folder
WORKDIR /app

RUN apk update
RUN apk add --no-cache libc6-compat

RUN yarn global add turbo
COPY . .

RUN turbo prune frontend --docker

###################
# INSTALLER STAGE # This stage is used to build application before production
###################
FROM node:20-alpine AS installer

# Create and move into /app folder
WORKDIR /app

RUN apk update
RUN apk add --no-cache libc6-compat

# First install dependencies (as they change less often)
COPY .npmrc .gitignore ./
COPY --from=builder /app/out/json/ .
COPY pnpm-*.yaml ./

RUN npm pkg delete scripts.prepare

# Activate corepack to use pnpm
RUN npm install -g corepack@latest
RUN corepack use pnpm@9.0.0
RUN pnpm install -r --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ ./

RUN pnpm turbo build --filter=frontend...

# TEAM CACHE: clean prerequisites
RUN rm -rf .git

RUN cd /app/apps/frontend && pnpm build

FROM node:20-alpine AS runner
LABEL org.opencontainers.image.source="https://github.com/NTD-Driven-Development/lobby"

# Create and move into /app folder
WORKDIR /app

EXPOSE 3000

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs
USER nuxtjs

COPY --from=installer --chown=nuxtjs:nodejs /app/apps/frontend/.output /app/.output

CMD ["node", "/app/.output/server/index.mjs"]