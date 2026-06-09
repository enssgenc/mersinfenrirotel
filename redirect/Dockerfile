FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="mersinfermirotel-redirects" \
      org.opencontainers.image.description="301 redirect for legacy / alternate domains to mersinfermirotel.com"

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=8s --retries=3 \
  CMD wget -qO- http://127.0.0.1/__health >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
