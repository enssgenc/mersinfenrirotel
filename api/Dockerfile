FROM node:20-alpine

LABEL org.opencontainers.image.title="mersinfenrirotel-api" \
      org.opencontainers.image.description="Meta CAPI forwarder for mersinfenrirotel.com"

WORKDIR /app

COPY package.json ./
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=8s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz >/dev/null || exit 1

USER node
CMD ["node", "server.js"]
