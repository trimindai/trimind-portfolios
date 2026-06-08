/* ============================================================================
   orb.js — the signature persistent 3D orb.
   ONE conserved object in a fixed full-screen canvas behind the DOM. It travels
   and transforms through the sections as the page scrolls. Vanilla Three.js
   (global THREE, vendored r128). Phase 1: solid orb only (travel + spring +
   per-section colour/scale). Particles + dock land in later phases.
   ============================================================================ */
(function () {
  "use strict";
  if (!window.THREE) return;
  var canvas = document.getElementById("orb-stage");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- perf tier ---- */
  function detectTier() {
    if (reduce) return "low";
    var mem = navigator.deviceMemory || 4;
    var cores = navigator.hardwareConcurrency || 4;
    if (mem <= 2 || cores <= 2) return "low";
    var mobile = window.matchMedia("(max-width:760px)").matches || /Mobi|Android/i.test(navigator.userAgent);
    return mobile ? "mobile" : "desktop";
  }
  var TIER = detectTier();
  if (TIER === "low") { canvas.style.display = "none"; return; } /* Phase 6 adds a static fallback */

  /* ---- renderer / scene / camera ---- */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIER === "mobile" ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  var CAM_Z = 8;
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  /* ---- the orb: a fresnel/iridescent blue glass-ish sphere (no env needed) ---- */
  var uniforms = {
    uCore:   { value: new THREE.Color(0x6d99ce) },
    uRim:    { value: new THREE.Color(0xdfeaf6) },
    uDeep:   { value: new THREE.Color(0x2f5588) },
    uOpacity:{ value: 1.0 },
    uTime:   { value: 0.0 },
    uLight:  { value: new THREE.Vector3(0.4, 0.8, 0.6).normalize() }
  };
  var orbMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: [
      "varying vec3 vN; varying vec3 vV; varying vec3 vP;",
      "void main(){",
      "  vec4 wp = modelMatrix * vec4(position,1.0);",
      "  vP = position;",
      "  vN = normalize(mat3(modelMatrix) * normal);",
      "  vV = normalize(cameraPosition - wp.xyz);",
      "  gl_Position = projectionMatrix * viewMatrix * wp;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform vec3 uCore; uniform vec3 uRim; uniform vec3 uDeep; uniform vec3 uLight;",
      "uniform float uOpacity; uniform float uTime;",
      "varying vec3 vN; varying vec3 vV; varying vec3 vP;",
      "void main(){",
      "  vec3 N = normalize(vN); vec3 V = normalize(vV); vec3 L = normalize(uLight);",
      "  float diff = max(dot(N, L), 0.0);",
      "  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);",
      "  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 50.0);",
      "  vec3 body = mix(uDeep, uCore, diff*diff);",                /* mostly deep ink; lit side rises to blue-gray */
      "  vec3 col = mix(body, uRim, fres*0.5);",                    /* glassy edge sheen */
      "  col += spec * 1.2;",                                        /* bright glass highlight */
      "  col += uCore * 0.10 * (1.0 - fres);",                       /* faint inner glow */
      "  float irid = 0.05*sin(vP.y*7.0 + uTime*0.6) + 0.04*sin(vP.x*6.0 - uTime*0.4);",
      "  col += irid * uRim;",                                       /* faint iridescence */
      "  float a = clamp(0.85 + fres*0.15, 0.0, 1.0) * uOpacity;",   /* solid glass, bright glassy edge */
      "  gl_FragColor = vec4(col, a);",
      "}"
    ].join("\n")
  });
  var orb = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), orbMat);
  scene.add(orb);

  /* ---- particle cloud: only simulated during the hero bloom + dock windows ---- */
  var PN = (TIER === "mobile") ? 5000 : 20000;
  var pts = null, ptsU = null;
  (function buildParticles() {
    var g = new THREE.BufferGeometry();
    var pos = new Float32Array(PN * 3), rnd = new Float32Array(PN * 3);
    var GA = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < PN; i++) {
      var y = 1 - (i / (PN - 1)) * 2;                 /* fibonacci sphere (same silhouette) */
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var th = GA * i;
      pos[i * 3] = Math.cos(th) * rad; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(th) * rad;
      rnd[i * 3] = Math.random(); rnd[i * 3 + 1] = Math.random(); rnd[i * 3 + 2] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 3));
    ptsU = {
      uMorph: { value: 1 }, uDisp: { value: 0 }, uTime: { value: 0 },
      uSize: { value: (TIER === "mobile") ? 2.2 : 2.7 },
      uColor: { value: new THREE.Color(0x6d99ce) }, uRim: { value: new THREE.Color(0xeaf2fb) },
      uOpacity: { value: 0 }
    };
    var mat = new THREE.ShaderMaterial({
      uniforms: ptsU, transparent: true, depthWrite: false,
      vertexShader: [
        "attribute vec3 aRand;",
        "uniform float uMorph; uniform float uDisp; uniform float uTime; uniform float uSize;",
        "varying float vA;",
        "void main(){",
        "  vec3 home = position;",
        "  vec3 drift = vec3(sin(uTime*0.8 + aRand.x*6.28), cos(uTime*0.7 + aRand.y*6.28), sin(uTime*0.6 + aRand.z*6.28));",
        "  float radial = mix(0.06, 1.0, uMorph) + uDisp*(0.5 + aRand.x);",   /* bloom: expand from centre; dock: push out */
        "  vec3 p = home*radial + drift*((1.0-uMorph)*0.30 + uDisp*0.45);",
        "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
        "  gl_Position = projectionMatrix * mv;",
        "  gl_PointSize = uSize * (300.0 / -mv.z);",
        "  vA = 0.45 + 0.55*aRand.y;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform vec3 uColor; uniform vec3 uRim; uniform float uOpacity;",
        "varying float vA;",
        "void main(){",
        "  vec2 c = gl_PointCoord - 0.5; float r = dot(c, c);",
        "  if (r > 0.25) discard;",
        "  float a = smoothstep(0.25, 0.0, r) * vA * uOpacity;",
        "  vec3 col = mix(uColor, uRim, smoothstep(0.06, 0.0, r));",   /* brighter core dot */
        "  gl_FragColor = vec4(col, a);",
        "}"
      ].join("\n")
    });
    pts = new THREE.Points(g, mat);
    pts.visible = false; pts.frustumCulled = false;
    scene.add(pts);
  })();

  /* ---- section anchoring (runtime; keyframes are fractions, never px) ---- */
  var SECTIONS = ["hero", "skills", "experience", "projects", "contact"];
  /* per-section orb target: x/y are fractions of the half-viewport at the z=0 plane */
  var KF = {
    hero:       { x:  0.45, y:  0.02, scale: 1.30, color: 0x6d99ce, deep: 0x2f5588, opacity: 1.00 },
    skills:     { x:  0.00, y: -0.18, scale: 0.55, color: 0x6d99ce, deep: 0x2f5588, opacity: 0.95 },
    experience: { x: -0.60, y:  0.05, scale: 0.40, color: 0x6d99ce, deep: 0x35608f, opacity: 0.70 },
    projects:   { x:  0.10, y:  0.00, scale: 0.72, color: 0x6d99ce, deep: 0x2f5588, opacity: 0.55 },
    contact:    { x:  0.00, y:  0.02, scale: 0.86, color: 0x7fb0e6, deep: 0x4b7bbf, opacity: 1.00 }
  };
  /* RTL (Arabic): mirror the journey horizontally so the hero orb sits on the left */
  var __rtl = (document.documentElement.getAttribute("dir") === "rtl") || (document.dir === "rtl");
  if (__rtl) { for (var __k in KF) KF[__k].x = -KF[__k].x; }
  var anchors = []; /* [{id, y}] sorted by scroll position */
  var anchorY = {}; /* id -> centred-scroll value */
  /* keyboard iframe + calibrated trackball position within it (for the dock handoff) */
  var stackIframe = document.querySelector(".stack-frame");
  var DOCK_FX = 0.50, DOCK_FY = 0.56, DOCK_TB = 0.18; /* trackball centre-x/centre-y/diameter as fractions of the iframe */
  function measure() {
    anchors = []; anchorY = {};
    for (var i = 0; i < SECTIONS.length; i++) {
      var el = document.getElementById(SECTIONS[i]);
      if (!el) continue;
      var rect = el.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      var y = Math.max(0, top + el.offsetHeight / 2 - window.innerHeight / 2); /* scroll value where section is centred */
      anchors.push({ id: SECTIONS[i], y: y });
      anchorY[SECTIONS[i]] = y;
    }
    anchors.sort(function (a, b) { return a.y - b.y; });
  }

  /* ---- viewport <-> world mapping at the z=0 plane ---- */
  var vpH = 1, vpW = 1;
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    vpH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * CAM_Z;
    vpW = vpH * camera.aspect;
    measure();
  }
  window.addEventListener("resize", resize);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { measure(); });
    ro.observe(document.body);
  }

  /* ---- interpolate the keyframe at the current scroll position ---- */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); } /* smoothstep ease */
  var cur = { x: KF.hero.x, y: KF.hero.y, scale: KF.hero.scale, opacity: KF.hero.opacity };
  var curCore = new THREE.Color(KF.hero.color), curDeep = new THREE.Color(KF.hero.deep);
  function targetAt(scrollY) {
    if (anchors.length === 0) return KF.hero;
    if (scrollY <= anchors[0].y) return KF[anchors[0].id];
    if (scrollY >= anchors[anchors.length - 1].y) return KF[anchors[anchors.length - 1].id];
    for (var i = 0; i < anchors.length - 1; i++) {
      var a = anchors[i], b = anchors[i + 1];
      if (scrollY >= a.y && scrollY <= b.y) {
        var t = smooth((scrollY - a.y) / Math.max(1, b.y - a.y));
        var ka = KF[a.id], kb = KF[b.id];
        return {
          x: lerp(ka.x, kb.x, t), y: lerp(ka.y, kb.y, t),
          scale: lerp(ka.scale, kb.scale, t), opacity: lerp(ka.opacity, kb.opacity, t),
          _a: ka, _b: kb, _t: t
        };
      }
    }
    return KF.hero;
  }

  /* ---- spring (slight overshoot on settle) ---- */
  var vx = 0, vy = 0, vs = 0;
  var K = 0.090, DAMP = 0.80;       /* responsive spring, slight overshoot on settle */
  var paused = false, tAcc = 0;
  var dockLifted = false;           /* is the canvas currently raised above the iframe? */
  var bloomActive = true, bloomClock = 0, BLOOM_DUR = 1.6;  /* hero load bloom */
  var lastNow = 0;                                          /* for frame-rate-independent timing */

  /* how docked are we? a 0..1..0 bump peaking when the keyboard is centred */
  function dockProgress(sy) {
    if (anchorY.skills == null || !stackIframe) return 0;
    var sk = anchorY.skills;
    var prev = anchorY.hero != null ? anchorY.hero : sk - 800;
    var next = anchorY.experience != null ? anchorY.experience : sk + 800;
    var dp = (sy <= sk) ? (sy - prev) / Math.max(1, sk - prev)
                        : 1 - (sy - sk) / Math.max(1, next - sk);
    return smooth(Math.max(0, Math.min(1, dp)));
  }

  function frame() {
    if (paused) return;
    requestAnimationFrame(frame);
    var now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    var dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016; lastNow = now;
    tAcc += dt;
    var sy = window.scrollY || window.pageYOffset || 0;
    var tgt = targetAt(sy);
    var tx = tgt.x, ty = tgt.y, ts = tgt.scale, topac = tgt.opacity;

    /* ---- DOCK: blend toward the keyboard's live trackball position + crossfade ---- */
    var dp = dockProgress(sy);
    if (dp > 0.001) {
      var r = stackIframe.getBoundingClientRect();
      var px = r.left + r.width * DOCK_FX;
      var py = r.top + r.height * DOCK_FY;
      var dfx = (px / window.innerWidth) * 2 - 1;
      var dfy = -((py / window.innerHeight) * 2 - 1);
      var dscale = (r.height * DOCK_TB * vpH) / (2 * window.innerHeight); /* match trackball apparent size */
      tx = lerp(tx, dfx, dp); ty = lerp(ty, dfy, dp); ts = lerp(ts, dscale, dp);
      var fade = 1 - smooth(Math.max(0, (dp - 0.72) / 0.28)); /* fade out as it overlaps the trackball */
      topac = topac * fade;
    }
    /* raise the canvas above the iframe while docking so the orb is visible flying in */
    var wantLift = dp > 0.002;
    if (wantLift !== dockLifted) { dockLifted = wantLift; canvas.style.zIndex = wantLift ? "5" : "-1"; }

    /* spring position + scale toward target (fractions) */
    vx += (tx - cur.x) * K; vx *= DAMP; cur.x += vx;
    vy += (ty - cur.y) * K; vy *= DAMP; cur.y += vy;
    vs += (ts - cur.scale) * K; vs *= DAMP; cur.scale += vs;
    cur.opacity += (topac - cur.opacity) * 0.12;

    /* eased colour toward the segment's target */
    var coreT = tgt._b ? tgt._b.color : (tgt.color || KF.hero.color);
    var deepT = tgt._b ? tgt._b.deep : (tgt.deep || KF.hero.deep);
    curCore.lerp(new THREE.Color(coreT), 0.05);
    curDeep.lerp(new THREE.Color(deepT), 0.05);
    uniforms.uCore.value.copy(curCore);
    uniforms.uDeep.value.copy(curDeep);
    /* ---- particle windows: hero bloom (on load) + dock burst ---- */
    var morph = 1, ptsOpac = 0, disp = 0, solidMul = 1;
    if (bloomActive) {
      var bt = Math.min(1, bloomClock / BLOOM_DUR); bloomClock += dt;
      var be = 1 - Math.pow(1 - bt, 3);                       /* ease-out cubic */
      morph = be; disp = (1 - be) * 0.18;
      ptsOpac = 1 - smooth(Math.max(0, (bt - 0.80) / 0.20));  /* particles fade as the solid forms */
      solidMul = smooth(Math.max(0, (bt - 0.60) / 0.40));     /* solid fades in at the end */
      if (bt >= 1) bloomActive = false;
    } else if (dp > 0.70) {
      var bump = smooth((dp - 0.70) / 0.18) * (1 - smooth(Math.max(0, (dp - 0.90) / 0.10)));
      ptsOpac = bump; disp = bump * 0.9; morph = 1;           /* particalize + scatter into the trackball */
    }

    uniforms.uOpacity.value = cur.opacity * solidMul;
    uniforms.uTime.value = tAcc;

    /* map fraction -> world, place + scale + idle rotation */
    orb.position.set(cur.x * vpW / 2, cur.y * vpH / 2, 0);
    orb.scale.setScalar(Math.max(0.001, cur.scale));
    orb.rotation.y += dt * 0.10;
    orb.rotation.x = Math.sin(tAcc * 0.3) * 0.06; /* gentle breathe/tilt */

    /* particles ride the orb transform; rendered only while a window is active */
    if (pts) {
      var on = ptsOpac > 0.004;
      if (pts.visible !== on) pts.visible = on;
      if (on) {
        pts.position.copy(orb.position);
        pts.scale.copy(orb.scale);
        pts.rotation.copy(orb.rotation);
        ptsU.uMorph.value = morph; ptsU.uDisp.value = disp;
        ptsU.uTime.value = tAcc; ptsU.uOpacity.value = ptsOpac;
        ptsU.uColor.value.copy(curCore);
      }
    }

    renderer.render(scene, camera);
  }

  /* ---- pause when the tab/canvas is offscreen ---- */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { paused = true; }
    else if (paused) { paused = false; requestAnimationFrame(frame); }
  });

  resize();
  requestAnimationFrame(frame);
  /* re-measure once fonts/images settle */
  window.addEventListener("load", function () { setTimeout(measure, 300); });
})();
