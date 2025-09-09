# Disaster Dashboard (Next.js)

This is a Next.js port of your Flask "disaster-map-app".

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel

- Push this folder to a GitHub repo.
- Import it in Vercel → New Project → Deploy.

### Notes

- Leaflet and D3 are loaded from CDN.
- Data files live in `/public/data/` and are fetched via `/data/...`.
- Original `static/js` modules are served from `/public/scripts` and loaded as an ES module from the page.
