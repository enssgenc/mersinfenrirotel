# Redirect service

Sole purpose: serve `301 Moved Permanently` from every alternate / legacy
domain to the canonical `https://mersinfermirotel.com`.

- nginx:1.27-alpine, single 50-line conf
- Path + query are preserved (`$request_uri`)
- `/robots.txt` returns a minimal "allow everything" stub pointing at the
  canonical sitemap — so search engines treat this host as an alias and
  forward link equity rather than treating it as a unique site
- `/__health` returns 200 for Coolify probes

Domains handled (configured here, must also be attached as FQDNs in Coolify):

| From | To |
|---|---|
| mersinfenrirotel.com (+ www) | https://mersinfermirotel.com |
| mersinfermirgrandotel.com (+ www) | https://mersinfermirotel.com |
| fermirgrandotel.com (+ www) | https://mersinfermirotel.com |
| mersinkizkalesiotel.com (+ www) | https://mersinfermirotel.com |
| www.mersinfermirotel.com | https://mersinfermirotel.com (apex canonical) |
