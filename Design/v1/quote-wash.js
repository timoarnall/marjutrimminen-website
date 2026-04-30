// Watercolour wash behind each .pull quote.
// Real WebGL shader using value-noise fbm. Two colour stops per palette mix
// across organic clouds. Each quote carries a unique seed so its wash is its
// own. Motion is extremely slow — minutes per visible drift.
// Pauses when out of viewport. Respects prefers-reduced-motion.

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palettes in linear-ish RGB. Used under mix-blend-mode: multiply, so
  // values are tuned to multiply with the cream background and produce
  // visible darkening without going too saturated.
  const criticPalettes = [
    { c1: [0.55, 0.55, 0.50], c2: [0.82, 0.82, 0.76] }, // warm grey
    { c1: [0.50, 0.52, 0.54], c2: [0.78, 0.80, 0.82] }, // cool grey
    { c1: [0.58, 0.54, 0.48], c2: [0.84, 0.80, 0.72] }, // sepia
    { c1: [0.52, 0.52, 0.50], c2: [0.80, 0.80, 0.76] }, // neutral
  ];

  const marjutPalettes = [
    { c1: [0.85, 0.50, 0.42], c2: [0.96, 0.82, 0.76] }, // soft red → peach
    { c1: [0.80, 0.45, 0.48], c2: [0.94, 0.78, 0.78] }, // dusty rose
    { c1: [0.88, 0.55, 0.45], c2: [0.97, 0.85, 0.76] }, // peach
    { c1: [0.78, 0.42, 0.40], c2: [0.93, 0.75, 0.72] }, // brick rose
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
      float aspect = u_resolution.x / u_resolution.y;
      vec2 nuv = vec2(uv.x * aspect, uv.y);

      float t = u_time + u_seed * 23.0;
      vec2 off1 = vec2(t * 0.013, t * 0.009) + u_seed * 5.0;
      vec2 off2 = vec2(-t * 0.011, t * 0.014) + u_seed * 3.7;
      vec2 off3 = vec2(t * 0.008, -t * 0.012) + u_seed * 8.1;

      // Domain-warped fbm — the noise itself perturbs sample coordinates
      // for a second fbm. Produces flowy, organic shapes.
      vec2 q = vec2(
        fbm(nuv * 0.85 + off1),
        fbm(nuv * 0.85 + off2)
      );
      vec2 r = vec2(
        fbm(nuv * 1.4 + 4.5 * q + off3),
        fbm(nuv * 1.4 + 4.5 * q + vec2(8.3, 2.8) + off1)
      );

      // Splotch from the centre of the canvas (which is centred on the
      // text box). The radial distance is heavily perturbed by the
      // domain-warped noise so the boundary is organic — not an ellipse.
      vec2 c = uv - 0.5;
      c.x *= aspect;        // aspect-correct so it's not stretched
      c.y *= 1.15;          // slight vertical compression for a wash that
                            //  reads as horizontal rather than circular

      float dist = length(c);
      // Heavy noise perturbation of the distance — the edge irregularity
      // dominates over the geometric circle, so it never reads as one.
      dist += (length(r) - 0.7) * 0.55;
      dist += (q.x - 0.5) * 0.18;
      dist += (q.y - 0.5) * 0.18;

      // Soft falloff from centre. The smoothstep range is tuned so the
      // wash naturally fades to zero well inside the canvas, no edge.
      float radial = 1.0 - smoothstep(0.05, 0.42, dist);
      radial = pow(radial, 1.5);

      // Internal noise gives texture variation within the wash
      float n1 = fbm(nuv * 1.6 + off1);
      float n2 = fbm(nuv * 3.0 + off2);
      float internal = 0.55 + n1 * 0.35 + n2 * 0.25;

      // Paint grain — fine high-frequency noise for paint texture
      float grain = 0.7 + fbm(nuv * 7.0 + r) * 0.5;

      float density = radial * internal * grain;
      density = clamp(density, 0.0, 1.0);

      // Colour varies across the warped field
      float mixT = smoothstep(0.10, 0.80, length(r) + n1 * 0.3);
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
      // Alphas tuned for mix-blend-mode: multiply on the cream bg.
      const alpha = isMarjut ? 0.85 : 0.75;
      setup(q, palette, seed, alpha);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
