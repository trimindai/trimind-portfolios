/* ============================================================================
   keyboard.js — the interactive 3D split-ergo tech keyboard, hosted in the
   PARENT page (not an iframe). Renders into a fixed full-screen
   <canvas id="kbd-stage"> that composites over the page (alpha:true). Ported
   from public/demo/developer/stack/index.html: same scene, materials, keycaps,
   trackball ("Maya" badge), synth switch sounds, idle spin, and drag-to-rotate.

   Crucial difference vs the iframe: the page wheel/scroll is NEVER trapped.
   - No wheel listener, no preventDefault on wheel -> the mouse wheel always
     scrolls the PAGE.
   - On touch, a rotate-drag only starts if the pointer actually hit the
     keyboard/trackball/a keycap; a touch on empty space scrolls the page.

   Vanilla Three.js (global THREE, vendored r128). Hardening (pause on hidden /
   webglcontextlost guards, first-frame "kbd-live" signal) mirrors orb.js.
   ============================================================================ */
(function () {
  "use strict";
  if (!window.THREE) return;
  var canvas = document.getElementById("kbd-stage");
  if (!canvas) return;

  /* Resolve the keycap-icon folder as an ABSOLUTE URL derived from this
     script's own src. The page is served at the extensionless clean URL
     "/demo/developer" (a Vercel rewrite), so the document base is "/demo/" —
     a document-relative icon path would 404 there and every cap would fall
     back to a text label. Deriving from currentScript.src is mount-agnostic. */
  var ICON_BASE = (function () {
    try {
      var s = document.currentScript;
      if (s && s.src) return new URL("stack/icons/", s.src).href;
    } catch (e) {}
    return "/demo/developer/stack/icons/";
  })();

  /* ============================================================
     CONFIG — swap a logo = change `slug` (any simple-icons slug).
     Caps fill sockets left->right; layout = 4 rows x columns per hand.
     ============================================================ */
  var SKILLS = [
    /* col 0 — frontend core — real brand shades */
    { slug: "react",             label: "React",      tag: "component UIs, fast",           color: "#61dafb" },
    { slug: "nextdotjs",         label: "Next.js",    tag: "SSR + the app router",          color: "#000000" },
    { slug: "typescript",        label: "TypeScript", tag: "types end to end",              color: "#3178c6" },
    { slug: "javascript",        label: "JavaScript", tag: "the language of the web",       color: "#f7df1e" },
    /* col 1 — frontend craft */
    { slug: "tailwindcss",       label: "Tailwind",   tag: "utility-first styling",         color: "#06b6d4" },
    { slug: "threedotjs",        label: "Three.js",   tag: "real-time 3D in the browser",   color: "#000000" },
    { slug: "webgl",             label: "WebGL",      tag: "GPU-driven visuals",            color: "#990000" },
    { slug: "framer",            label: "Framer",     tag: "motion that feels alive",       color: "#0055ff" },
    /* col 2 — backend */
    { slug: "nodedotjs",         label: "Node.js",    tag: "event-driven services",         color: "#5fa04e" },
    { slug: "python",            label: "Python",     tag: "automation + data tooling",     color: "#3776ab" },
    { slug: "graphql",           label: "GraphQL",    tag: "ask for exactly what you need", color: "#e10098" },
    { slug: "postgresql",        label: "PostgreSQL", tag: "relational, indexed, tuned",    color: "#4169e1" },
    /* col 3 — data + cloud */
    { slug: "redis",             label: "Redis",      tag: "in-memory cache + pub/sub",     color: "#ff4438" },
    { slug: "amazonwebservices", label: "AWS",        tag: "cloud infra + serverless",      color: "#ff9900" },
    { slug: "docker",            label: "Docker",     tag: "reproducible builds",           color: "#2496ed" },
    { slug: "kubernetes",        label: "Kubernetes", tag: "orchestrate + scale",           color: "#326ce5" },
    /* col 4 — ship + craft */
    { slug: "githubactions",     label: "Actions",    tag: "ship on every push",            color: "#2088ff" },
    { slug: "git",               label: "Git",        tag: "history you can trust",         color: "#f05032" },
    { slug: "figma",             label: "Figma",      tag: "design-to-dev handoff",         color: "#f24e1e" },
    { slug: null,                label: "A11y",       tag: "usable by everyone",            color: "#4b5056" }
  ];
  var DARK = 1.0; // 1.0 = true brand shades

  /* ---- renderer / scene / camera (orb.js Phase-6 guard pattern) ---- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { canvas.style.display = "none"; return; }
  if (!renderer) { canvas.style.display = "none"; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);

  var pmrem = new THREE.PMREMGenerator(renderer);
  (function buildEnv() {
    var c = document.createElement("canvas"); c.width = 512; c.height = 256;
    var g = c.getContext("2d");
    /* soft-daylight dome: bright sky overhead grading to a soft floor (never black)
       so the metallic body + trackball reflect clean light, not a dark studio */
    var grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#e7ecf3"); grad.addColorStop(0.42, "#c4cdda"); grad.addColorStop(0.78, "#97a4b7"); grad.addColorStop(1, "#6f7a8a");
    g.fillStyle = grad; g.fillRect(0, 0, 512, 256);
    /* two soft overhead "softbox" highlights for crisp speculars on caps + trackball */
    g.globalAlpha = 0.85; g.fillStyle = "#ffffff";
    g.beginPath(); g.ellipse(150, 48, 58, 16, 0, 0, 7); g.fill();
    g.globalAlpha = 0.45; g.beginPath(); g.ellipse(380, 76, 78, 11, 0, 0, 7); g.fill();
    g.globalAlpha = 1;
    var tex = new THREE.Texture(c); tex.needsUpdate = true; tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmrem.fromEquirectangular(tex).texture;
  })();

  scene.add(new THREE.AmbientLight(0xffffff, 0.42));
  var keyL = new THREE.DirectionalLight(0xffffff, 0.66); keyL.position.set(6, 14, 9); scene.add(keyL);
  var rimL = new THREE.DirectionalLight(0xdfe6f0, 0.42); rimL.position.set(-9, 6, -6); scene.add(rimL);
  var fillL = new THREE.PointLight(0xffffff, 0.3, 70); fillL.position.set(2, 9, 8); scene.add(fillL);

  (function () {
    var g = new THREE.BufferGeometry(); var n = 700; var p = new Float32Array(n * 3);
    for (var i = 0; i < n * 3; i++) p[i] = (Math.random() - 0.5) * 100;
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8b99ad, size: 0.05, transparent: true, opacity: 0.28 })));
  })();

  function roundedBoxGeo(w, d, h, r) {
    var shape = new THREE.Shape();
    var x = -w / 2, y = -d / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + d - r); shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    shape.lineTo(x + r, y + d); shape.quadraticCurveTo(x, y + d, x, y + d - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    var bevel = Math.min(0.08, h * 0.26);
    var geo = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.01, h - bevel * 2), bevelEnabled: true,
      bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, steps: 1, curveSegments: 8
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    var bb = geo.boundingBox;
    geo.translate(0, -(bb.min.y + bb.max.y) / 2, 0);
    return geo;
  }
  function taper(geo, topScale) {
    geo.computeBoundingBox();
    var mn = geo.boundingBox.min.y, mx = geo.boundingBox.max.y, h = mx - mn;
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var tt = (pos.getY(i) - mn) / h;
      var s = 1 - (1 - topScale) * tt;
      pos.setX(i, pos.getX(i) * s); pos.setZ(i, pos.getZ(i) * s);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
    return geo;
  }

  /* dark glyphs on light caps, white glyphs on dark caps — keeps logos legible across the muted palette */
  function inkFor(hex) {
    var c = new THREE.Color(hex); var lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    return lum > 0.55 ? "#1b2230" : "#ffffff";
  }
  function makeTextTexture(label, ink, apply) {
    var S = 256; var cv = document.createElement("canvas"); cv.width = cv.height = S;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = ink || "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var txt = label.toUpperCase();
    var fs = 130; ctx.font = "900 " + fs + "px -apple-system, Segoe UI, sans-serif";
    while (ctx.measureText(txt).width > S * 0.84 && fs > 26) { fs -= 6; ctx.font = "900 " + fs + "px -apple-system, Segoe UI, sans-serif"; }
    ctx.fillText(txt, S / 2, S / 2);
    var tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8; tex.encoding = THREE.sRGBEncoding; apply(tex);
  }
  function makeLogoTexture(skill, apply) {
    var S = 256;
    var cv = document.createElement("canvas"); cv.width = cv.height = S;
    var ctx = cv.getContext("2d");
    var ink = inkFor(skill.color);
    function fallback() {
      ctx.clearRect(0, 0, S, S); ctx.fillStyle = ink;
      ctx.font = "900 116px -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(skill.label.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase(), S / 2, S / 2);
      var tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8; tex.encoding = THREE.sRGBEncoding; apply(tex);
    }
    var img = new Image(); img.crossOrigin = "anonymous";
    img.onload = function () {
      try {
        ctx.clearRect(0, 0, S, S);
        var pad = S * 0.1;
        ctx.drawImage(img, pad, pad, S - 2 * pad, S - 2 * pad);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = ink; ctx.fillRect(0, 0, S, S);
        ctx.globalCompositeOperation = "source-over";
        ctx.getImageData(0, 0, 1, 1);
        var tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8; tex.encoding = THREE.sRGBEncoding; apply(tex);
      } catch (e) { fallback(); }
    };
    img.onerror = fallback;
    img.src = ICON_BASE + skill.slug + ".svg";
  }

  /* ---------- presets ---------- */
  var KW = 0.92, KH = 0.72, TOP = 0.72;
  var capGeo = taper(roundedBoxGeo(KW, KW, KH, 0.11), TOP);
  var TOPW = KW * TOP;
  var switchGeo = roundedBoxGeo(KW * 0.78, KW * 0.78, 0.22, 0.06);
  var switchMat = new THREE.MeshStandardMaterial({ color: 0x111216, metalness: 0.3, roughness: 0.7 });
  /* matte + low env, and a DARKENED albedo: the bright daylight rig (~2.4x) lifts a raw
     #4b5056 to light grey, so we feed a darker base that RENDERS as Davy #4b5056 */
  var caseMat = new THREE.MeshStandardMaterial({ color: 0x24282d, metalness: 0.04, roughness: 0.72, envMapIntensity: 0.1 });

  var caps = [];
  var board = new THREE.Group();
  board.rotation.x = -0.16;          /* near-flat: read the whole grid from a 3/4 angle */
  scene.add(board);

  /* soft contact shadow so the keyboard sits on the light band instead of floating */
  (function groundShadow() {
    var S = 256; var cv = document.createElement("canvas"); cv.width = cv.height = S;
    var c = cv.getContext("2d");
    var rg = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    rg.addColorStop(0, "rgba(40,46,56,0.34)");
    rg.addColorStop(0.55, "rgba(40,46,56,0.16)");
    rg.addColorStop(1, "rgba(40,46,56,0)");
    c.fillStyle = rg; c.fillRect(0, 0, S, S);
    var tex = new THREE.CanvasTexture(cv);
    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 11),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.62, 1.4);
    scene.add(shadow);
  })();

  var skillIdx = 0;

  /* ---------- geometry layout ---------- */
  var ROWS_H = 4;                                   /* 4 vertical keycaps (fixed) */
  var COLS_H = Math.max(1, Math.ceil(SKILLS.length / ROWS_H)); /* horizontal keycaps scale with the stack */
  var CG = 1.0, RG = 1.0;

  function placeCap(parent, x, z) {
    var sw = new THREE.Mesh(switchGeo, switchMat); sw.position.set(x, 0, z); parent.add(sw);
    if (skillIdx < SKILLS.length) {
      var skill = SKILLS[skillIdx++];
      var cap = new THREE.Group(); cap.position.set(x, 0, z);
      var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(skill.color).multiplyScalar(DARK), metalness: 0.04, roughness: 0.5, envMapIntensity: 0.25, emissive: new THREE.Color(skill.color).multiplyScalar(DARK), emissiveIntensity: 0.0 });
      var body = new THREE.Mesh(capGeo, mat); body.position.y = 0.18 + KH / 2; cap.add(body);
      var lm = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      var lg = new THREE.Mesh(new THREE.PlaneGeometry(TOPW * 0.84, TOPW * 0.84), lm); lg.rotation.x = -Math.PI / 2; lg.position.y = 0.18 + KH + 0.012; cap.add(lg);
      if (skill.slug) makeLogoTexture(skill, function (t) { lm.map = t; lm.opacity = 1; lm.needsUpdate = true; });
      else makeTextTexture(skill.label, inkFor(skill.color), function (t) { lm.map = t; lm.opacity = 1; lm.needsUpdate = true; });
      cap.userData = { skill: skill, mat: mat, baseY: 0, vy: 0 }; body.userData.cap = cap; caps.push(cap); parent.add(cap);
    }
  }

  function buildHalf(side) {
    var half = new THREE.Group();
    var SKEW = 0;   /* straight grid, no slope */
    var pts = [];

    /* 4-row grid, columns = stack size, fully filled with keycaps */
    for (var col = 0; col < COLS_H; col++) {
      var bx = (col - (COLS_H - 1) / 2) * CG;
      var dz = side * (col - (COLS_H - 1) / 2) * SKEW;
      for (var row = 0; row < ROWS_H; row++) {
        var x = bx * side, z = dz + (row - (ROWS_H - 1) / 2) * RG;
        placeCap(half, x, z); pts.push([x, z]);
      }
    }

    /* case slab under the keycaps */
    var minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    pts.forEach(function (pair) { var x = pair[0], z = pair[1]; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); });
    var cx = (minX + maxX) / 2;
    var block = new THREE.Mesh(roundedBoxGeo((maxX - minX) + KW + 0.5, (maxZ - minZ) + KW + 0.5, 0.5, 0.45), caseMat);
    block.position.set(cx, -0.2, (minZ + maxZ) / 2); half.add(block);

    /* BIG trackball, centered, on the round housing just under the keycaps */
    var R_BALL = 0.8;
    var ballZ = maxZ + 2.25;
    var housing = new THREE.Mesh(new THREE.CylinderGeometry(R_BALL + 0.55, R_BALL + 0.7, 0.6, 56), caseMat);
    housing.position.set(cx, -0.16, ballZ); half.add(housing);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(R_BALL + 0.12, 0.13, 18, 56), caseMat);
    ring.rotation.x = Math.PI / 2; ring.position.set(cx, 0.18, ballZ); half.add(ring);
    var tb = new THREE.Mesh(new THREE.SphereGeometry(R_BALL, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x6d99ce, metalness: 0.0, roughness: 0.62, envMapIntensity: 0.12 }));
    tb.position.set(cx, 0.5, ballZ);
    /* "Maya" label on trackball */
    var mCvs = document.createElement("canvas");
    mCvs.width = 256; mCvs.height = 256;
    var mCtx = mCvs.getContext("2d");
    mCtx.fillStyle = "#2f5588"; mCtx.fillRect(0, 0, 256, 256);
    mCtx.fillStyle = "#eef1f5";
    mCtx.font = "bold 72px sans-serif";
    mCtx.textAlign = "center"; mCtx.textBaseline = "middle";
    mCtx.fillText("Maya", 128, 128);
    mCtx.strokeStyle = "#eef1f5"; mCtx.lineWidth = 4;
    mCtx.beginPath(); mCtx.arc(128, 128, 110, 0, Math.PI * 2); mCtx.stroke();
    var mTex = new THREE.CanvasTexture(mCvs);
    var mBadge = new THREE.Mesh(new THREE.CircleGeometry(0.36, 48),
      new THREE.MeshBasicMaterial({ map: mTex, transparent: true }));
    /* seat the badge ON the sphere surface (not inside it) facing up-and-out toward the camera */
    var bA = 0.62, bR = R_BALL * 1.03;
    mBadge.position.set(0, bR * Math.sin(bA), bR * Math.cos(bA)); mBadge.rotation.x = -bA;
    tb.add(mBadge);
    half.add(tb);

    half.position.set(0, 0, 0);
    half.rotation.y = 0;
    half.rotation.z = 0;
    return { half: half, trackball: tb };
  }

  var R = buildHalf(+1);
  board.add(R.half);
  var trackball = R.trackball;

  var dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff4d6d }));
  dot.visible = false; scene.add(dot);

  /* ---------- keyboard sounds (Web Audio, synthesized switch profiles) ---------- */
  /* No in-page HUD: a single default profile (index 0), and ALL playback is gated
     behind the shared global mute flag window.__demoSound (unset/true => sound on). */
  var actx = null, profileIdx = 0;
  var PROFILES = [
    { name: "THOCK",      dn: { d: 0.05, f: 1900, q: 0.7, g: 0.55 }, th: { a: 185, b: 82,  g: 0.42, d: 0.10 }, up: { d: 0.028, f: 2700, q: 0.9, g: 0.28 }, click: false },
    { name: "CLICKY",     dn: { d: 0.04, f: 3400, q: 1.1, g: 0.55 }, th: { a: 260, b: 150, g: 0.16, d: 0.05 }, up: { d: 0.03,  f: 4400, q: 1.2, g: 0.40 }, click: true  },
    { name: "TACTILE",    dn: { d: 0.045, f: 2400, q: 0.9, g: 0.5 }, th: { a: 205, b: 110, g: 0.30, d: 0.07 }, up: { d: 0.03,  f: 3100, q: 1.0, g: 0.30 }, click: false },
    { name: "MARBLE",     dn: { d: 0.035, f: 4100, q: 1.2, g: 0.45 }, th: { a: 320, b: 185, g: 0.16, d: 0.05 }, up: { d: 0.025, f: 5200, q: 1.3, g: 0.30 }, click: false },
    { name: "TYPEWRITER", dn: { d: 0.06, f: 1600, q: 0.6, g: 0.62 }, th: { a: 160, b: 70,  g: 0.5, d: 0.12 }, up: { d: 0.05,  f: 2200, q: 0.8, g: 0.42 }, click: true  },
    { name: "MIX",        dn: { d: 0.04, f: 2500, q: 0.8, g: 0.35 }, th: { a: 200, b: 100, g: 0.35, d: 0.08 }, up: { d: 0.03,  f: 3500, q: 1.0, g: 0.25 }, click: false }
  ];
  var _audioUnlocked = false;
  function ac() {
    if (!actx) { var C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); }
    if (actx && actx.state === "suspended") actx.resume();
    /* iOS/Safari: a silent buffer played inside the first touch gesture unlocks Web Audio */
    if (actx && !_audioUnlocked) { _audioUnlocked = true; try { var b = actx.createBuffer(1, 1, 22050); var s = actx.createBufferSource(); s.buffer = b; s.connect(actx.destination); s.start(0); } catch (e) {} }
    return actx;
  }
  function burst(dur, freq, q, gain, t) {
    var a = ac(); if (!a) return;
    var n = Math.floor(a.sampleRate * dur);
    var buf = a.createBuffer(1, n, a.sampleRate); var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) { d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.2); }
    var src = a.createBufferSource(); src.buffer = buf;
    var bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = q;
    var g = a.createGain(); g.gain.value = gain;
    src.connect(bp); bp.connect(g); g.connect(a.destination); src.start(t);
  }
  function thump(a0, b0, gain, dur, t) {
    var a = ac(); if (!a) return;
    var o = a.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(a0, t); o.frequency.exponentialRampToValueAtTime(b0, t + dur * 0.6);
    var g = a.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  /* unified mute: gate ALL playback behind the shared global flag */
  function playDown(scale) {
    if (window.__demoSound === false) return;
    var a = ac(); if (!a) return; scale = scale || 1; var p = PROFILES[profileIdx], t = a.currentTime;
    if (p.name === "MIX") { for (var i = 0; i < 5; i++) { var q = PROFILES[i]; burst(q.dn.d, q.dn.f, q.dn.q, q.dn.g * scale * 0.35, t + i * 0.015); thump(q.th.a, q.th.b, q.th.g * scale * 0.35, q.th.d, t + i * 0.015); if (q.click) burst(0.012, q.dn.f * 1.6, 1.6, q.dn.g * 0.18 * scale, t + i * 0.015 + 0.004); } return; }
    burst(p.dn.d, p.dn.f, p.dn.q, p.dn.g * scale, t); thump(p.th.a, p.th.b, p.th.g * scale, p.th.d, t);
    if (p.click) burst(0.012, p.dn.f * 1.6, 1.6, p.dn.g * 0.5 * scale, t + 0.004);
  }
  function playUp() {
    if (window.__demoSound === false) return;
    var a = ac(); if (!a) return; var p = PROFILES[profileIdx], t = a.currentTime;
    burst(p.up.d, p.up.f, p.up.q, p.up.g, t); if (p.click) burst(0.01, p.up.f * 1.3, 1.6, p.up.g * 0.5, t);
  }
  function playHover() { playDown(0.55); }

  /* ---------- sound lab + tool label (DOM UI, created here, ported from
     stack/index.html: SOUND on/off + SWITCH profile cycler + hovered-key
     name/description label). All fixed-position, high z-index, clickable
     over everything — and kept in corners / pointer-events:none so the
     centre drag-to-rotate never gets intercepted. ---------- */
  var labelEl, labelName, labelTag, sndBtn, swBtn;
  /* ---- section-gated chrome ----
     The keyboard is one object that glides between sections. The tool
     name/description label + the sound lab (SOUND/SWITCH pills + audible
     switches) belong to the SKILLS section only. In every other section the
     keyboard is a silent, label-free backdrop. Keycap logos always render. */
  var LABEL_SECTION = "skills";
  var labelEnabled = false;                 // true only while the labeled section is active
  var userSoundOn = true;                   // the user's SOUND-pill preference (persisted)
  try { userSoundOn = localStorage.getItem("demoMute") !== "1"; } catch (e) {}
  (function buildUI() {
    var PILL = "position:fixed;z-index:32;cursor:pointer;color:#cdd9e8;opacity:.85;" +
      "font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:12px;font-weight:700;" +
      "letter-spacing:.5px;background:rgba(18,24,34,.55);border:1px solid rgba(166,186,208,.28);" +
      "padding:7px 12px;border-radius:20px;-webkit-user-select:none;user-select:none;" +
      "-webkit-tap-highlight-color:transparent;pointer-events:auto;backdrop-filter:blur(6px);";
    /* SOUND + SWITCH pills, bottom-right corner (clear of viewport centre + nav) */
    sndBtn = document.createElement("div");
    sndBtn.id = "kbd-snd";
    sndBtn.style.cssText = PILL + "right:16px;bottom:16px;";
    sndBtn.textContent = "SOUND: " + (window.__demoSound === false ? "OFF" : "ON");
    swBtn = document.createElement("div");
    swBtn.id = "kbd-sw";
    swBtn.style.cssText = PILL + "right:120px;bottom:16px;";
    swBtn.textContent = "SWITCH: " + PROFILES[profileIdx].name;

    /* tool name + description label, LEFT side (display only). Dark ink on the
       light workshop background: name in --fg (#222831), tag in Davy grey
       --muted (#4b5056) — the keyboard case's own colour. */
    labelEl = document.createElement("div");
    labelEl.id = "kbd-label";
    labelEl.style.cssText = "position:fixed;top:118px;left:clamp(20px,5vw,72px);z-index:18;pointer-events:none;" +
      "color:#222831;max-width:34vw;text-align:left;opacity:0;transition:opacity .18s ease;";
    labelName = document.createElement("div");
    labelName.className = "kbd-label-name";
    labelName.style.cssText = "font-family:var(--font-display),'Archivo Black',sans-serif;" +
      "font-size:clamp(22px,2.6vw,40px);font-weight:900;line-height:.96;letter-spacing:-1px;color:#222831;";
    labelTag = document.createElement("div");
    labelTag.className = "kbd-label-tag";
    labelTag.style.cssText = "margin-top:10px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;" +
      "font-size:13px;font-style:italic;color:#4b5056;opacity:1;line-height:1.5;max-width:30ch;";
    labelEl.appendChild(labelName); labelEl.appendChild(labelTag);

    function add() {
      if (!document.body) return;
      document.body.appendChild(sndBtn);
      document.body.appendChild(swBtn);
      document.body.appendChild(labelEl);
    }
    if (document.body) add(); else document.addEventListener("DOMContentLoaded", add);

    /* start hidden: the lab + label only appear once the labeled section is
       active (applyChrome drives this from the scroll position). */
    sndBtn.style.display = "none";
    swBtn.style.display = "none";
    sndBtn.textContent = "SOUND: " + (userSoundOn ? "ON" : "OFF");

    /* pre-populate the label text so the labeled section shows a value before
       any hover — but leave it hidden until applyChrome enables it. */
    if (SKILLS.length) {
      labelName.textContent = SKILLS[0].label;
      labelTag.textContent = SKILLS[0].tag || "";
    }

    /* SOUND: toggle the user's preference + persist. Only audible while the
       labeled section is active (window.__demoSound is section-gated). */
    sndBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    sndBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      userSoundOn = !userSoundOn;
      try { localStorage.setItem("demoMute", userSoundOn ? "0" : "1"); } catch (er) {}
      window.__demoSound = labelEnabled ? userSoundOn : false;
      sndBtn.textContent = "SOUND: " + (userSoundOn ? "ON" : "OFF");
      if (userSoundOn && labelEnabled) { ac(); playUp(); }
    });
    /* SWITCH: cycle the switch-sound profile + play a sample (forces sound on for the sample) */
    swBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    swBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      profileIdx = (profileIdx + 1) % PROFILES.length;
      swBtn.textContent = "SWITCH: " + PROFILES[profileIdx].name;
      ac();
      var prev = window.__demoSound; window.__demoSound = true; playDown(); window.__demoSound = prev;
    });
  })();

  /* update the upper-left label from a SKILLS entry; when nothing is hovered
     fall back to the first skill so the upper-left always reads something */
  function setLabel(skill) {
    if (!labelEl) return;
    /* the label only shows in the labeled section; everywhere else it stays
       hidden no matter what is hovered */
    if (!labelEnabled) { labelEl.style.opacity = "0"; return; }
    var s = skill || (SKILLS.length ? SKILLS[0] : null);
    if (!s) { labelEl.style.opacity = "0"; return; }
    labelName.textContent = s.label;
    labelTag.textContent = s.tag || "";
    labelEl.style.opacity = "1";
  }

  /* apply the per-section chrome: in the labeled (skills) section show the
     label + sound lab and honour the user's sound preference; in every other
     section hide them and mute. Called only when the active section changes. */
  function applyChrome(sid) {
    var on = (sid === LABEL_SECTION);
    labelEnabled = on;
    if (sndBtn) sndBtn.style.display = on ? "" : "none";
    if (swBtn) swBtn.style.display = on ? "" : "none";
    if (sndBtn) sndBtn.textContent = "SOUND: " + (userSoundOn ? "ON" : "OFF");
    window.__demoSound = on ? userSoundOn : false;
    if (on) setLabel(hovered ? hovered.userData.skill : null);
    else if (labelEl) labelEl.style.opacity = "0";
  }

  /* ---------- interaction ---------- */
  var ray = new THREE.Raycaster();
  var mouse = new THREE.Vector2(-2, -2);
  var hovered = null;

  function setMouse(e) { var t = e.touches ? e.touches[0] : e; mouse.x = (t.clientX / window.innerWidth) * 2 - 1; mouse.y = -(t.clientY / window.innerHeight) * 2 + 1; }
  var isDown = false, dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0, downCap = null;

  /* did the current pointer ray hit any interactive part of the keyboard? */
  function rayHitsBoard() {
    ray.setFromCamera(mouse, camera);
    var capHits = ray.intersectObjects(caps.flatMap(function (c) { return c.children; }), true);
    if (capHits.find(function (h) { return h.object.userData.cap; })) return true;
    if (trackball && ray.intersectObject(trackball, false).length > 0) return true;
    /* also count the board halves / case so dragging on the body rotates */
    if (ray.intersectObject(board, true).length > 0) return true;
    return false;
  }

  window.addEventListener("pointerdown", function (e) {
    ac(); setMouse(e); pickHover();
    /* TOUCH: only capture a rotate-drag if we actually hit the keyboard; a touch on
       empty space must scroll the PAGE (no scroll-trap). DESKTOP mouse: gate on a hit
       too — safe, and still lets you drag the board/trackball/empty-near-board freely. */
    var hit = (hovered != null) || rayHitsBoard();
    if (!hit) { isDown = false; dragging = false; downCap = null; return; }
    isDown = true; dragging = false; downX = lastX = e.clientX; downY = lastY = e.clientY; downCap = hovered;
  }, { passive: true });
  window.addEventListener("pointermove", function (e) {
    setMouse(e);
    if (isDown) {
      /* touch that STARTED on a key => scrub-hover the keys (lift + label) like desktop hover;
         touch on the empty desk/trackball (or mouse drag) => rotate the board */
      if (e.pointerType === "touch" && downCap) { pickHover(); }
      else { if (!dragging && Math.hypot(e.clientX - downX, e.clientY - downY) > 6) dragging = true; if (dragging) orbit(e); }
    } else pickHover();
  }, { passive: true });
  window.addEventListener("pointerup", function () {
    if (isDown && !dragging) { var c = hovered || downCap; if (c) { playDown(); setLabel(c.userData.skill); c.userData.pressed = true; setTimeout(function () { c.userData.pressed = false; }, 220); } }
    isDown = false; dragging = false; downCap = null;
  }, { passive: true });
  window.addEventListener("pointercancel", function () { isDown = false; dragging = false; downCap = null; }, { passive: true });

  function orbit(e) { var dx = (e.clientX - lastX) / window.innerWidth, dy = (e.clientY - lastY) / window.innerHeight; board.rotation.y += dx * 2.4; board.rotation.x = Math.max(-1.45, Math.min(0.4, board.rotation.x + dy * 1.8)); lastX = e.clientX; lastY = e.clientY; }

  function pickHover() {
    ray.setFromCamera(mouse, camera);
    var hits = ray.intersectObjects(caps.flatMap(function (c) { return c.children; }), true);
    var hit = hits.find(function (h) { return h.object.userData.cap; });
    var cap = hit ? hit.object.userData.cap : null;
    if (cap !== hovered) { hovered = cap; if (cap) { playHover(); setLabel(cap.userData.skill); } else setLabel(null); }
    if (trackball) {
      var bh = ray.intersectObject(trackball, false);
      var nowHov = bh.length > 0;
      if (nowHov !== trackballHovered) { trackballHovered = nowHov; rollTargetSpeed = nowHov ? 8 : 1; }
    }
  }

  /* phone detection — recomputed on every resize so transitions are smooth */
  var isPhone = window.matchMedia("(max-width:760px)").matches;

  function layout() {
    isPhone = window.matchMedia("(max-width:760px)").matches;
    var portrait = window.innerHeight > window.innerWidth || window.innerWidth < 760;
    if (portrait) { camera.fov = 58; camera.position.set(0, 7.6, 10.0); camera.lookAt(0, 0.0, 1.7); }
    else { camera.fov = 40; camera.position.set(0, 8.6, 11.6); camera.lookAt(0, 0.1, 1.4); }
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  layout();

  var t = 0, rollSpeedY = 0.012, rollSpeedX = 0.004, rollTargetSpeed = 1, trackballHovered = false;
  var tmp = new THREE.Vector3();
  var lastNow = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  /* phone: smooth Y position target (lerped each frame) */
  var boardYBase = 0; // current lerp target for board base Y (before idle bob)

  /* ---- R2: scroll-driven per-section horizontal positioning ----
     The keyboard is the connective thread: it glides between a floated-right
     parking spot (hero/contact — clears the left-aligned hero name) and a
     centred, prominent home (skills/experience/projects). RTL mirrors sides. */
  var SECTION_IDS = ["hero", "skills", "experience", "projects", "contact"];
  /* target X as a fraction of HALF the viewport width (LTR). 0 = centred.
     hero/contact pushed well to the RIGHT so the LEFT ~half stays clear of the
     hero text column (name/role/pitch). 0.66 keeps the board fully on-screen
     (left edge well past centre) without clipping the right edge. */
  var SECTION_FRAC = { hero: 0.74, skills: 0.0, experience: 0.0, projects: 0.0, contact: 0.74 };
  /* subtle scale: smaller when floated to a side, full when centred.
     0.72 floated keeps the right edge inside the viewport at the larger offset
     and shrinks the footprint so the hero text column stays fully clear. */
  var SECTION_SCALE = { hero: 0.72, skills: 1.0, experience: 1.0, projects: 1.0, contact: 0.72 };
  function isRTL() { return document.documentElement.getAttribute("dir") === "rtl" || document.dir === "rtl"; }
  /* latest viewport width in world units at the board's z-plane (updated each frame) */
  var vpW = 1;
  function activeSectionId() {
    var best = "hero", bestD = Infinity, mid = window.innerHeight / 2;
    for (var i = 0; i < SECTION_IDS.length; i++) {
      var el = document.getElementById(SECTION_IDS[i]);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = SECTION_IDS[i]; }
    }
    return best;
  }

  /* ---- hardening (mirror orb.js): pause on hidden, first-frame signal, ctx-lost ---- */
  var paused = false, running = false, firstFrame = true;
  var lastChromeSid = null;   /* last section we applied label/sound chrome for */

  function animate() {
    if (paused) { running = false; return; }
    requestAnimationFrame(animate);
    running = true;
    t += 0.016;
    if (!isDown) pickHover();
    /* R2: glide the board horizontally to the active section's parking spot.
       viewport size in world units at the board's z-plane (board.position.z≈0): */
    var vpH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * Math.abs(camera.position.z - board.position.z);
    vpW = vpH * camera.aspect;
    var sid = activeSectionId();
    /* section-gated chrome: show label + sound lab only in the labeled section */
    if (sid !== lastChromeSid) { lastChromeSid = sid; applyChrome(sid); }
    /* R4: on phone centre the keyboard (no side-float — narrow screen has no room) and
       push it downward so it reads as a backdrop below the hero text, not covering it. */
    var frac = isPhone ? 0 : (SECTION_FRAC[sid] || 0);
    if (!isPhone && isRTL()) frac = -frac;
    var targetX = frac * (vpW / 2);
    /* R4: phone Y base — push down so keyboard clears the full text block (name+role+para+CTAs).
       0.32 × vpH is roughly the lower third of the visible world-height at the board plane. */
    var phoneYOffset = isPhone ? -(vpH * 0.32) : 0;
    boardYBase += (phoneYOffset - boardYBase) * 0.14; // lerp: ~14% per frame — snappy on resize
    /* idle bob is relative to boardYBase */
    board.position.y = boardYBase + Math.sin(t * 0.8) * 0.07;
    /* frame-rate-independent smoothing: exponential decay over REAL elapsed time,
       so the glide converges in ~real seconds regardless of fps (smooth, deterministic) */
    var now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    var dt = Math.min(0.25, Math.max(0, (now - lastNow) / 1000)); lastNow = now;
    var k = 7; // smoothing rate (per second); higher = snappier, still glides
    var sm = 1 - Math.exp(-k * dt);
    board.position.x += (targetX - board.position.x) * sm;
    /* R4: on phone multiply the section scale by 0.52 — clearly smaller, reads as backdrop */
    var ts = (SECTION_SCALE[sid] || 1.0) * (isPhone ? 0.52 : 1.0);
    board.scale.x += (ts - board.scale.x) * sm;
    board.scale.y = board.scale.z = board.scale.x;
    caps.forEach(function (cap) {
      var u = cap.userData; var target = u.baseY;
      if (u.pressed) target = u.baseY - 0.18;
      else if (cap === hovered) target = u.baseY + 0.5;
      u.vy += (target - cap.position.y) * 0.28; u.vy *= 0.56; cap.position.y += u.vy;
      var glow = (cap === hovered && !u.pressed) ? 0.3 : 0.0;
      u.mat.emissiveIntensity += (glow - u.mat.emissiveIntensity) * 0.2;
    });
    rollSpeedY += (0.012 * rollTargetSpeed - rollSpeedY) * 0.08;
    rollSpeedX += (0.004 * rollTargetSpeed - rollSpeedX) * 0.08;
    if (trackball) { trackball.rotation.y += rollSpeedY; trackball.rotation.x += rollSpeedX; }
    if (hovered) { dot.visible = true; hovered.getWorldPosition(tmp); dot.position.set(tmp.x - 0.4, tmp.y + 0.5 + Math.sin(t * 3) * 0.05, tmp.z); }
    else dot.visible = false;
    renderer.render(scene, camera);
    /* first real WebGL frame has painted → signal the page */
    if (firstFrame) { firstFrame = false; document.documentElement.classList.add("kbd-live"); }
  }

  function resume() { if (!running && !paused) requestAnimationFrame(animate); }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { paused = true; }
    else { paused = false; resume(); }
  });
  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault(); paused = true; running = false;
    document.documentElement.classList.remove("kbd-live");
  }, false);
  canvas.addEventListener("webglcontextrestored", function () {
    document.documentElement.classList.remove("kbd-live");
  }, false);

  window.addEventListener("resize", layout);
  requestAnimationFrame(animate);

  /* expose for tests: lets a later harness verify drag-rotate */
  window.__kbd = {
    getRotation: function () { return board.rotation.y; },
    getPosFrac: function () { return board.position.x / (vpW / 2); }  // normalized -1..1 of half-viewport
  };
})();
