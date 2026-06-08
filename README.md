# Mersin Fenrir Otel

Kızkalesi sahilindeki butik otelin tek sayfa tanıtım sitesi.

## Stack
- Vanilla HTML / CSS / JS (static)
- nginx (Alpine) Docker image
- Coolify üzerinde deploy (GitHub webhook ile auto-build)

## Geliştirme
Tek sayfa, build yok. Yerelde:

```sh
python3 -m http.server 8080
# veya
npx serve .
```

## Görseller
Hero, oda, galeri görselleri şu an Unsplash CDN'den çekiliyor. Otel kendi görsellerini paylaştığında:
1. `assets/` (veya `public/assets/`) altına indir
2. `index.html` içindeki `https://images.unsplash.com/...` URL'lerini `/assets/<isim>.jpg` ile değiştir

## İletişim placeholder'ları
Aşağıdaki alanlar gerçek bilgi gelince güncellenecek:
- `+90 ··· ··· ·· ··` — telefon
- `info@mersinfenrirotel.com` — e-posta (DNS'e MX gerekiyor)
- `@mersinfenrirotel` — Instagram
- `https://wa.me/900000000000` — WhatsApp linki
- OpenStreetMap iframe — gerçek koordinatla

## Deploy
`main` branch'e push → Coolify webhook → otomatik build & deploy.
