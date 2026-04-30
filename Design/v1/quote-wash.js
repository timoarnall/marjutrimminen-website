// Watercolour wash behind each .pull quote.
// Real WebGL shader using value-noise fbm. Two colour stops per palette mix
// across organic clouds. Each quote carries a unique seed so its wash is its
// own. Motion is extremely slow — minutes per visible drift.
// Pauses when out of viewport. Respects prefers-reduced-motion.

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palettes in linear-ish RGB. Used under mix-blend-mode: multiply, so
  // values represent the source colour the cream bg gets multiplied by.
  // Lower values = stronger darkening.
  const criticPalettes = [
    { c1: [0.45, 0.45, 0.42], c2: [0.78, 0.78, 0.72] }, // warm grey
    { c1: [0.42, 0.44, 0.46], c2: [0.74, 0.76, 0.78] }, // cool grey
    { c1: [0.48, 0.44, 0.38], c2: [0.80, 0.76, 0.68] }, // sepia
    { c1: [0.44, 0.44, 0.42], c2: [0.76, 0.76, 0.72] }, // neutral
  ];

  const marjutPalettes = [
    { c1: [0.78, 0.40, 0.32], c2: [0.95, 0.78, 0.72] }, // soft red → peach
    { c1: [0.72, 0.36, 0.40], c2: [0.92, 0.74, 0.74] }, // dusty rose
    { c1: [0.82, 0.46, 0.36], c2: [0.96, 0.82, 0.72] }, // peach
    { c1: [0.70, 0.35, 0.34], c2: [0.90, 0.72, 0.68] }, // brick rose
  ];

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_seed;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform float u_alpha;
    varying vec2 v_uv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = v_uv;
      // Use uv directly (range 0..1) for sampling, no aspect correction
      // for the splotch geometry — that lets the splotch follow the
      // canvas shape naturally.

      float t = u_time + u_seed * 23.0;
      vec2 off1 = vec2(t * 0.013, t * 0.009) + u_seed * 5.0;
      vec2 off2 = vec2(-t * 0.011, t * 0.014) + u_seed * 3.7;
      vec2 off3 = vec2(t * 0.008, -t * 0.012) + u_seed * 8.1;

      // Domain-warped fbm
      vec2 q = vec2(fbm(uv * 1.5 + off1), fbm(uv * 1.5 + off2));
      vec2 r = vec2(
        fbm(uv * 2.2 + 4.0 * q + off3),
        fbm(uv * 2.2 + 4.0 * q + vec2(8.3, 2.8) + off1)
      );

      // Splotch from the centre of the canvas. Distance is heavily
      // perturbed by domain-warped noise so the boundary is organic.
      vec2 c = uv - 0.5;
      float dist = length(c);
      dist += (length(r) - 0.7) * 0.35;
      dist += (q.x - 0.5) * 0.15;
      dist += (q.y - 0.5) * 0.15;

      // Soft falloff: the wash extends across most of the canvas and
      // tapers to zero before the edge.
      float radial = 1.0 - smoothstep(0.08, 0.50, dist);
      radial = pow(radial, 1.3);

      // Internal density variation
      float n1 = fbm(uv * 2.2 + off1);
      float n2 = fbm(uv * 4.0 + off2);
      float internal = 0.65 + n1 * 0.45;
      float grain = 0.75 + fbm(uv * 8.0 + r) * 0.4;

      float density = radial * internal * grain;
      density = clamp(density, 0.0, 1.0);

      // Colour varies across the warped field
      float mixT = smoothstep(0.10, 0.80, length(r) + n1 * 0.3);
      vec3 color = mix(u_color2, u_color1, mixT);

      // Premultiplied alpha output: source colour pre-multiplied by alpha
      float alpha = density * u_alpha;
      gl_FragColor = vec4(color * alpha, alpha);
    }
  `;

  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function makeProgram(gl) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  function setup(quote, palette, seed, alpha) {
    const canvas = document.createElement('canvas');
    canvas.className = 'quote-wash';
    quote.insertBefore(canvas, quote.firstChild);

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true });
    if (!gl) {
      // Fallback: simple background colour
      canvas.remove();
      const r = Math.round(palette.c1[0] * 255);
      const g = Math.round(palette.c1[1] * 255);
      const b = Math.round(palette.c1[2] * 255);
      quote.style.background = `rgba(${r},${g},${b},${alpha * 0.5})`;
      return;
    }

    const prog = makeProgram(gl);
    if (!prog) return;

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_position');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uSeed = gl.getUniformLocation(prog, 'u_seed');
    const uColor1 = gl.getUniformLocation(prog, 'u_color1');
    const uColor2 = gl.getUniformLocation(prog, 'u_color2');
    const uAlpha = gl.getUniformLocation(prog, 'u_alpha');

    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(uColor1, palette.c1);
    gl.uniform3fv(uColor2, palette.c2);
    gl.uniform1f(uSeed, seed);
    gl.uniform1f(uAlpha, alpha);

    function resize() {
      // Use the canvas's own laid-out size — CSS extends it beyond the quote.
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    function render(t) {
      gl.uniform1f(uTime, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const startTime = performance.now();
    let visible = true;
    let raf = null;

    function loop() {
      if (!visible) return;
      // Extremely slow: 1.0 unit per ~50 seconds
      const t = (performance.now() - startTime) * 0.00002;
      render(t);
      raf = requestAnimationFrame(loop);
    }

    new ResizeObserver(() => {
      resize();
      render((performance.now() - startTime) * 0.00002);
    }).observe(quote);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          visible = e.isIntersecting;
          if (visible && !reducedMotion) {
            if (raf == null) loop();
          } else if (raf != null) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        }
      }, { rootMargin: '200px' });
      io.observe(quote);
    }

    resize();
    if (reducedMotion) {
      // Single static frame at a stable t per seed
      render(seed * 8.0);
    } else {
      loop();
    }
  }

  function init() {
    const quotes = document.querySelectorAll('.pull');
    let critic_i = 0;
    let marjut_i = 0;
    quotes.forEach((q, i) => {
      const isMarjut = q.classList.contains('voice-marjut');
      const palette = isMarjut
        ? marjutPalettes[(marjut_i++) % marjutPalettes.length]
        : criticPalettes[(critic_i++) % criticPalettes.length];
      const seed = ((i * 0.6180339887) % 1.0) * 10.0;
      // Alphas for premultiplied output under mix-blend-mode: multiply.
      const alpha = isMarjut ? 0.95 : 0.85;
      setup(q, palette, seed, alpha);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
