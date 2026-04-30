# v1 — first prototype

Static prototype for marjutrimminen.com.

## Files

- `index.html` — single long-scroll page. Featured (The Stain) → 12 short films in reverse chronology → commercials → idents → about → contact.
- `styles.css` — typographic system (see below).
- `flicker.js` — abstract 12fps stop-frame animation in a 120px square top-right. Solid colour shapes appearing for 2–3 frames, then 3–10 empty frames, then next. Click to pause. Respects `prefers-reduced-motion`.
- `images/` — film stills and assets.

## Typographic system

Strict and limited:

- **One typeface**: Spectral (Google Fonts).
- **One body size**: 18px (1.125rem).
- **Two heading sizes**: 2× body for `<h3>` (film titles in the river), 4× body for `<h1>`/`<h2>` (wordmark, chapter titles, featured film title).
- **Two line-heights**: 1.0 for headings, 1.5 for body.
- **Three weights**: 300 (subtle alt-titles), 400 (body), 700 (headings).
- **Three brightnesses**: `--ink` (full), `--ink-soft` (mid), `--ink-faint` (lightest).
- **Accent**: a single red used for Marjut's pull-quotes, contact link, and chapter-nav hovers.
- **No italics**. No uppercase. `<em>`, `<i>`, `<cite>` are all explicitly set to `font-style: normal`.

## Decisions baked in

- **Voice**: Marjut's quotes get a red accent rule and a soft tint behind them; critics get a grey rule. Each clearly attributed (name + source/date).
- **Order**: featured (The Stain) at top, then all films reverse chronologically (2007 → 1972). The Stain repeats in its 1991 slot in the river with full credits.
- **Treatment**: every film gets synopsis + collapsible credits/awards. Major works (Learned by Heart, The Stain, Some Protection, Many Happy Returns) have multiple stills, multiple pull quotes, and `details open` by default.
- **Awards**: every award listed verbatim from the 2002 archive plus what we found online.
- **Tense**: present — she's still a working artist and teacher.
- **Language**: English only on the surface.
- **Idents**: kept, as a brief footer chapter.
- **Commercials**: separate chapter, ~40 selected, awards inline.

## New film added: Learned by Heart (2007)

Discovered via Marjut's Flickr while gathering imagery — wasn't in the 2002 archive. 29-minute documentary animation with Päivi Takala, premiered at IDFA 2007. Now sits at the top of the chronological river.

## Imagery

Stills are sourced from Marjut's own Flickr (`flickr.com/photos/marjut/`), Cinenova, Handle Productions (Urpo & Turpo distributors), and one or two other public sources. All images on the page are above 640px on at least one side.

- `images/some-protection/` — 9 stills (1024×768) plus 2 reattributed from "the-stain"/"learned-by-heart" folders that were in fact Some Protection
- `images/the-stain/` — 2 stills (puppet table scene; drawn pram scene)
- `images/many-happy-returns/` — 2 stills
- `images/learned-by-heart/` — ~17 stills (one was a Some Protection misattribution, now moved)
- `images/urpo-turpo/` — 4 stills from Handle Productions (1024×~740)
- `images/not-feminist/` — 1 still from Cinenova (800×613)

Provenance note: Marjut's Flickr tagged two images as "The Stain10" and "Learned by Heart 1_07" but on inspection both depict the orange-haired Josie O'Dwyer and HMP gates from *Some Protection*. Reattributed in this folder with descriptive filenames (`sp-prison-cell.jpg`, `sp-hmp-gates.jpg`).

Films *still without imagery* on the site: Mixed Feelings, Absolut, The Frog King, The Bridge, Trip to Eternity, plus the Trailers and idents section. Marjut may have higher-resolution stills offline.

## To experiment with next

- **Flicker variations** — try larger / multiple / scroll-driven density.
- **More imagery** — chase stills for the eight films currently text-only.
- **Layout** — try a two-column variant (text + image right) on desktop.
- **Anchor highlights** — IntersectionObserver to highlight the current section in the chapter nav.
- **Video** — link out to Vimeo / Internet Archive / YouTube per film once known.
