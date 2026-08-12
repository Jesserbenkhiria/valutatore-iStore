# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Backend dependencies
COPY web/package.json web/package-lock.json ./
COPY web/backend/prisma ./backend/prisma
RUN npm ci

# Frontend dependencies and build
COPY web/frontend/package.json web/frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci --legacy-peer-deps

COPY web/ ./
ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
RUN cd frontend && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8081

RUN apk add --no-cache tini openssl

COPY web/package.json web/package-lock.json ./
COPY web/backend/prisma ./backend/prisma
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY web/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 8081

ENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]
CMD ["node", "backend/index.js"]
