// Watercolour wash behind each .pull quote.
// Real WebGL shader using value-noise fbm. Two colour stops per palette mix
// across organic clouds. Each quote carries a unique seed so its wash is its
// own. Motion is extremely slow — minutes per visible drift.
// Pauses when out of viewport. Respects prefers-reduced-motion.

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palettes in linear-ish RGB. Alpha is applied per-fragment in the shader.
  // c1 is the deeper hue, c2 the lighter — fbm mixes between them.
  const criticPalettes = [
    { c1: [0.42, 0.42, 0.38], c2: [0.66, 0.66, 0.60] }, // warm grey
    { c1: [0.40, 0.42, 0.44], c2: [0.62, 0.64, 0.66] }, // cool grey
    { c1: [0.46, 0.43, 0.38], c2: [0.70, 0.66, 0.58] }, // sepia grey
    { c1: [0.38, 0.40, 0.40], c2: [0.60, 0.62, 0.60] }, // neutral grey
  ];

  const marjutPalettes = [
    { c1: [0.78, 0.42, 0.32], c2: [0.95, 0.78, 0.70] }, // soft red → peach
    { c1: [0.72, 0.38, 0.40], c2: [0.94, 0.74, 0.74] }, // dusty rose
    { c1: [0.82, 0.48, 0.38], c2: [0.96, 0.82, 0.72] }, // peach
    { c1: [0.70, 0.34, 0.30], c2: [0.92, 0.70, 0.66] }, // brick rose
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
      uv.x *= u_resolution.x / u_resolution.y;

      float t = u_time + u_seed * 23.0;
      vec2 offset1 = vec2(t * 0.013, t * 0.009);
      vec2 offset2 = vec2(-t * 0.011 + u_seed, t * 0.014);

      float n1 = fbm(uv * 1.4 + offset1 + u_seed * 7.3);
      float n2 = fbm(uv * 2.6 + offset2);

      // density: clouds where both layers reinforce each other
      float density = pow(clamp(n1 * 1.3 + n2 * 0.6 - 0.15, 0.0, 1.0), 1.4);

      // colour mix from soft to deep based on inverse density
      float mixT = smoothstep(0.05, 0.85, n1 * 0.6 + n2 * 0.4);
      vec3 color = mix(u_color2, u_color1, mixT);

      float alpha = density * u_alpha;
      gl_FragColor = vec4(color, alpha);
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

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true, alpha: true });
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
      const rect = quote.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
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
      const alpha = isMarjut ? 0.42 : 0.32;
      setup(q, palette, seed, alpha);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
