# mersinfenrirotel — Meta CAPI Forwarder

Node 20 + native `http`, dependency yok. Tek endpoint: `POST /api/track`.

## Env

| Key | Description | Default |
|---|---|---|
| `META_PIXEL_ID` | Meta Pixel / Dataset ID | `988957093495648` |
| `META_CAPI_ACCESS_TOKEN` | **secret** — Meta system user token (uzun ömürlü) | — (required) |
| `META_CAPI_TEST_EVENT_CODE` | Events Manager → Test events için kod | — |
| `META_GRAPH_VERSION` | Graph API version | `v22.0` |
| `ALLOWED_ORIGINS` | CORS whitelist, virgülle ayrılmış | `https://mersinfenrirotel.com,https://www.mersinfenrirotel.com` |
| `PORT` | Listen port | `3000` |

## Endpoints

- `GET /healthz` → status JSON
- `POST /api/track` → CAPI'ye forward

`POST /api/track` body örneği:
```json
{
  "event_name": "Contact",
  "event_id": "5f9c…",
  "event_source_url": "https://mersinfenrirotel.com/#reserve",
  "user_data": {
    "email": "guest@example.com",
    "phone": "+90 532 000 00 00",
    "fbp": "fb.1.…",
    "fbc": "fb.1.…"
  },
  "custom_data": {
    "content_name": "phone"
  }
}
```

Email ve phone server-side SHA-256 ile hash'lenir; düz halde Meta'ya gitmez.

## Deduplication

Frontend `fbq('track', name, params, { eventID: id })` aynı `event_id` ile bu endpoint'i de çağırınca Meta tarafında client+server event'leri tek olarak sayılır. Match Quality'yi yükselten asıl mekanizma budur.
