# 2026-05-03 — Vivante feature, Exhibitions section, U&T rewrite

Session note covering the work prompted by Marjut's email of A4 archive
pages (Vivante story, Neal Street 1981, Kettle's Yard 1985) and her
correction that the previous Urpo & Turpo stills were from a follow-up
series she wasn't involved in.

## What was added

**Vivante (1972)** — featured commercial at the top of `#commercials`,
before the more-commercials list. Includes Marjut's autobiographical
voice on Mamaia 1970, meeting Dick, the Kauppatori cafe encounter with
Lemmikki Nenonen, the line-test storm that taught her to put things on
layers, the Mainos TV ban, the Klaffikilpailu and Zagreb 1972 wins
(beating Preston Blair and Geoff Dunbar), Derek Hill's Times quote, and
the route from Annecy 1973 / Cannes to Halas & Batchelor in autumn 1974.
The single-line Vivante entry was removed from the commercials list to
avoid duplication.

**Exhibitions** — new chapter between Trailers and About, with two
articles:

- *The Animation Show*, Neal Street Gallery, London, April 1981 —
  group show with Vivante and Kellogg artwork.
- *Film & Strip*, Kettle's Yard Gallery, Cambridge, 2 November 1985 —
  two-person show with Christine Roche.

Chapter nav updated to include `#exhibitions`.

**Urpo and Turpo** —
- Replaced the four wrong stills (`UT-1..4.jpg`) with the four Marjut
  sent (`UT-01.jpg`, `UT-02.jpg`, `UT-03.jpg`, `UT-08.jpg`). The wrong
  files are still on disk — not deleted.
- Two new prose paragraphs framed as Marjut's directorial approach:
  one on emphasising the bears' imaginations and filming from a child's
  eye level (laundry → mattresses, blocks → castle, saw + apron →
  hospital); one on pacing the two characters differently in animation
  (Turpo as spontaneous action, Urpo as pensive imagination).
- Added the *Ilta Sanomat* "better than Toy Story" pull quote.
- Reordered figures so each character paragraph sits next to the still
  that demonstrates it.

**About** — Timo Arnall's role updated from "did the digital
compositing on most of the later work" to "was the VFX supervisor on
most of their later work". Per-film credits inside `<details>` still
say "Digital compositing"; not promoted in this pass.

## Image placeholders

All new figures are cropped from low-resolution A4 reference pages
Marjut sent (`Source material/`). They are tracked but expected to be
replaced once Marjut sends the originals. Sizes:

- Vivante panels: ~191×155 px each, cropped from the right column of
  `Vivante-1.jpeg` and `Vivante-2.jpeg` (each 463×640).
- Neal Street 1981 photo: 250×343 px, cropped from the source A4 page.
- Neal Street 1981 artwork: 355×162 px (two Vivante prints from the
  exhibition wall).
- Kettle's Yard 1985 photo: 430×290 px (Marjut and Christine Roche at
  the opening).
- Kettle's Yard 1985 artwork: 450×222 px (three drawings from the show).
- U&T stills: 640×~440 px each.

### Display decision

First pass added a `.is-archive` class that capped the figures at
their natural pixel size so they wouldn't pixelate when stretched to
the 70ch column. Reviewed on the deployed site, the images looked
postage-stamp small and broke the rhythm of the page. Reverted: the
figures now use the default `.film-image img { width: 100% }`, which
displays them at the full column width. They are visibly soft, but
read as full stills rather than thumbnails. To be replaced when the
high-res scans arrive.

## Files touched

- `Design/v1/index.html` — Vivante article, Exhibitions section,
  Urpo & Turpo rewrite, About line update, chapter nav.
- `Design/v1/styles.css` — added then removed the `.is-archive` rule.
- `Design/v1/images/vivante/` — four panels.
- `Design/v1/images/exhibitions/` — four images.
- `Design/v1/images/urpo-turpo/UT-01.jpg`, `UT-02.jpg`, `UT-03.jpg`,
  `UT-08.jpg`.
- `Source material/` — Marjut's A4 reference pages now tracked.

## Commits

- `179f6ee` Add Vivante feature, Exhibitions section, replace U&T stills
- `b2640ff` U&T: Marjut's approach — everyday objects as fantasy worlds, characters
- `1c5fa66` U&T: frame the two paragraphs as Marjut's directorial approach
- `1f36eab` About: Timo was VFX supervisor on the later work
- `638e2e7` U&T: 'emphasise the bears' imaginations' rather than 'take at face value'

## Open items

- Replace placeholder crops with originals when Marjut sends them.
- Decide whether per-film credits should be promoted from "Digital
  compositing" to "VFX supervisor" for the later work.
- Marjut said she has more A4 pages from her archive — expect more
  exhibition / commercial entries to land.
