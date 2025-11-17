FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && (test -f pnpm-lock.yaml && pnpm install --frozen-lockfile || pnpm install)
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN corepack enable && (test -f pnpm-lock.yaml && pnpm install --prod --ignore-scripts --frozen-lockfile || pnpm install --prod --ignore-scripts)
EXPOSE 5000
CMD ["node", "dist/index.js"]
