// 滴墨：一滴顏料落入水中，像樹枝一樣向外渲染。
// 兩層畫布：ink 累積顏料痕跡（會非常緩慢地褪去），ripple 只畫落水瞬間的漣漪。

(() => {
  const ink = document.getElementById('ink');
  const ripple = document.getElementById('ripple');
  const ctx = ink.getContext('2d');
  const rctx = ripple.getContext('2d');

  const PAPER = [243, 237, 225];
  // 水彩顏料：群青、胭脂、藤黃、青綠、墨
  const PIGMENTS = [
    [28, 66, 168],
    [186, 28, 66],
    [226, 150, 14],
    [0, 122, 112],
    [38, 34, 40],
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX_BRANCHES = 700;

  let W = 0, H = 0, dpr = 1;
  let branches = [];
  let blooms = [];
  let rings = [];
  let lastDrop = 0;
  let frame = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const jitter = (c, n) => c.map((v) => clamp(Math.round(v + rand(-n, n)), 0, 255));

  function resize() {
    const old = document.createElement('canvas');
    old.width = ink.width;
    old.height = ink.height;
    if (ink.width && ink.height) old.getContext('2d').drawImage(ink, 0, 0);

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    for (const c of [ink, ripple]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = rgba(PAPER, 1);
    ctx.fillRect(0, 0, W, H);
    if (old.width && old.height) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(old, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // ── 一滴顏料 ─────────────────────────────────────────
  function drop(x, y) {
    lastDrop = performance.now();
    const scale = clamp(Math.min(W, H) / 800, 0.55, 1.4);
    const color = pick(PIGMENTS);

    blooms.push({
      x, y, color,
      r: 2,
      R: rand(18, 34) * scale,
      t: 0,
    });

    rings.push({ x, y, t: 0, max: rand(90, 150) * scale, color });

    // 主枝：大致平均分布在一圈，再加一點隨機
    const n = (rand(5, 9) | 0);
    const offset = rand(0, Math.PI * 2);
    for (let i = 0; i < n; i++) {
      const a = offset + (i / n) * Math.PI * 2 + rand(-0.35, 0.35);
      spawn({
        x: x + Math.cos(a) * 6 * scale,
        y: y + Math.sin(a) * 6 * scale,
        angle: a,
        width: rand(4, 7.5) * scale,
        speed: rand(1.8, 2.8) * scale,
        life: rand(170, 280),
        color: jitter(color, 14),
        gen: 0,
        scale,
      });
    }

    if (reduceMotion) {
      // 不播動畫：直接把整個擴散算完畫出來
      for (let i = 0; i < 600 && (branches.length || blooms.length); i++) step(false);
    }
  }

  function spawn(b) {
    if (branches.length >= MAX_BRANCHES) return;
    b.age = 0;
    b.curve = 0;
    b.alpha = rand(0.1, 0.17);
    branches.push(b);
  }

  // ── 每一步的擴散 ─────────────────────────────────────
  function stepBranch(b) {
    const t = b.age / b.life;
    // 擴散越到後面越慢，像顏料被水吃開、力道漸弱
    const v = b.speed * (Math.pow(1 - t, 0.6) + 0.15);

    // 大致直行、偶爾轉折：像樹枝或河道，而不是捲曲的毛線
    b.curve += rand(-0.035, 0.035);
    b.curve *= 0.8;
    b.angle += b.curve;
    if (Math.random() < 0.025) b.angle += rand(-0.45, 0.45);

    const nx = b.x + Math.cos(b.angle) * v;
    const ny = b.y + Math.sin(b.angle) * v;

    // 主線
    ctx.strokeStyle = rgba(b.color, b.alpha * (1 - t * 0.5));
    ctx.lineWidth = b.width;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    // 外圍的水暈：較寬、極淡
    if (b.gen < 2 && b.age % 4 === 0) {
      ctx.fillStyle = rgba(b.color, 0.012);
      ctx.beginPath();
      ctx.arc(nx, ny, b.width * 2.4 + 3, 0, Math.PI * 2);
      ctx.fill();
    }

    b.x = nx;
    b.y = ny;
    b.age++;
    b.width *= 0.991;

    // 分岔：越細、越後代越少分岔
    const p = 0.045 * Math.pow(0.8, b.gen) * (1 - t * 0.5);
    if (b.width > 0.6 && b.gen < 6 && Math.random() < p) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const spread = rand(0.3, 0.75);
      spawn({
        x: b.x, y: b.y,
        angle: b.angle + side * spread,
        width: b.width * rand(0.5, 0.75),
        speed: b.speed * rand(0.75, 0.95),
        life: (b.life - b.age) * rand(0.45, 0.85) + 15,
        color: jitter(b.color, 8),
        gen: b.gen + 1,
        scale: b.scale,
      });
      b.width *= 0.85;
      b.angle -= side * spread * 0.35; // 母枝往反方向讓一點，形成 Y 字
    }

    return b.age < b.life && b.width > 0.35 && b.x > -50 && b.x < W + 50 && b.y > -50 && b.y < H + 50;
  }

  function stepBloom(m) {
    m.t++;
    m.r += (m.R - m.r) * 0.06;
    // 中心幾個略為偏移的圓疊在一起，邊緣才不會太工整
    for (let i = 0; i < 4; i++) {
      const a = rand(0, Math.PI * 2);
      const d = m.r * rand(0, 0.35);
      ctx.fillStyle = rgba(m.color, 0.02);
      ctx.beginPath();
      ctx.arc(m.x + Math.cos(a) * d, m.y + Math.sin(a) * d, m.r * rand(0.45, 1), 0, Math.PI * 2);
      ctx.fill();
    }
    return m.t < 45;
  }

  function step(drawRipples = true) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineCap = 'round';
    blooms = blooms.filter(stepBloom);
    // 用索引走訪，讓這一步新長出的分枝也能立刻開始
    const next = [];
    for (let i = 0; i < branches.length; i++) {
      if (stepBranch(branches[i])) next.push(branches[i]);
    }
    branches = next;
    ctx.globalCompositeOperation = 'source-over';

    // 紙很慢地「乾掉」，舊的痕跡留下淡淡的漬
    frame++;
    if (frame % 10 === 0) {
      ctx.fillStyle = rgba(PAPER, 0.022);
      ctx.fillRect(0, 0, W, H);
    }

    if (drawRipples) drawRings();
  }

  function drawRings() {
    rctx.clearRect(0, 0, W, H);
    rings = rings.filter((g) => {
      g.t++;
      const p = g.t / 90;
      if (p >= 1) return false;
      for (let k = 0; k < 3; k++) {
        const q = p - k * 0.12;
        if (q <= 0) continue;
        const r = g.max * (1 - Math.pow(1 - q, 3));
        rctx.strokeStyle = rgba(g.color, 0.28 * (1 - q) * (1 - k * 0.3));
        rctx.lineWidth = 1.4 * (1 - q) + 0.3;
        rctx.beginPath();
        rctx.arc(g.x, g.y, r, 0, Math.PI * 2);
        rctx.stroke();
      }
      return true;
    });
  }

  function loop() {
    step();
    // 一段時間沒有人點，就自己滴一滴
    if (performance.now() - lastDrop > rand(4500, 7000) && branches.length < 80) {
      autoDrop();
    }
    requestAnimationFrame(loop);
  }

  function autoDrop() {
    const m = Math.min(W, H) * 0.15;
    drop(rand(m, W - m), rand(m, H - m));
  }

  // ── 互動 ─────────────────────────────────────────────
  window.addEventListener('pointerdown', (e) => drop(e.clientX, e.clientY));
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); autoDrop(); }
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  // 開場：幾滴錯開落下
  drop(W * 0.5, H * 0.48);
  setTimeout(() => drop(W * rand(0.2, 0.32), H * rand(0.25, 0.4)), reduceMotion ? 0 : 900);
  setTimeout(() => drop(W * rand(0.68, 0.8), H * rand(0.6, 0.75)), reduceMotion ? 0 : 1800);

  if (!reduceMotion) requestAnimationFrame(loop);
})();
