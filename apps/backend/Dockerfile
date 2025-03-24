#syntax=docker/dockerfile:1.7-labs
# 支援exclude文法

###############
# BUILD STAGE # This stage is used to build application before production (Typescript => Javascript)
###############
FROM node:20-alpine AS base
# Create and move into /app folder
WORKDIR /app
# Activate corepack to use pnpm
RUN npm install -g corepack@latest turbo
RUN corepack use pnpm@9.0.0

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune backend --docker

# 安裝階段：安裝依賴並構建項目
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY pnpm-*.yaml ./
COPY .npmrc ./
# 安裝依賴，因為還包含了devDependencies，所以會比較大
RUN pnpm i --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN turbo build --filter=backend...

# 運行階段：設定最終的運行環境
FROM base AS runner
WORKDIR /app
COPY --exclude=**/node_modules --from=installer /app .
RUN pnpm i --frozen-lockfile --prod
## 1.暫時不知道為啥這裏不生效，換上麵方法
# COPY --from=installer /app .
# RUN pnpm prune --prod
## 2.方法2
# RUN rm -rf ./node_modules && rm -rf ./**/*/node_modules
# RUN pnpm i --prod

# 拷貝部署
FROM base AS deploy
LABEL org.opencontainers.image.source="https://github.com/NTD-Driven-Development/lobby"
WORKDIR /app
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastifyapp
USER fastifyapp
COPY --from=runner --chown=fastifyapp:nodejs /app .

# 設定容器啓動命令
CMD ["pnpm", "-F", "backend", "start"]