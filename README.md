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
│   ├── demo.webm        ← rendered demo video (VP9)
│   ├── demo.mp4         ← rendered demo video (H.264 fallback)
│   ├── demo-poster.webp ← poster for the demo section
│   ├── robots.txt
│   └── sitemap.xml
└── remotion/            ← source for the videos (not deployed)
    ├── src/
    │   ├── Root.tsx         ← compositions (Hero, Demo) + scene timeline
    │   ├── theme.ts         ← shared design tokens (mirror of styles.css)
    │   ├── Terminal.tsx
    │   ├── anim.tsx         ← Typewriter / FadeUp helpers
    │   └── scenes/          ← Launch → Routing → Cost → Brand, plus Demo
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

After editing scenes, re-render and copy the artifacts into `public/`:

```bash
cd remotion
npm run render:webm   # → out/hero.webm  (VP9, crf 18)
npm run render:mp4    # → out/hero.mp4   (H.264, crf 18)
npm run still         # → out/poster.png (frame 300 = brand card)

# then refresh the site's copies:
cp out/hero.webm out/hero.mp4 ../public/
cwebp -q 82 out/poster.png -o ../public/hero-poster.webp
```

(`npm run build` runs all three renders in one go.)

## Re-render the demo video

Same idea, for the `Demo` composition (`src/scenes/SceneDemo.tsx`):

```bash
cd remotion
npm run render:demo-webm   # → out/demo.webm (VP9, crf 18)
npm run render:demo-mp4    # → out/demo.mp4  (H.264, crf 18)
npx remotion still Demo out/demo-poster.png --frame=280  # brand/statusline frame

# then refresh the site's copies:
cp out/demo.webm out/demo.mp4 ../public/
cwebp -q 82 out/demo-poster.png -o ../public/demo-poster.webp
```

(`npm run build:demo` runs both video renders in one go — the poster still
needs the manual `remotion still` + `cwebp` steps above.)

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
