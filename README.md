# agentic — marketing site

The landing page for [agentic](https://github.com/maorbril/agentic), the
multi-model, cost-controlled harness that wraps Claude Code.

Static HTML/CSS/JS (zero build step) plus a [Remotion](https://remotion.dev)
project that renders two product animations.

```
agentic-site/
├── public/                       ← the site (deploy this folder as-is)
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   ├── hero-context-v2.webm      ← context-routing hero (VP9)
│   ├── hero-context-v2.mp4       ← context-routing hero (H.264)
│   ├── hero-context-v2-poster.webp
│   ├── eval-paired-v1.webm       ← paired-eval animation (VP9)
│   ├── eval-paired-v1.mp4        ← paired-eval animation (H.264)
│   ├── eval-paired-v1-poster.webp
│   ├── robots.txt
│   └── sitemap.xml
└── remotion/                     ← video source (not deployed)
    ├── posters.mjs                ← single source of truth for poster frames
    ├── src/
    │   ├── Root.tsx              ← HeroContext and EvalPaired compositions
    │   ├── theme.ts              ← video design tokens
    │   ├── anim.tsx              ← frame-driven animation helpers
    │   ├── components/           ← shared primitives (TerminalPanel, Chrome, Track)
    │   └── scenes/
    │       ├── HeroContext.tsx
    │       └── EvalPaired.tsx
    └── package.json
```

## Preview the site locally

Use a static file server that supports HTTP Range requests. The videos
need `206 Partial Content` to autoplay in Chrome, and
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

## Render the videos

The output filenames are versioned because Netlify caches versioned media for a
year. Bump the filename when an animation changes, then update both the render
scripts and `public/index.html` in the same change.

```bash
cd remotion
npm run build

# copy encoded video files
cp out/hero-context-v2.webm out/hero-context-v2.mp4 ../public/
cp out/eval-paired-v1.webm out/eval-paired-v1.mp4 ../public/

# convert lossless stills to small browser posters
cwebp -q 82 out/hero-context-v2-poster.png \
  -o ../public/hero-context-v2-poster.webp
cwebp -q 82 out/eval-paired-v1-poster.png \
  -o ../public/eval-paired-v1-poster.webp
```

The individual `hero:webm` / `hero:mp4` / `hero:poster` and `eval:webm` /
`eval:mp4` / `eval:poster` scripts are useful while iterating. Their frame
numbers are the intentional poster holds for each composition — `posters.mjs`
is the single source of truth for those frame numbers (run `npm run assets`
to list them); keep it aligned with the scene timelines.

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
