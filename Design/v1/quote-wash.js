// Watercolour wash behind each .pull quote.
// WebGL shader using value-noise fbm to carve a self-generating splotch
// shape from where the noise crosses a threshold (no radial mask).
// Colour mixing inside the wash is done via Mixbox, the pigment-based
// colour model from Secret Weapons (mixbox_lerp instead of mix), so two
// pigments blend like real paint. Each quote carries its own pigment
// pair and a unique seed. Motion drifts slowly. Pauses when out of
// viewport. Respects prefers-reduced-motion.
//
// Mixbox is licensed CC BY-NC 4.0 — fine for this personal portfolio.

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Real pigments from Mixbox's reference list. Mixing these via
  // mixbox_lerp produces authentic pigment-style colour transitions.
  const PIG = {
    cadmiumYellow:        [0.996, 0.925, 0.000],
    hansaYellow:          [0.988, 0.827, 0.000],
    cadmiumOrange:        [1.000, 0.412, 0.000],
    cadmiumRed:           [1.000, 0.153, 0.008],
    quinacridoneMagenta:  [0.502, 0.008, 0.180],
    cobaltViolet:         [0.306, 0.000, 0.259],
    ultramarineBlue:      [0.098, 0.000, 0.349],
    cobaltBlue:           [0.000, 0.129, 0.522],
    phthaloBlue:          [0.051, 0.106, 0.267],
    phthaloGreen:         [0.000, 0.235, 0.196],
    permanentGreen:       [0.027, 0.427, 0.086],
    sapGreen:             [0.420, 0.580, 0.016],
    burntSienna:          [0.482, 0.282, 0.000],
  };

  // Two-pigment pairs per quote. mixbox_lerp transitions between them
  // through pigment latent space rather than RGB.
  const criticPalettes = [
    { c1: PIG.burntSienna,    c2: PIG.ultramarineBlue }, // warm/cool grey
    { c1: PIG.burntSienna,    c2: PIG.phthaloGreen },    // earthy grey
    { c1: PIG.cobaltBlue,     c2: PIG.burntSienna },     // soft warm grey
    { c1: PIG.phthaloBlue,    c2: PIG.burntSienna },     // cool sepia
  ];

  const marjutPalettes = [
    { c1: PIG.cadmiumRed,           c2: PIG.hansaYellow },     // red → orange
    { c1: PIG.quinacridoneMagenta,  c2: PIG.cadmiumYellow },   // magenta → orange-pink
    { c1: PIG.cadmiumRed,           c2: PIG.cadmiumOrange },   // bright red wash
    { c1: PIG.quinacridoneMagenta,  c2: PIG.cadmiumOrange },   // coral
  ];

  // Inline mixbox.glsl so we don't need a separate fetch
  const MIXBOX_GLSL = `
#ifndef MIXBOX_INCLUDED
#define MIXBOX_INCLUDED

#define MIXBOX_LUT(UV) texture2D(mixbox_lut, UV)
#define mixbox_latent mat3

vec3 mixbox_eval_polynomial(vec3 c) {
  float c0 = c[0];
  float c1 = c[1];
  float c2 = c[2];
  float c3 = 1.0 - (c0 + c1 + c2);
  float c00 = c0 * c0;
  float c11 = c1 * c1;
  float c22 = c2 * c2;
  float c01 = c0 * c1;
  float c02 = c0 * c2;
  float c12 = c1 * c2;
  float c33 = c3 * c3;
  return (c0*c00) * vec3(+0.07717053, +0.02826978, +0.24832992) +
         (c1*c11) * vec3(+0.95912302, +0.80256528, +0.03561839) +
         (c2*c22) * vec3(+0.74683774, +0.04868586, +0.00000000) +
         (c3*c33) * vec3(+0.99518138, +0.99978149, +0.99704802) +
         (c00*c1) * vec3(+0.04819146, +0.83363781, +0.32515377) +
         (c01*c1) * vec3(-0.68146950, +1.46107803, +1.06980936) +
         (c00*c2) * vec3(+0.27058419, -0.15324870, +1.98735057) +
         (c02*c2) * vec3(+0.80478189, +0.67093710, +0.18424500) +
         (c00*c3) * vec3(-0.35031003, +1.37855826, +3.68865000) +
         (c0*c33) * vec3(+1.05128046, +1.97815239, +2.82989073) +
         (c11*c2) * vec3(+3.21607125, +0.81270228, +1.03384539) +
         (c1*c22) * vec3(+2.78893374, +0.41565549, -0.04487295) +
         (c11*c3) * vec3(+3.02162577, +2.55374103, +0.32766114) +
         (c1*c33) * vec3(+2.95124691, +2.81201112, +1.17578442) +
         (c22*c3) * vec3(+2.82677043, +0.79933038, +1.81715262) +
         (c2*c33) * vec3(+2.99691099, +1.22593053, +1.80653661) +
         (c01*c2) * vec3(+1.87394106, +2.05027182, -0.29835996) +
         (c01*c3) * vec3(+2.56609566, +7.03428198, +0.62575374) +
         (c02*c3) * vec3(+4.08329484, -1.40408358, +2.14995522) +
         (c12*c3) * vec3(+6.00078678, +2.55552042, +1.90739502);
}

mixbox_latent mixbox_rgb_to_latent(vec3 rgb) {
  rgb = clamp(rgb, 0.0, 1.0);
  float x = rgb.r * 63.0;
  float y = rgb.g * 63.0;
  float z = rgb.b * 63.0;
  float iz = floor(z);
  float x0 = mod(iz, 8.0) * 64.0;
  float y0 = floor(iz / 8.0) * 64.0;
  float x1 = mod(iz + 1.0, 8.0) * 64.0;
  float y1 = floor((iz + 1.0) / 8.0) * 64.0;
  vec2 uv0 = vec2(x0 + x + 0.5, y0 + y + 0.5) / 512.0;
  vec2 uv1 = vec2(x1 + x + 0.5, y1 + y + 0.5) / 512.0;
  if (MIXBOX_LUT(vec2(0.5, 0.5) / 512.0).b < 0.1) {
    uv0.y = 1.0 - uv0.y;
    uv1.y = 1.0 - uv1.y;
  }
  vec3 c = mix(MIXBOX_LUT(uv0).rgb, MIXBOX_LUT(uv1).rgb, z - iz);
  return mixbox_latent(c, rgb - mixbox_eval_polynomial(c), vec3(0.0));
}

vec3 mixbox_latent_to_rgb(mixbox_latent latent) {
  return clamp(mixbox_eval_polynomial(latent[0]) + latent[1], 0.0, 1.0);
}

vec3 mixbox_lerp(vec3 color1, vec3 color2, float t) {
  return mixbox_latent_to_rgb((1.0-t)*mixbox_rgb_to_latent(color1) + t*mixbox_rgb_to_latent(color2));
}

#endif
`;

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    uniform sampler2D mixbox_lut;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_seed;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform float u_alpha;
    varying vec2 v_uv;

    ${MIXBOX_GLSL}

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

      // Domain-warped fbm — flowy organic shapes
      vec2 q = vec2(
        fbm(nuv * 0.85 + off1),
        fbm(nuv * 0.85 + off2)
      );
      vec2 r = vec2(
        fbm(nuv * 1.4 + 4.5 * q + off3),
        fbm(nuv * 1.4 + 4.5 * q + vec2(8.3, 2.8) + off1)
      );

      // The shape — anisotropic horizontal-ish strokes thresholded
      vec2 strokeUV = nuv * vec2(0.85, 2.4) + 1.5 * r;
      float stroke = fbm(strokeUV);

      vec2 strokeUV2 = nuv * vec2(1.3, 3.0) + 2.0 * q + off2;
      float stroke2 = fbm(strokeUV2);

      float grain = fbm(nuv * 6.0 + r) * 0.5 + 0.5;

      float washA = smoothstep(0.40, 0.78, stroke);
      float washB = smoothstep(0.46, 0.72, stroke2) * 0.55;
      float density = (washA + washB) * (0.55 + grain * 0.45);
      density = clamp(density, 0.0, 1.0);

      // Pigment mix via Mixbox (real pigment-style blending) instead
      // of straight RGB mix. The mix factor varies across the wash.
      float mixT = smoothstep(0.10, 0.85, length(r) + stroke * 0.3);
      vec3 color = mixbox_lerp(u_color2, u_color1, mixT);

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

  // Single shared LUT image — loaded once, uploaded as a texture into
  // each WebGL context that needs it.
  const lutImage = new Image();
  let lutReady = false;
  const lutCallbacks = [];
  lutImage.onload = () => {
    lutReady = true;
    for (const cb of lutCallbacks) cb();
    lutCallbacks.length = 0;
  };
  lutImage.onerror = () => {
    console.error('Failed to load mixbox LUT — wash will not render correctly');
  };
  lutImage.src = 'mixbox_lut.png';

  function setup(quote, palette, seed, alpha) {
    const begin = () => init(quote, palette, seed, alpha);
    if (lutReady) begin();
    else lutCallbacks.push(begin);
  }

  function init(quote, palette, seed, alpha) {
    const canvas = document.createElement('canvas');
    canvas.className = 'quote-wash';
    quote.insertBefore(canvas, quote.firstChild);

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true, alpha: true });
    if (!gl) {
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
    const uMixboxLut = gl.getUniformLocation(prog, 'mixbox_lut');

    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Upload Mixbox LUT to texture unit 0
    const lutTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lutTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lutImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uMixboxLut, 0);

    gl.uniform3fv(uColor1, palette.c1);
    gl.uniform3fv(uColor2, palette.c2);
    gl.uniform1f(uSeed, seed);
    gl.uniform1f(uAlpha, alpha);

    function resize() {
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
      render(seed * 8.0);
    } else {
      loop();
    }
  }

  function init_all() {
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
    document.addEventListener('DOMContentLoaded', init_all);
  } else {
    init_all();
  }
})();
