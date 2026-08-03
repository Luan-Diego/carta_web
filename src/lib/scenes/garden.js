import { TAU, glow, pick, rand } from './util.js';

// Jardim: sol e nuvens, colinas com névoa e arbustos, flores de três tipos
// (cosmos, margarida, tulipa) com folhas nervuradas, grama em duas camadas,
// pólen e borboletas que seguem o ponteiro. O ponteiro sopra as flores;
// tocar planta uma flor nova e chama uma borboleta.
export default function garden(w, h) {
  let t = 0, par = 0;
  let flowers = [], grassBack = [], grassFront = [], clouds = [], flies = [], pollen = [], bushes = [];
  const COSMOS = ['#ff8fb1', '#ffd166', '#c792ff', '#ff7b54', '#7ad7f0', '#ff6f91'];
  const TULIP = ['#ff5d73', '#ffb347', '#ff8fa3', '#e63946', '#ffd166'];
  const WINGS = [['#ff9e5e', '#ffd166'], ['#7ab8ff', '#c9e4ff'], ['#ff8fb1', '#ffd0e0'], ['#b79bff', '#e3d9ff']];
  const HILLS = [['#bfe2c8', 0.64], ['#a5d6a0', 0.73], ['#83c685', 0.83]];

  const plant = (x, topY, delay = 0) => {
    const tipo = pick(['cosmos', 'margarida', 'tulipa', 'cosmos', 'margarida']);
    return {
      tipo, x, base: h * rand(0.9, 1.02), topY, g: 0, delay,
      speed: rand(0.2, 0.38), lean: rand(-26, 26),
      color: tipo === 'tulipa' ? pick(TULIP) : tipo === 'margarida' ? '#ffffff' : pick(COSMOS),
      n: tipo === 'margarida' ? 14 : pick([6, 7, 8]),
      size: rand(11, 20), ph: rand(TAU), bend: 0, leaves: [rand(0.3, 0.45), rand(0.5, 0.65)],
    };
  };
  const fly = () => {
    const c = pick(WINGS);
    return { x: rand(w), y: rand(h * 0.3, h * 0.8), ph: rand(TAU), sp: rand(0.5, 0.9), c1: c[0], c2: c[1], s: rand(7, 11) };
  };
  const build = () => {
    flowers = Array.from({ length: 13 }, (_, i) => plant(((i + 0.5) / 13) * w + rand(-24, 24), rand(h * 0.42, h * 0.8), i * 0.2));
    grassBack = Array.from({ length: Math.round(w / 7) }, () => ({ x: rand(w), len: rand(14, 34), ph: rand(TAU), tone: rand(0, 1) }));
    grassFront = Array.from({ length: Math.round(w / 11) }, () => ({ x: rand(w), len: rand(28, 70), ph: rand(TAU), tone: rand(0, 1) }));
    clouds = Array.from({ length: 4 }, (_, i) => ({ x: rand(w), y: h * (0.08 + 0.09 * i) + rand(-10, 10), s: rand(0.8, 1.5), v: rand(5, 14) }));
    flies = Array.from({ length: 3 }, fly);
    pollen = Array.from({ length: 36 }, () => ({ x: rand(w), y: rand(h), r: rand(1, 2.6), ph: rand(TAU), v: rand(8, 22) }));
    bushes = Array.from({ length: Math.max(6, Math.round(w / 70)) }, () => ({ x: rand(w), s: rand(0.7, 1.4), ph: rand(TAU), tone: rand(0, 1), k: pick([0, 1, 1]) }));
  };
  build();

  const hillY = (k, x) => h * HILLS[k][1] + Math.sin(x * 0.0042 + k * 2.3 + par * 1.2) * h * 0.028 + Math.sin(x * 0.011 + k * 1.1) * h * 0.011;

  // folha com nervura central e degradê (escura na base, clara na ponta)
  function leaf(ctx, x, y, ang, len, wid, light = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, `hsl(128,45%,${26 + light}%)`);
    g.addColorStop(1, `hsl(104,52%,${46 + light}%)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.3, -wid, len * 0.8, -wid * 0.7, len, 0);
    ctx.bezierCurveTo(len * 0.8, wid * 0.7, len * 0.3, wid, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,255,210,.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.92, 0);
    for (let i = 1; i <= 3; i++) {
      const px = len * (0.18 + i * 0.2);
      ctx.moveTo(px, 0); ctx.lineTo(px + len * 0.12, -wid * 0.4);
      ctx.moveTo(px, 0); ctx.lineTo(px + len * 0.12, wid * 0.4);
    }
    ctx.stroke();
    ctx.restore();
  }

  function petal(ctx, size, color, len, wid) {
    const g = ctx.createLinearGradient(0, 0, 0, -len);
    g.addColorStop(0, 'rgba(255,255,255,.65)');
    g.addColorStop(0.3, color);
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -len / 2, wid, len / 2, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.08)';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(0, -size * 0.15); ctx.lineTo(0, -len * 0.85); ctx.stroke();
  }

  function bloom(ctx, f, x, y, k) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.8 + f.ph) * 0.15);
    ctx.scale(k, k);
    if (f.tipo === 'tulipa') {
      const s = f.size;
      for (const [dx, sc, shade] of [[-s * 0.32, 0.95, 0.85], [s * 0.32, 0.95, 0.85], [0, 1.1, 1]]) {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.moveTo(dx * 0.5, s * 0.5);
        ctx.bezierCurveTo(dx - s * 0.6, s * 0.1, dx - s * 0.35, -s * 1.1 * sc, dx, -s * 1.2 * sc);
        ctx.bezierCurveTo(dx + s * 0.35, -s * 1.1 * sc, dx + s * 0.6, s * 0.1, dx * 0.5, s * 0.5);
        ctx.fill();
        ctx.fillStyle = `rgba(0,0,0,${(1 - shade) * 0.5})`;
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      ctx.beginPath(); ctx.ellipse(-s * 0.1, -s * 0.5, s * 0.1, s * 0.4, 0.2, 0, TAU); ctx.fill();
    } else if (f.tipo === 'margarida') {
      for (let i = 0; i < f.n; i++) {
        ctx.save(); ctx.rotate((i / f.n) * TAU);
        petal(ctx, f.size, '#ffffff', f.size * 1.35, f.size * 0.17);
        ctx.restore();
      }
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, f.size * 0.38);
      g.addColorStop(0, '#ffe36b'); g.addColorStop(1, '#e8a100');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, f.size * 0.36, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(150,80,0,.35)';
      for (let i = 0; i < 7; i++) { const a = i * 2.4; ctx.beginPath(); ctx.arc(Math.cos(a) * f.size * 0.18, Math.sin(a) * f.size * 0.18, 1, 0, TAU); ctx.fill(); }
    } else {
      for (let i = 0; i < f.n; i++) {
        ctx.save(); ctx.rotate((i / f.n) * TAU);
        petal(ctx, f.size, f.color, f.size * 1.25, f.size * 0.36);
        ctx.restore();
      }
      ctx.fillStyle = '#ffcf4a';
      ctx.beginPath(); ctx.arc(0, 0, f.size * 0.28, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(180,90,0,.35)';
      ctx.beginPath(); ctx.arc(f.size * 0.06, f.size * 0.06, f.size * 0.12, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  const butterfly = (ctx, b) => {
    const flap = Math.abs(Math.sin(t * 14 + b.ph));
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy || 0, b.vx || 1) * 0.3 + Math.sin(t * 3 + b.ph) * 0.15);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side * (0.25 + flap * 0.75), 1);
      ctx.fillStyle = b.c1;
      ctx.beginPath(); ctx.ellipse(b.s * 0.55, -b.s * 0.35, b.s * 0.6, b.s * 0.85, -0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = b.c2;
      ctx.beginPath(); ctx.ellipse(b.s * 0.4, b.s * 0.45, b.s * 0.4, b.s * 0.55, 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.arc(b.s * 0.6, -b.s * 0.4, b.s * 0.12, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#4a3a30';
    ctx.fillRect(-1, -b.s * 0.7, 2, b.s * 1.4);
    ctx.restore();
  };

  function blade(ctx, b, wBase, color) {
    const sw = Math.sin(t * 1.5 + b.ph) * 7 + par * 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(b.x - wBase, h);
    ctx.quadraticCurveTo(b.x - wBase + sw * 0.3, h - b.len * 0.6, b.x + sw, h - b.len);
    ctx.quadraticCurveTo(b.x + wBase + sw * 0.3, h - b.len * 0.6, b.x + wBase, h);
    ctx.fill();
  }

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x, y) {
      flowers.push(plant(x, Math.min(h * 0.85, Math.max(h * 0.3, y))));
      if (flowers.length > 40) flowers.shift();
      if (flies.length < 8) { const b = fly(); b.x = x; b.y = y; flies.push(b); }
    },
    step(dt, ptr) {
      t += dt;
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 1.5);
      for (const c of clouds) { c.x -= c.v * dt; if (c.x < -160) { c.x = w + 160; c.y = h * rand(0.06, 0.4); } }
      for (const p of pollen) { p.y -= p.v * dt; p.x += Math.sin(t + p.ph) * 12 * dt; if (p.y < -10) { p.y = h + 10; p.x = rand(w); } }
      for (const f of flowers) {
        if (f.delay > 0) { f.delay -= dt; continue; }
        f.g = Math.min(1, f.g + f.speed * dt);
        const d = Math.abs(f.x - ptr.x);
        if (ptr.x > -1000 && d < 200) f.bend += ptr.vx * 0.0012 * (1 - d / 200) * dt * 60;
        f.bend *= Math.exp(-2.2 * dt);
        f.bend = Math.max(-60, Math.min(60, f.bend));
      }
      for (const b of flies) {
        let gx = w * (0.5 + 0.42 * Math.sin(t * b.sp * 0.6 + b.ph)), gy = h * (0.5 + 0.28 * Math.sin(t * b.sp * 0.9 + b.ph * 2));
        if (ptr.x > -1000) { gx = ptr.x + Math.sin(t * 2 + b.ph) * 50; gy = ptr.y + Math.cos(t * 2.3 + b.ph) * 40; }
        b.vx = (gx - b.x) * 0.9 + Math.sin(t * 5 + b.ph) * 30;
        b.vy = (gy - b.y) * 0.9 + Math.cos(t * 4 + b.ph) * 30;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
    },
    draw(ctx) {
      // sol
      const sx = w * 0.84, sy = h * 0.17;
      glow(ctx, sx, sy, h * 0.42, '255,236,160', 0.5);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.12);
      ctx.fillStyle = 'rgba(255,230,130,.2)';
      for (let i = 0; i < 12; i++) {
        ctx.rotate(TAU / 12);
        ctx.beginPath(); ctx.moveTo(h * 0.07, -h * 0.012); ctx.lineTo(h * 0.2, 0); ctx.lineTo(h * 0.07, h * 0.012); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = '#fff4b8';
      ctx.beginPath(); ctx.arc(sx, sy, h * 0.055, 0, TAU); ctx.fill();
      // nuvens (círculos opacos num canvas próprio evitam emendas visíveis)
      for (const c of clouds) {
        const u = 26 * c.s;
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        for (const [dx, dy, r] of [[0, 0, 1], [-1.1, 0.25, 0.75], [1.1, 0.25, 0.8], [0.45, -0.55, 0.8], [-0.5, -0.4, 0.7]]) {
          ctx.beginPath(); ctx.arc(c.x + dx * u, c.y + dy * u, r * u, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = 'rgba(190,210,235,.35)';
        ctx.beginPath(); ctx.ellipse(c.x, c.y + u * 0.55, u * 1.9, u * 0.3, 0, 0, TAU); ctx.fill();
      }
      // colinas, com névoa entre elas e arbustos
      HILLS.forEach(([color], k) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, hillY(k, x));
        ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
        for (const b of bushes) {
          if (b.k !== k) continue;
          const by = hillY(k, b.x) + 4;
          for (let i = 0; i < 9; i++) {
            const a = -Math.PI / 2 + (i - 4) * 0.34 + Math.sin(t * 0.9 + b.ph + i) * 0.05;
            ctx.save(); ctx.translate(b.x, by); ctx.rotate(a);
            ctx.fillStyle = `hsl(${112 + b.tone * 15},${40 + k * 8}%,${36 + b.tone * 10 + i % 3 * 3}%)`;
            ctx.beginPath(); ctx.ellipse(12 * b.s, 0, 13 * b.s, 5 * b.s, 0, 0, TAU); ctx.fill();
            ctx.restore();
          }
        }
        if (k < 2) {
          const mist = ctx.createLinearGradient(0, h * HILLS[k][1], 0, h * (HILLS[k][1] + 0.12));
          mist.addColorStop(0, 'rgba(255,255,255,.28)');
          mist.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = mist;
          ctx.fillRect(0, h * HILLS[k][1] - 4, w, h * 0.14);
        }
      });
      for (const p of pollen) glow(ctx, p.x, p.y, p.r * 4, '255,240,170', 0.35 + 0.25 * Math.sin(t * 2 + p.ph));
      for (const b of grassBack) blade(ctx, b, 1.6, `hsl(${112 + b.tone * 14},42%,${27 + b.tone * 8}%)`);

      const sorted = flowers.slice().sort((a, b) => a.base - b.base);
      for (const f of sorted) {
        if (f.g <= 0) continue;
        const k = 1 - Math.pow(1 - f.g, 3);
        const height = (f.base - f.topY) * k;
        const sway = Math.sin(t * 1.2 + f.ph) * 7 + f.bend;
        const tx = f.x + f.lean * k + sway, ty = f.base - height;
        const cx = f.x + f.lean * 0.2 + sway * 0.2, cy = f.base - height * 0.55;
        const sg = ctx.createLinearGradient(0, f.base, 0, ty);
        sg.addColorStop(0, '#2f7a3d'); sg.addColorStop(1, '#68b85b');
        ctx.strokeStyle = sg; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(f.x, f.base); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.stroke();
        f.leaves.forEach((pos, i) => {
          if (k < pos + 0.1) return;
          const u = pos, mt = 1 - u;
          const lx = mt * mt * f.x + 2 * mt * u * cx + u * u * tx, ly = mt * mt * f.base + 2 * mt * u * cy + u * u * ty;
          const side = i % 2 ? 1 : -1, sz = Math.min(1, (k - pos) * 3);
          leaf(ctx, lx, ly, side > 0 ? -0.5 + Math.sin(t * 1.3 + f.ph) * 0.06 : Math.PI + 0.5 - Math.sin(t * 1.3 + f.ph) * 0.06, 30 * sz, 8 * sz, i * 4);
        });
        const open = Math.max(0, (f.g - 0.65) / 0.35);
        if (open > 0) bloom(ctx, f, tx, ty, 1 - Math.pow(1 - open, 3));
        else { ctx.fillStyle = '#6cbc6f'; ctx.beginPath(); ctx.arc(tx, ty, 3 + f.g * 3, 0, TAU); ctx.fill(); }
      }
      for (const b of grassFront) blade(ctx, b, 2.4, `hsl(${100 + b.tone * 20},50%,${34 + b.tone * 14}%)`);
      for (const b of flies) butterfly(ctx, b);
    },
  };
}
