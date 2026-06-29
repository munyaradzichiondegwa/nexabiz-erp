FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3010/health || exit 1
CMD ["npx","ts-node","-T","src/server.ts"]
