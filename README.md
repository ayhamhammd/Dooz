# DOOZ Café — website

A static site: no server, no database, no build step. Open `index.html` and it works.

```
index.html   the page
style.css    the look
app.js       menu rail, dish page, search, the "قائمتي" tally (saved in the phone's localStorage)
menu.js      THE MENU — 16 categories, 133 items. Edit prices and names here.
assets/      logo, hero videos, gallery photos, and one photo per dish in assets/menu/<id>.webp
render.yaml  Render deployment config
```

## Deploy to Render

1. Push this folder to a GitHub (or GitLab) repository.
2. On https://dashboard.render.com → **New → Blueprint** → choose the repo. Render reads `render.yaml` and creates the static site. (Or **New → Static Site**, publish directory `.`, build command empty.)
3. Every push to `main` redeploys automatically.
4. Custom domain: Settings → Custom Domains → add `doozjo.com`, then point the domain's DNS at the records Render shows.

Render's free static tier is enough for this site.

## Editing the menu

Everything is in `menu.js`. Each item looks like:

```js
{ "id": "pizza-4", "name": "بيتزا باربكيو", "en": "BBQ Pizza", "price": 7.5, "detail": "…", "image_url": "", "page": 3 }
```

- `price` is in JOD.
- The photo is `assets/menu/<id>.webp` unless `image_url` is set.
- Adding a category: copy a category block, give it a new `id`, and add the id to `SHORT` and `ICON_FOR` at the top of `app.js` so the strip has a short label and an icon.

## Adding a dish photo

Any photo works, but keep it small: `cwebp -q 78 -resize 800 0 photo.jpg -o assets/menu/<id>.webp` gives ~30 KB.

## Contact points

WhatsApp and phone links use `+962 79 666 8932`. The Google review link and the Instagram handle are in `index.html`.
