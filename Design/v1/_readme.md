# v1 — current prototype

Static prototype for marjutrimminen.com. Plain HTML, CSS, no build step, no JavaScript dependencies. One Google Fonts request for Spectral.

## Files

- `index.html` — the whole page. Single long-scroll layout.
- `styles.css` — the typographic system (see below) and all layout rules.
- `images/` — film stills and the studio portrait used on the page. See `images/_readme.md` for provenance and per-folder contents.
- `_readme.md` — this file.

Open `index.html` in any browser to preview locally. The page also serves live at https://timoarnall.github.io/marjutrimminen-website/ (auto-deployed on every push to main).

---

## Page structure

A single page in this order:

1. **Wordmark** — "Marjut Rimminen" set huge in Spectral 700, plus a one-line strapline.
2. **Sticky chapter nav** — links to Films, Commercials, Trailers and idents, About, Contact.
3. **Short films** — twelve articles, ordered by significance and then chronologically:
   - Many Happy Returns (1996)
   - The Stain (1991)
   - Learned by Heart (2007)
   - Some Protection (1987)
   - Urpo and Turpo (1996)
   - I'm not a Feminist, but… (1986)
   - Trip to Eternity (1972)
   - The Bridge (1982)
   - The Frog King (1989)
   - Absolut Marjut Rimminen (1996)
   - Mixed Feelings (1998)
   Each article has: title · year · medium · runtime · synopsis · stills (where available) · pull quotes (critics first, Marjut closing) · collapsible Credits, awards and screenings.
4. **Selected commercials** — chapter intro plus a list of around 40 spots from 1972 onwards, with awards inline. Awards carry medal/cup emojis (🏆 🥇 🥈 🥉 🏅) to communicate their relative weight.
5. **Trailers and idents** — Unicef AIDS Red Ribbon (2001) plus five idents.
6. **About** — bio paragraphs, a portrait of Marjut at her studio desk, retrospectives list, frequent collaborators (linking Dick Arnall's Guardian obituary and Timo Arnall's elasticspace.com), then five longer pull quotes (critics and Marjut, alternating).
7. **Contact** — email and copyright line.

---

## Typographic system

Strict, limited, and consistent across the page:

- **One typeface**: Spectral (Google Fonts). The intended display face is Jeremy Tankard's *Enigma* — Spectral is a near-equivalent stand-in. License Enigma before going to production.
- **One body size**: 18px (1.125rem on desktop, 1rem on small screens).
- **Two heading sizes only**: 2× body for `<h3>` (film titles in the river), 4× body for `<h1>`/`<h2>` (wordmark, chapter titles).
- **Two line-heights**: 1.0 for headings, 1.5 for body.
- **Four weights**: 200 (pull quotes), 300 (subtle alt-titles), 400 (body), 700 (headings).
- **Brightnesses**: `--ink` (full), `--ink-soft` (mid), `--ink-faint` (lightest).
- **Accent**: `--accent` red `#a83a25` (Marjut's voice) and `--accent-soft` `#c78372` (Marjut's cite source).
- **No italics**. No uppercase. `<em>`, `<i>`, `<cite>` are explicitly set to `font-style: normal`.

### Pull-quote treatment

Quotes are typographic only, no decoration:

- Body text in Spectral 200 (extra-light) — sits back from the regular-weight prose, reads as a different texture.
- **Critics** in `--ink-soft` for both body and cite name; source/date in `--ink-faint`.
- **Marjut** in `--accent` for body and cite name; source/date in `--accent-soft`.
- Critics first within each film, Marjut's voice closes the section.

This replaces an earlier WebGL watercolour-wash treatment (preserved as the `interesting-good-ish` tag) which we may revisit later.

---

## Editorial decisions baked in

- **Voice**: Marjut's quotes prominent, clearly distinguished from critics' by colour (red vs warm grey).
- **Order of films**: significance-led for the top six, then chronological for the rest.
- **Treatment**: every film has the same baseline (synopsis + collapsed credits/awards). Major works (The Stain, Some Protection, Many Happy Returns, Learned by Heart) carry more stills and more pull quotes.
- **Awards**: every award listed verbatim from the 2002 archive plus what was found online. Medals sit beside the more significant ones.
- **Tense**: present — Marjut is still teaching and working as an artist.
- **Language**: English only on the surface. Finnish original titles preserved (e.g. *Sydämeen kätketty*, *Silta*).
- **Em-dashes**: removed from prose (used commas, periods, or restructuring instead). Kept inside lists and citations for separator clarity.
- **Numeric dates** standardised to "DD Month YYYY" form. Year ranges use en-dash without spaces (`1972–2001`).

---

## Imagery on the page

See `images/_readme.md` for source provenance, naming, and which films are still text-only.

Films with stills inline: The Stain, Many Happy Returns, Some Protection, Learned by Heart, Urpo and Turpo, I'm not a Feminist but…
Films without imagery yet: Trip to Eternity, The Bridge, The Frog King, Absolut Marjut Rimminen, Mixed Feelings, plus the Trailers and Idents section.

The About section carries a 4096×2399 black-and-white studio portrait of Marjut at her desk.

---

## To experiment with next

- **Imagery for the missing films** — chase masters from Marjut's archive or BFI / festival catalogues.
- **Video links** — embed or link out to Vimeo / Internet Archive / YouTube once known.
- **Anchor highlights** — IntersectionObserver to highlight the current section in the chapter nav.
- **Two-column variant** on desktop — text + image-rail right, for films with multiple stills.
- **Pull-quote treatment** — colour + light weight is the current direction; revisit the watercolour wash (`interesting-good-ish` tag) or try a printed-watercolour reproduction at a later stage.
