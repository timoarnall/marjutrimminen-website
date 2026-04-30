// Watercolour wash behind each .pull quote.
// One div per quote, with a soft radial gradient background distorted by
// an SVG feTurbulence + feDisplacementMap filter and composited via
// mix-blend-mode: multiply. Each quote gets a different palette and a
// different filter (cycling through 6) so adjacent quotes look distinct.
// Filters animate their seed continuously, so the wash shape drifts
// slowly. No WebGL — works for every quote on the page, no context
// limits.

(() => {
  // Colours represent the source value the cream bg is multiplied by.
  // Higher (lighter) values = subtler darkening on cream.
  const criticPalettes = [
    ['#c7c7bd', '#ebebe0'],
    ['#c2c4c7', '#e8eaec'],
    ['#cbc4b3', '#edeada'],
    ['#c5c5c1', '#ebebe6'],
  ];

  const marjutPalettes = [
    ['#ebad94', '#fae0d1'],
    ['#e6a8a8', '#f7dcdc'],
    ['#f0b89e', '#faddd1'],
    ['#e09e99', '#f5d6cc'],
  ];

  const filterCount = 6;

  function init() {
    const quotes = document.querySelectorAll('.pull');
    let critic_i = 0;
    let marjut_i = 0;

    quotes.forEach((q, i) => {
      const isMarjut = q.classList.contains('voice-marjut');
      const palette = isMarjut
        ? marjutPalettes[(marjut_i++) % marjutPalettes.length]
        : criticPalettes[(critic_i++) % criticPalettes.length];

      const wash = document.createElement('div');
      wash.className = 'quote-wash';
      wash.setAttribute('aria-hidden', 'true');
      wash.style.setProperty('--wash-c1', palette[0]);
      wash.style.setProperty('--wash-c2', palette[1]);
      wash.style.setProperty('--wash-filter', `url(#wash-${i % filterCount})`);

      q.insertBefore(wash, q.firstChild);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
