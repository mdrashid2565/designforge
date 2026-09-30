FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY packages/ packages/
COPY apps/ apps/

RUN npm install
RUN npm run build:core
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV MCP_PORT=4000

COPY --from=builder /app /app

EXPOSE 3000 4000

CMD ["npm", "run", "dev:all"]
