FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="mersinfenrirotel" \
      org.opencontainers.image.description="Mersin Fenrir Otel — Kızkalesi" \
      org.opencontainers.image.source="https://github.com/enssgenc/mersinfenrirotel"

# Remove default config and copy ours
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy site
COPY index.html /usr/share/nginx/html/index.html
COPY 404.html /usr/share/nginx/html/404.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY llms.txt /usr/share/nginx/html/llms.txt
COPY kizkalesi-rehberi/ /usr/share/nginx/html/kizkalesi-rehberi/
COPY mersin-erdemli-otel/ /usr/share/nginx/html/mersin-erdemli-otel/
COPY korykos-antik-kenti/ /usr/share/nginx/html/korykos-antik-kenti/
COPY elaiussa-sebaste/ /usr/share/nginx/html/elaiussa-sebaste/
COPY kanlidivane/ /usr/share/nginx/html/kanlidivane/
COPY yarim-pansiyon-otel-mersin/ /usr/share/nginx/html/yarim-pansiyon-otel-mersin/
COPY kizkalesi-aile-tatili/ /usr/share/nginx/html/kizkalesi-aile-tatili/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
