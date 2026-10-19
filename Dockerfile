# ---- 构建阶段：安装依赖并编译 ----
FROM node:20-alpine AS builder
WORKDIR /app

# 先复制依赖清单，充分利用 Docker 层缓存
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# ---- 运行阶段：仅保留生产依赖与编译产物 ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
