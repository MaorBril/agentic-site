# Gremlord I2V prompts

Source stills (in this folder):

- `gremlin-1080p.png` — gremlin only, no wordmark. **Use this one for I2V.**
  Models tend to mangle small text under motion; keep the wordmark as a
  separate static/CSS overlay on the site instead of asking the model to
  animate it.
- `gremlin-wordmark-1080p.png` — full lockup (gremlin + GREMLORD wordmark),
  kept for reference / thumbnails / static use, not recommended as an I2V
  source.

Both are 1920×1080, `#0a0a0b` background, ASCII art in light gray
(`rgb(200,200,208)`), matching the site's dark terminal palette.

## The shot

Two beats, ~8s total, static camera, nothing else in frame:

1. **Roar (0–~3.5s).** The gremlin rears back slightly, jaw/maw ascii
   characters part and widen as if roaring, the `~zzt~` spark glyphs at its
   shoulders flicker/crackle brighter with small jittering static-like
   pulses, eyes (the `(o)` `(o)` goggle lenses) flash brighter for a beat.
   Everything stays built from monospace ASCII characters — no smoothing
   into a "real" creature.
2. **Compose + file the expense report (~3.5–8s).** The gremlin settles back
   down, straightens its bow tie (the `[]` glyph on its chest), a small
   rectangular ASCII-outlined "form" glyph (built from box-drawing style
   dashes/pipes, like `+--------+`, `| [ ] Coffee  $4.50 |`) fades in near
   one of its hands, a `(o)` eye glances down at it, and it gives a small
   satisfied nod/stamp motion — like stamping "APPROVED" — before holding
   still on the last frame.

Tone: deadpan comic, not scary. It's a corporate gremlin that raged for
three seconds and immediately went back to paperwork.

## Style constraints (put these in every prompt)

- Pure ASCII/terminal aesthetic: the creature is made of monospace text
  characters, not a rendered creature — do not let the model "solidify" it
  into a smooth 3D or painterly figure.
- Background stays flat near-black (`#0a0a0b`), no scene, no floor, no
  extra props beyond the described paper/expense-form glyph.
- Static camera, no pans/zooms/parallax — this is a hero loop for a website,
  not cinematic footage.
- Aspect ratio 16:9, source resolution 1920×1080.
- Color: gremlin stays light gray/white-on-black; if any glow/accent color
  appears (e.g. on the sparks), keep it to the site's accent violet
  `#7c7cff`, not fire-orange or neon-green.
- Keep the character count/shape of the ASCII art recognizable throughout —
  it should read as "the same gremlin," just animated, not redrawn.
- Loud/energetic first beat, calm/comedic second beat — do not blend them
  into one continuous motion.

## H3 MAX I2V prompt

```
Animate this ASCII-art image of a crowned brain-gremlin on a flat black
background. Keep the entire creature built from monospace ASCII/terminal
characters throughout — do not let it solidify into a smooth rendered
creature, no added background, no camera movement (static shot), 16:9.

Beat 1 (0-3.5s): the gremlin rears back and roars — its ASCII jaw/maw
characters part and widen, the "~zzt~" spark glyphs at its shoulders
flicker and crackle with small jittering electric pulses, its round
goggle-lens eyes flash brighter.

Beat 2 (3.5-8s): it calms down, straightens its bow tie glyph, a small
ASCII-outlined expense-report form glyph fades in near one hand, it glances
down at it and gives one small satisfied stamping/nod motion, then holds
still on the last frame. Deadpan comic tone. Accent color limited to violet
(#7c7cff) if any glow appears; otherwise keep it grayscale-on-black.
```

## Seedance 2 mini I2V prompt

```
Subject: ASCII-art crowned gremlin, made of monospace text characters, on
solid black background (#0a0a0b), static camera, 16:9, 1080p look.

Action, two beats:
1. (first ~40% of clip) Gremlin rears back and roars: ASCII jaw widens,
   "~zzt~" spark characters at its shoulders crackle/flicker rapidly, eyes
   flash.
2. (remaining ~60%) Gremlin settles, straightens its bow-tie glyph, a small
   ASCII expense-form rectangle fades in near its hand, it looks down and
   gives a single calm stamp/nod, then freezes on the final pose.

Style: terminal/phosphor ASCII aesthetic preserved for the whole clip — no
3D solidifying, no extra background elements, no camera motion. Deadpan
comedic beat between "roaring monster" and "back to paperwork." Keep any
glow/accent color to violet #7c7cff; default to grayscale on black.

Negative: no extra characters entering frame, no scene/floor/props beyond
the described form glyph, no camera pan/zoom/shake, no color scheme change,
no realistic/painterly rendering of the creature.
```

## Delivering the result back

Drop the generated clip in this folder (e.g. `i2v/hero-gremlin-raw.mp4`).
Whatever the source resolution/codec, before it's wired into the site it
needs the same treatment the existing Remotion outputs get (see the repo
README's "Render the videos" section) — encoded to both VP9 `.webm` and
H.264 `.mp4`, plus a `.webp` poster frame — and given **new versioned
filenames**, since Netlify caches versioned media for a year:

- `public/hero-gremlin-v1.webm`
- `public/hero-gremlin-v1.mp4`
- `public/hero-gremlin-v1-poster.webp`

Once that file lands here, the remaining wiring (poster attribute,
`<source>` tags, `prefers-reduced-motion` fallback to the static
`gremlin-wordmark-1080p.png`/ASCII markup already in the hero, and any
`main.js` hero-media handling) is a follow-up step — ping me and I'll do it.
