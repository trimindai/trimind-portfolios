/* ============================================================================
   orb.js — the signature persistent 3D orb.
   ONE conserved object in a fixed full-screen canvas behind the DOM. A small
   trackball that FALLS into the current section's .orb-socket (gravity-biased
   spring + bounce-settle + roll-spin), seating in each Davy cup as you scroll.
   Vanilla Three.js (global THREE, vendored r128). Hero-load particle bloom kept.
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
  /* low-end / reduced-motion: no WebGL at all — the static CSS #orb-fallback in the hero stays visible */
  if (TIER === "low") { canvas.style.display = "none"; return; }

  /* ---- renderer / scene / camera ---- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { renderer = null; }
  if (!renderer) { canvas.style.display = "none"; return; } /* WebGL unavailable → static CSS #orb-fallback stays */
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

  /* the orb targets the on-screen centre of the current section's .orb-socket */
  var SECTION_IDS = ["hero","skills","experience","projects","contact"];
  function currentSocket(){
    var vh = window.innerHeight, best=null, bestD=1e9;
    for (var i=0;i<SECTION_IDS.length;i++){
      var s=document.getElementById(SECTION_IDS[i]); if(!s) continue;
      var k=s.querySelector(".orb-socket"); if(!k) continue;
      var sr=s.getBoundingClientRect();
      var centreDist=Math.abs((sr.top+sr.height/2) - vh/2);
      if(centreDist<bestD){ bestD=centreDist; best=k; }
    }
    return best;
  }
  function socketTarget(el){
    var r=el.getBoundingClientRect();
    var px=r.left + r.width/2, py=r.top + r.height*0.30; /* sit slightly above cup centre so the ball seats in it */
    return { fx:(px/window.innerWidth)*2-1, fy:-((py/window.innerHeight)*2-1) };
  }
  /* smaller orb that falls into each socket */
  var ORB_SCALE = 0.5;

  /* ---- viewport <-> world mapping at the z=0 plane ---- */
  var vpH = 1, vpW = 1;
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    vpH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * CAM_Z;
    vpW = vpH * camera.aspect;
  }
  window.addEventListener("resize", resize);

  /* ---- glass colour is now a constant (no per-section lerp) ---- */
  function smooth(t) { return t * t * (3 - 2 * t); } /* smoothstep ease (bloom) */
  uniforms.uCore.value.set(0x6d99ce);
  uniforms.uDeep.value.set(0x2f5588);
  var cur = { x: 0.45, y: 0.02, scale: ORB_SCALE };

  /* ---- spring (slight overshoot on settle) ---- */
  var vx = 0, vy = 0, vs = 0;
  var K = 0.110, DAMP = 0.78;       /* responsive spring (per 1/60 substep), slight overshoot on settle */
  var paused = false, running = false, firstFrame = true, tAcc = 0;
  var bloomActive = true, bloomClock = 0, BLOOM_DUR = 1.6;  /* hero load bloom */
  var lastNow = 0;                                          /* for frame-rate-independent timing */
  var landedId = null;                                      /* fires the landing detector once per section entry */

  function frame() {
    if (paused) { running = false; return; }
    requestAnimationFrame(frame);
    running = true;
    var now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    var rawDt = lastNow ? (now - lastNow) / 1000 : 0.016;       /* true elapsed (uncapped) — drives spring substep count */
    var dt = Math.min(0.05, rawDt); lastNow = now;              /* capped dt for visuals (bloom/rotation/idle) */
    tAcc += dt;

    /* ---- target = the current section socket's on-screen centre ---- */
    var sock = currentSocket();
    var tx = cur.x, ty = cur.y;
    if (sock){ var t = socketTarget(sock); tx = t.fx; ty = t.fy; }
    /* gravity-biased vertical fall, then spring damps into a bounce-settle.
       integrated in FIXED 60fps substeps so behaviour is frame-rate independent
       and settles in wall-clock time even when the GL loop runs at a low fps
       (e.g. headless swiftshader). The spring constants are tuned at this 1/60 step. */
    var GRAV = 0.020;
    var steps = Math.min(120, Math.max(1, Math.round(rawDt * 60)));
    for (var st = 0; st < steps; st++) {
      if (ty < cur.y){ vy += (ty - cur.y) * K; }               /* moving up: normal spring */
      else { vy += (ty - cur.y) * K + GRAV; }                  /* moving down: add gravity for a fall feel */
      vy *= DAMP; cur.y += vy;
      vx += (tx - cur.x) * K; vx *= DAMP; cur.x += vx;
      cur.scale += (ORB_SCALE - cur.scale) * 0.15;
    }

    /* ---- landing detector: fires once per section entry when settled in its socket ---- */
    var sId = sock ? (function(){ var sec=sock.closest("section"); return sec?sec.id:null; })() : null;
    var settled = Math.abs(vx)<0.004 && Math.abs(vy)<0.004 && Math.abs(tx-cur.x)<0.02 && Math.abs(ty-cur.y)<0.02;
    if (sId && sId!==landedId && settled){
      landedId = sId;
      cur.scale *= 0.86;                          /* contact squash; spring restores it */
      if (window.__orbLand) window.__orbLand();   /* click sound, wired in Task 3.3 (guard if absent) */
    }

    /* ---- particle window: hero bloom on load only (dock burst removed) ---- */
    var morph = 1, ptsOpac = 0, disp = 0, solidMul = 1;
    if (bloomActive) {
      var bt = Math.min(1, bloomClock / BLOOM_DUR); bloomClock += dt;
      var be = 1 - Math.pow(1 - bt, 3);                       /* ease-out cubic */
      morph = be; disp = (1 - be) * 0.18;
      ptsOpac = 1 - smooth(Math.max(0, (bt - 0.80) / 0.20));  /* particles fade as the solid forms */
      solidMul = smooth(Math.max(0, (bt - 0.60) / 0.40));     /* solid fades in at the end */
      if (bt >= 1) bloomActive = false;
    }

    uniforms.uOpacity.value = solidMul;
    uniforms.uTime.value = tAcc;

    /* map fraction -> world, place + scale + idle rotation + roll */
    orb.position.set(cur.x * vpW / 2, cur.y * vpH / 2, 0);
    orb.scale.setScalar(Math.max(0.001, cur.scale));
    orb.rotation.z -= vx * 6.0;                   /* roll-spin proportional to horizontal motion */
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
      }
    }

    renderer.render(scene, camera);
    /* first real WebGL frame has painted → hand off from the static CSS orb */
    if (firstFrame) { firstFrame = false; document.documentElement.classList.add("orb-live"); }
  }

  /* ---- pause when the tab is hidden, or the GL context is lost ----
     (the canvas is position:fixed full-viewport, so it is never scrolled offscreen — an
     IntersectionObserver would always report intersecting; tab-visibility is the real signal.) */
  function resume() { if (!running && !paused) requestAnimationFrame(frame); }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { paused = true; }
    else { paused = false; resume(); }
  });
  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault(); paused = true; running = false;
    document.documentElement.classList.remove("orb-live"); /* reveal the static CSS orb again */
  }, false);
  canvas.addEventListener("webglcontextrestored", function () {
    /* GL resources are gone and not re-uploaded here; keep the static orb rather than a black canvas */
    document.documentElement.classList.remove("orb-live");
  }, false);

  /* expose the orb's on-screen pixel position (for the harness) */
  window.__orbPos = function(){ return { x:(cur.x*0.5+0.5)*window.innerWidth, y:(-cur.y*0.5+0.5)*window.innerHeight }; };

  resize();
  requestAnimationFrame(frame);
})();
