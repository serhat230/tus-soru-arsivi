# TUS Soru Arşivi (React + Vite)

Bu proje, sohbetlerinde sorduğun TUS odaklı tıbbi sorulardan derlenmiş bir **soru arşivi** sitesidir.

## Kurulum
1) ZIP'i indir ve çıkar.
2) Klasörde terminal aç:
```bash
npm install
npm run dev
```
Tarayıcıda http://localhost:5173 adresine git.

## Yayınlama
### Vercel
```bash
npm run build
```
Oluşan `dist/` klasörünü Vercel'e yükle (Framework: Vite).

### Netlify
Netlify site oluştururken Build komutu: `npm run build`, Publish directory: `dist`.

## Özellikler
- Arama ve kategori filtresi
- Soru kopyalama
- JSON dışa aktarma
- Yeni soru ekleme (modal)

> Not: Bu sürüm harici UI kütüphanesi kullanmaz; tek komutla çalışır.
