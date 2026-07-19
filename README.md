# agentic — marketing site

The landing page for [agentic](https://github.com/maorbril/agentic), the
multi-model, cost-controlled harness that wraps Claude Code.

Static HTML/CSS/JS (zero build step) plus a [Remotion](https://remotion.dev)
project that renders the animated hero video.

```
agentic-site/
├── public/              ← the site (deploy this folder as-is)
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   ├── hero.webm        ← rendered hero video (VP9)
│   ├── hero.mp4         ← rendered hero video (H.264 fallback)
│   ├── hero-poster.webp ← poster / LCP image
│   ├── robots.txt
│   └── sitemap.xml
└── remotion/            ← source for the hero video (not deployed)
    ├── src/
    │   ├── Root.tsx         ← composition (renders SceneDemo as Hero)
    │   ├── theme.ts         ← shared design tokens (mirror of styles.css)
    │   ├── anim.tsx         ← Typewriter / FadeUp helpers
    │   └── scenes/
    │       └── SceneDemo.tsx ← the hero scene: auto-routing demo
    └── package.json
```

## Preview the site locally

Use a static file server that supports HTTP Range requests — the hero
video needs `206 Partial Content` to autoplay in Chrome, and
`python3 -m http.server` always returns `200` with the full file, which
makes the video silently fail to autoplay there. From the repo root:

```bash
cd public && npx serve -l 8080
# open http://localhost:8080
```

## Work on the videos

```bash
cd remotion
npm install
npm run studio        # interactive Remotion Studio preview
```

## Re-render the hero video

After editing the scene, re-render and copy the artifacts into `public/`:

```bash
cd remotion
npm run render:webm   # → out/hero.webm  (VP9, crf 18)
npm run render:mp4    # → out/hero.mp4   (H.264, crf 18)
npm run still         # → out/poster.png (frame 280 = statusline)

# then refresh the site's copies:
cp out/hero.webm out/hero.mp4 ../public/
cwebp -q 82 out/poster.png -o ../public/hero-poster.webp
```

(`npm run build` runs all three renders in one go.)

## Deploy

The site is the `public/` folder — no build. Options:

- **GitHub Pages** — point Pages at this repo and serve `public/`
  (or move the files to the repo root / a `docs/` folder). Update the absolute
  URLs in `robots.txt` and `sitemap.xml` to the final domain.
- **Netlify / Vercel / Cloudflare Pages** — set the publish directory to
  `public/`, no build command.
- **Any static host / S3+CloudFront** — upload the contents of `public/`.

All asset paths in `index.html` are relative, so the folder works from any base
path.
