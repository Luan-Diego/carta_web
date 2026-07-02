import { TAU, glow, pick, rand } from './util.js';

// Jardim: sol com raios girando, nuvens à deriva, colinas em camadas, flores que
// crescem e balançam, grama ao vento, borboletas que seguem o ponteiro e pólen
// subindo. O ponteiro sopra as flores; tocar planta uma flor nova e chama uma borboleta.
export default function garden(w, h) {
  let t = 0, par = 0;
  let flowers = [], grass = [], clouds = [], flies = [], pollen = [];
  const PETALS = ['#ff8fb1', '#ffd166', '#ffffff', '#c792ff', '#ff7b54', '#7ad7f0', '#ff6f91'];
  const WINGS = [['#ff9e5e', '#ffd166'], ['#7ab8ff', '#c9e4ff'], ['#ff8fb1', '#ffd0e0'], ['#b79bff', '#e3d9ff']];
  const HILLS = [['#c4e8bb', 0.66], ['#a3d79d', 0.74], ['#7fc582', 0.83]];

  const plant = (x, topY, delay = 0) => ({
    x, base: h * rand(0.9, 1.02), topY, g: 0, delay,
    speed: rand(0.2, 0.38),
    lean: rand(-26, 26),
    color: pick(PETALS),
    n: pick([5, 6, 7, 8]),
    size: rand(11, 20),
    ph: rand(TAU),
    bend: 0,
  });
  const fly = () => {
    const c = pick(WINGS);
    return { x: rand(w), y: rand(h * 0.3, h * 0.8), ph: rand(TAU), sp: rand(0.5, 0.9), c1: c[0], c2: c[1], s: rand(7, 11) };
  };
  const build = () => {
    flowers = Array.from({ length: 12 }, (_, i) => plant(((i + 0.5) / 12) * w + rand(-24, 24), rand(h * 0.42, h * 0.8), i * 0.22));
    grass = Array.from({ length: Math.round(w / 8) }, () => ({ x: rand(w), len: rand(16, 50), ph: rand(TAU), tone: rand(0.7, 1.1) }));
    clouds = Array.from({ length: 4 }, (_, i) => ({ x: rand(w), y: h * (0.08 + 0.09 * i) + rand(-10, 10), s: rand(0.8, 1.5), v: rand(5, 14) }));
    flies = Array.from({ length: 3 }, fly);
    pollen = Array.from({ length: 36 }, () => ({ x: rand(w), y: rand(h), r: rand(1, 2.6), ph: rand(TAU), v: rand(8, 22) }));
  };
  build();

  const hillY = (k, x) => h * HILLS[k][1] + Math.sin(x * 0.0042 + k * 2.3 + par * 1.2) * h * 0.028 + Math.sin(x * 0.011 + k * 1.1) * h * 0.011;

  const bloom = (ctx, f, x, y, k) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.8 + f.ph) * 0.15);
    ctx.scale(k, k);
    for (let i = 0; i < f.n; i++) {
      ctx.save();
      ctx.rotate((i / f.n) * TAU);
      const g = ctx.createLinearGradient(0, 0, 0, -f.size * 1.25);
      g.addColorStop(0, 'rgba(255,255,255,.55)');
      g.addColorStop(0.35, f.color);
      g.addColorStop(1, f.color);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, -f.size * 0.62, f.size * 0.36, f.size * 0.62, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#ffcf4a';
    ctx.beginPath(); ctx.arc(0, 0, f.size * 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(180,90,0,.35)';
    ctx.beginPath(); ctx.arc(f.size * 0.07, f.size * 0.07, f.size * 0.13, 0, TAU); ctx.fill();
    ctx.restore();
  };

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
      ctx.restore();
    }
    ctx.fillStyle = '#4a3a30';
    ctx.fillRect(-1, -b.s * 0.7, 2, b.s * 1.4);
    ctx.restore();
  };

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
        // passeia em curvas; se o ponteiro estiver na tela, vai até ele
        let gx = w * (0.5 + 0.42 * Math.sin(t * b.sp * 0.6 + b.ph)), gy = h * (0.5 + 0.28 * Math.sin(t * b.sp * 0.9 + b.ph * 2));
        if (ptr.x > -1000) { gx = ptr.x + Math.sin(t * 2 + b.ph) * 50; gy = ptr.y + Math.cos(t * 2.3 + b.ph) * 40; }
        b.vx = (gx - b.x) * 0.9 + Math.sin(t * 5 + b.ph) * 30;
        b.vy = (gy - b.y) * 0.9 + Math.cos(t * 4 + b.ph) * 30;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
    },
    draw(ctx) {
      // sol
      const sx = w * 0.84, sy = h * 0.17;
      glow(ctx, sx, sy, h * 0.4, '255,236,160', 0.5);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.12);
      ctx.fillStyle = 'rgba(255,230,130,.22)';
      for (let i = 0; i < 12; i++) {
        ctx.rotate(TAU / 12);
        ctx.beginPath(); ctx.moveTo(h * 0.07, -h * 0.012); ctx.lineTo(h * 0.2, 0); ctx.lineTo(h * 0.07, h * 0.012); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = '#fff4b8';
      ctx.beginPath(); ctx.arc(sx, sy, h * 0.055, 0, TAU); ctx.fill();
      // nuvens
      for (const c of clouds) {
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        const u = 26 * c.s;
        for (const [dx, dy, r] of [[0, 0, 1], [-1.1, 0.25, 0.75], [1.1, 0.25, 0.8], [0.45, -0.55, 0.8], [-0.5, -0.4, 0.7]]) {
          ctx.beginPath(); ctx.arc(c.x + dx * u, c.y + dy * u, r * u, 0, TAU); ctx.fill();
        }
      }
      // colinas
      HILLS.forEach(([color], k) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, hillY(k, x));
        ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      });
      // pólen
      for (const p of pollen) {
        glow(ctx, p.x, p.y, p.r * 4, '255,240,170', 0.35 + 0.25 * Math.sin(t * 2 + p.ph));
      }
      ctx.lineCap = 'round';
      for (const b of grass) {
        const sw = Math.sin(t * 1.5 + b.ph) * 7;
        ctx.strokeStyle = `hsl(${105 + b.tone * 20},45%,${34 + b.tone * 14}%)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(b.x, h); ctx.quadraticCurveTo(b.x + sw * 0.3, h - b.len * 0.6, b.x + sw, h - b.len); ctx.stroke();
      }
      const sorted = flowers.slice().sort((a, b) => a.base - b.base);
      for (const f of sorted) {
        if (f.g <= 0) continue;
        const k = 1 - Math.pow(1 - f.g, 3);
        const height = (f.base - f.topY) * k;
        const sway = Math.sin(t * 1.2 + f.ph) * 7 + f.bend;
        const tx = f.x + f.lean * k + sway, ty = f.base - height;
        const cx = f.x + f.lean * 0.2 + sway * 0.2, cy = f.base - height * 0.55;
        ctx.strokeStyle = '#4c9a52';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(f.x, f.base); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.stroke();
        if (k > 0.4) {
          const lx = (f.x + cx) / 2 + sway * 0.1, ly = f.base - height * 0.35;
          ctx.fillStyle = '#5fb166';
          for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(lx + s * 9, ly, 9, 3.6, s * -0.5, 0, TAU); ctx.fill(); }
        }
        const open = Math.max(0, (f.g - 0.65) / 0.35);
        if (open > 0) bloom(ctx, f, tx, ty, 1 - Math.pow(1 - open, 3));
        else { ctx.fillStyle = '#6cbc6f'; ctx.beginPath(); ctx.arc(tx, ty, 3 + f.g * 3, 0, TAU); ctx.fill(); }
      }
      for (const b of flies) butterfly(ctx, b);
    },
  };
}
