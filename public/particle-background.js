(() => {
  const canvas = document.querySelector('#particle-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const TAU = Math.PI * 2;
  const palette = {
    ink: '#050505',
    red: '#d6281f',
    yellow: '#f4d21f',
    blue: '#1456a6',
    white: '#fbfaf5',
  };

  let W = 0;
  let H = 0;
  let solids = [];
  let pointer = { x: 0.5, y: 0.5, active: false };
  let lastTime = 0;
  let raf = 0;

  const rand = mulberry32(20260523);

  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '0',
    pointerEvents: 'none',
    background: 'radial-gradient(circle at 18% 10%, rgba(255,255,255,.95), transparent 28%), radial-gradient(circle at 78% 84%, rgba(20,86,166,.08), transparent 34%), #fbfaf5',
  });

  resize();
  spawnScene();
  raf = requestAnimationFrame(tick);

  window.addEventListener('resize', () => {
    resize();
    spawnScene();
  });

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX / Math.max(1, W);
    pointer.y = event.clientY / Math.max(1, H);
    pointer.active = true;
  });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else {
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    }
  });

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function spawnScene() {
    solids = [];
    const scale = Math.min(W, H);
    const majorCount = Math.round(clamp(scale / 180, 4, 7));
    const minorCount = Math.round(clamp(scale / 34, 22, 42));

    for (let i = 0; i < majorCount; i += 1) {
      solids.push(makeSolid({
        major: true,
        color: palette.ink,
        w: 360 + rand() * 520,
        h: 24 + rand() * 42,
        d: 24 + rand() * 54,
        spreadX: 0.95,
        spreadY: 0.78,
        zRange: 520,
      }));
    }

    const colors = [palette.red, palette.yellow, palette.blue, palette.ink, palette.white];
    for (let i = 0; i < minorCount; i += 1) {
      const isLine = rand() > 0.58;
      solids.push(makeSolid({
        major: false,
        color: colors[(i * 3 + Math.floor(rand() * colors.length)) % colors.length],
        w: isLine ? 92 + rand() * 210 : 32 + rand() * 92,
        h: isLine ? 12 + rand() * 26 : 28 + rand() * 82,
        d: 14 + rand() * 46,
        spreadX: 1.08,
        spreadY: 0.96,
        zRange: 760,
      }));
    }
  }

  function makeSolid(options) {
    return {
      x: (rand() - 0.5) * W * options.spreadX,
      y: (rand() - 0.5) * H * options.spreadY,
      z: -options.zRange * 0.5 + rand() * options.zRange,
      w: options.w,
      h: options.h,
      d: options.d,
      color: options.color,
      major: options.major,
      rx: rand() * TAU,
      ry: rand() * TAU,
      rz: rand() * TAU,
      spinX: (rand() - 0.5) * (options.major ? 0.06 : 0.18),
      spinY: (rand() - 0.5) * (options.major ? 0.08 : 0.22),
      spinZ: (rand() - 0.5) * (options.major ? 0.06 : 0.18),
      driftX: (rand() - 0.5) * (options.major ? 18 : 34),
      driftY: (rand() - 0.5) * (options.major ? 16 : 30),
      driftZ: 36 + rand() * (options.major ? 58 : 96),
      driftSpeed: 0.45 + rand() * 0.9,
      phase: rand() * TAU,
    };
  }

  function tick(ms) {
    const time = ms * 0.001;
    const dt = Math.min(0.033, lastTime ? time - lastTime : 0.016);
    lastTime = time;
    draw(time, dt);
    raf = requestAnimationFrame(tick);
  }

  function draw(time, dt) {
    ctx.clearRect(0, 0, W, H);
    const parallaxX = (pointer.x - 0.5) * (pointer.active ? 1 : 0.35);
    const parallaxY = (pointer.y - 0.5) * (pointer.active ? 1 : 0.35);
    const sceneRot = {
      x: -0.3 + Math.sin(time * 0.22) * 0.13 + parallaxY * 0.26,
      y: Math.sin(time * 0.18) * 0.24 + parallaxX * 0.38,
      z: Math.sin(time * 0.14) * 0.09,
    };

    const faces = [];
    for (const solid of solids) {
      solid.rx += solid.spinX * dt * 2.2;
      solid.ry += solid.spinY * dt * 2.2;
      solid.rz += solid.spinZ * dt * 2;

      const t = time * solid.driftSpeed;
      const orbit = Math.sin(t * 0.68 + solid.phase) * (solid.major ? 34 : 24);
      const origin = rotate3(
        solid.x + Math.cos(t + solid.phase) * solid.driftX + Math.cos(solid.phase) * orbit,
        solid.y + Math.sin(t * 0.86 + solid.phase) * solid.driftY + Math.sin(solid.phase * 0.7) * orbit,
        solid.z + Math.sin(t * 0.72 + solid.phase) * solid.driftZ,
        sceneRot.x,
        sceneRot.y,
        sceneRot.z
      );

      faces.push(...solidFaces(solid, origin, sceneRot, time));
    }

    faces.sort((a, b) => b.depth - a.depth);
    for (const face of faces) drawFace(face);
  }

  function solidFaces(solid, origin, sceneRot, time) {
    const hw = solid.w * 0.5;
    const hh = solid.h * 0.5;
    const hd = solid.d * 0.5;
    const localRot = {
      x: solid.rx + Math.sin(time * 0.34 + solid.phase) * 0.13,
      y: solid.ry + Math.cos(time * 0.28 + solid.phase) * 0.16,
      z: solid.rz,
    };
    const corners = [
      [-hw, -hh, -hd],
      [hw, -hh, -hd],
      [hw, hh, -hd],
      [-hw, hh, -hd],
      [-hw, -hh, hd],
      [hw, -hh, hd],
      [hw, hh, hd],
      [-hw, hh, hd],
    ].map(([x, y, z]) => {
      const local = rotate3(x, y, z, localRot.x, localRot.y, localRot.z);
      const scene = rotate3(local.x, local.y, local.z, sceneRot.x, sceneRot.y, sceneRot.z);
      return project(origin.x + scene.x, origin.y + scene.y, origin.z + scene.z);
    });

    return [
      { idx: [0, 1, 2, 3], shade: 0.5 },
      { idx: [4, 5, 6, 7], shade: 1 },
      { idx: [1, 5, 6, 2], shade: 0.82 },
      { idx: [0, 4, 7, 3], shade: 0.66 },
      { idx: [0, 1, 5, 4], shade: 0.9 },
      { idx: [3, 2, 6, 7], shade: 0.72 },
    ].map((def) => {
      const points = def.idx.map((i) => corners[i]);
      return {
        points,
        color: solid.color,
        shade: def.shade,
        alpha: solid.major ? 0.68 : solid.color === palette.white ? 0.38 : 0.56,
        depth: points.reduce((sum, p) => sum + p.depth, 0) / points.length,
        lineWidth: solid.major ? 1 : 0.8,
      };
    });
  }

  function project(x, y, z) {
    const depth = z + 760;
    const perspective = 820 / Math.max(180, 820 + depth * 0.35);
    return {
      x: W * 0.5 + x * perspective,
      y: H * 0.5 + y * perspective,
      depth,
    };
  }

  function drawFace(face) {
    if (!face.points.length) return;
    ctx.globalAlpha = face.alpha * face.shade;
    ctx.fillStyle = face.color;
    ctx.beginPath();
    ctx.moveTo(face.points[0].x, face.points[0].y);
    for (let i = 1; i < face.points.length; i += 1) ctx.lineTo(face.points[i].x, face.points[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = face.color === palette.ink ? 0.24 : 0.42;
    ctx.strokeStyle = face.color === palette.ink ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.72)';
    ctx.lineWidth = face.lineWidth;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function rotate3(x, y, z, rx, ry, rz) {
    let px = x;
    let py = y;
    let pz = z;
    let c = Math.cos(rx);
    let s = Math.sin(rx);
    let y1 = py * c - pz * s;
    let z1 = py * s + pz * c;
    py = y1;
    pz = z1;
    c = Math.cos(ry);
    s = Math.sin(ry);
    let x1 = px * c + pz * s;
    const z2 = -px * s + pz * c;
    px = x1;
    pz = z2;
    c = Math.cos(rz);
    s = Math.sin(rz);
    x1 = px * c - py * s;
    y1 = px * s + py * c;
    return { x: x1, y: y1, z: pz };
  }

  function mulberry32(seed) {
    return function random() {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
