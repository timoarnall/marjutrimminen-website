# 2026 — Marjut Rimminen Website

A new website for Marjut Rimminen — Finnish animator and director, based in London, working since 1972.

**Live preview**: https://timoarnall.github.io/marjutrimminen-website/  *(noindex; not crawled by search engines yet)*
**Repository**: https://github.com/timoarnall/marjutrimminen-website
**Status**: Working prototype (`Design/v1/`) — typography and content settled; pull-quote treatment iterating.
**Started**: April 2026

This folder is the project home. Everything needed to understand, edit, deploy or hand the site over to someone else lives inside it.

---

## Folder map

```
2026 — Marjut Rimminen Website/
├── _readme.md              ← you are here
├── biographic-content.md   ← canonical research notes (films, quotes, awards, bio)
├── index.html              ← repository-root redirect into Design/v1/ for GitHub Pages
├── .gitignore
├── Design/                 ← all design and build files
│   ├── _readme.md          ← versioning convention
│   └── v1/                 ← the current prototype
│       ├── _readme.md      ← v1 documentation: typographic system, decisions, structure
│       ├── index.html      ← the site
│       ├── styles.css
│       └── images/
│           └── _readme.md  ← imagery used by v1 with provenance
└── Imagery/                ← curated source archive (master files, references)
    ├── _readme.md
    ├── portrait-studio.jpg     ← Marjut at her desk, colour
    ├── portrait-studio-bw.jpg  ← same shot, B&W (used on the site)
    └── trickyfilms_logo.gif    ← reference only, not used on the new site
```

---

## How to work on it

Local edits → preview → push → live update.

```sh
# Open the prototype in a browser
open Design/v1/index.html

# Edit Design/v1/{index.html, styles.css}
# When happy:
git add -A && git commit -m "..." && git push
```

GitHub Pages builds and serves on every push; the live URL refreshes within ~30–60 seconds. The repository root has a tiny `index.html` that redirects into `Design/v1/`, so the bare URL `https://timoarnall.github.io/marjutrimminen-website/` lands you on the prototype.

The site is plain static HTML/CSS — no build step, no framework, no JS dependencies. It loads Spectral from Google Fonts.

### Versioning

When the design changes substantially enough to be a new direction, copy `Design/v1/` to `Design/v2/` rather than overwriting in place — keeps prior states browsable. The repository-root `index.html` redirect should be updated to point at the latest version.

### Tags

Significant design milestones are git-tagged. Notable so far:

- **`interesting-good-ish`** — the WebGL watercolour-wash version that was abandoned in favour of the current typographic-only treatment. Worth coming back to as a different direction; preserved as a reachable snapshot rather than left in-tree.

`git checkout interesting-good-ish` to inspect; `git checkout main` to return.

---

## Source material

The site's content was assembled from two earlier archives on the Groke drive, plus online research:

- **`/Volumes/Groke/Projects/2001-2003 - Early Freelance Websites/Tricky Films/`** — the full 2002 trickyfilms.com project: PSDs, OmniOutliner content plan, built HTML site, original `.doc` source files for credits, reviews, interviews, and quotes.
- **`/Volumes/Groke/Projects/2008-2011 - Design for Family and Friends/Marjut/`** — a March 2008 marjutrimminen.com attempt that never went past a placeholder page, plus 5 retained trickyfilms.com pages.
- **Online**: Marjut's own Flickr (`flickr.com/photos/marjut/`), Cinenova's archive page, Handle Productions (Urpo & Turpo distributors), the Wikipedia entry for Marjut, IDFA's page for *Learned by Heart*, the Tricky Women Vienna festival catalogue, and Dick Arnall's Guardian obituary. All used material is credited and linked on the site; further provenance is in `biographic-content.md` and `Design/v1/images/_readme.md`.

The 2002 archive's content folders held all the source documents but no actual film stills — only an `mhr.jpg` portrait, the Tricky Films logo, and three layout PSDs. All film stills on the site were sourced from Marjut's own Flickr and a few public sites.

---

## Practical notes for handover

- **Contact email** on the site is `marjut.rimminen@gmail.com`. Confirm with Marjut before any final launch.
- **Marjut's portrait** on the site is a 4096×2399 black-and-white shot of her at her studio desk — it's in `Imagery/portrait-studio-bw.jpg` (master) and `Design/v1/images/portrait-studio-bw.jpg` (site copy). The colour version (`portrait-studio.jpg`) is also kept.
- **Typography**: Spectral from Google Fonts. The intended display face is Jeremy Tankard's *Enigma* (paid licence) — Spectral is a well-matched stand-in. License Enigma before any production launch.
- **Mixbox** code is no longer in the tree. It lives in the `interesting-good-ish` tag if needed. CC BY-NC 4.0; this project is non-commercial so it's compatible if reintroduced.
- **Films missing imagery** on the site (currently text-only): Mixed Feelings, Absolut, The Frog King, The Bridge, Trip to Eternity, plus the Trailers and Idents section. Marjut may have stills offline; otherwise these can be captured from masters or sourced from BFI / festival catalogues.
- **`noindex` meta tag** is set on the prototype so search engines don't crawl it. Remove that when the site is approved for launch.

For the structure of the site, the typographic system, and per-section editorial decisions, see `Design/v1/_readme.md`.
