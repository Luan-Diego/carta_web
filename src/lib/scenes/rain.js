import { TAU, blend, density, pick, rand } from './util.js';

// Chuva na janela: luzes desfocadas ao fundo e gotas no vidro, algumas escorrendo
// e deixando rastro. Passar o dedo/mouse "limpa" o vidro; tocar solta uma gota.
export default function rain(w, h, dark) {
  let t = 0, spawn = 0;
  let still = [];
  let sliders = [];
  const lights = [];
  const COLORS = ['255,200,120', '255,130,100', '130,180,255', '170,255,210', '255,230,170'];

  const build = () => {
    const f = density(w, h);
    still = Array.from({ length: Math.round(150 * f) }, () => ({ x: rand(w), y: rand(h), r: rand(1.6, 4.2) }));
    lights.length = 0;
    for (let i = 0; i < 14; i++) lights.push({ x: rand(w), y: rand(h * 0.2, h), r: rand(30, 90), c: pick(COLORS), ph: rand(TAU) });
  };
  build();

  const slider = (x = rand(w), y = rand(-20, h * 0.5), r = rand(3.6, 6.8)) => ({
    x, y, r, vy: 0, v: rand(40, 90), moving: Math.random() < 0.5, wait: rand(0.1, 0.8), seed: rand(TAU), tr: [],
  });

  const drop = (ctx, x, y, r) => {
    if (r < 2) {
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      return;
    }
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.95)');
    g.addColorStop(0.35, 'rgba(255,255,255,.2)');
    g.addColorStop(1, 'rgba(0,0,0,.38)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  };

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x, y) { const s = slider(x, y, 6.5); s.moving = true; s.wait = 1; sliders.push(s); },
    step(dt, ptr) {
      t += dt; spawn -= dt;
      if (spawn <= 0 && sliders.length < 15 * density(w, h)) { sliders.push(slider(rand(w), -10)); spawn = rand(0.3, 0.9); }
      for (const s of sliders) {
        s.wait -= dt;
        if (s.wait <= 0) { s.moving = !s.moving; s.wait = s.moving ? rand(0.25, 0.9) : rand(0.3, 1.4); }
        s.vy += ((s.moving ? s.v : 0) - s.vy) * Math.min(1, dt * 6);
        const oy = s.y;
        s.y += s.vy * dt;
        s.x += Math.sin(s.y * 0.05 + s.seed) * 8 * dt;
        s.r -= (s.vy / 90) * 0.12 * dt;
        const last = s.tr[s.tr.length - 1];
        if (!last || Math.abs(s.y - last.y) > 5) s.tr.push({ x: s.x, y: s.y });
        if (s.tr.length > 26) s.tr.shift();
        if (s.y === oy && s.tr.length > 1 && !s.moving) s.tr.shift();
      }
      sliders = sliders.filter((s) => s.y < h + 20 && s.r > 2.2);
      if (ptr.x > -1000 && Math.hypot(ptr.vx, ptr.vy) > 40) {
        const gone = (p) => Math.hypot(p.x - ptr.x, p.y - ptr.y) < 46;
        still = still.filter((p) => !gone(p));
        sliders = sliders.filter((p) => !gone(p));
      }
      while (still.length < 150 * density(w, h)) still.push({ x: rand(w), y: rand(h), r: rand(1.6, 4.2) });
    },
    draw(ctx) {
      blend(ctx, true);
      for (const l of lights) {
        const a = (dark ? 0.2 : 0.12) * (0.75 + 0.25 * Math.sin(t * 0.7 + l.ph));
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        g.addColorStop(0, `rgba(${l.c},${a})`);
        g.addColorStop(0.7, `rgba(${l.c},${a * 0.6})`);
        g.addColorStop(1, `rgba(${l.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      for (const s of sliders) {
        if (s.tr.length > 1) {
          ctx.strokeStyle = 'rgba(255,255,255,.13)';
          ctx.lineWidth = Math.max(1, s.r * 0.55);
          ctx.beginPath();
          s.tr.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          ctx.stroke();
        }
      }
      for (const p of still) drop(ctx, p.x, p.y, p.r);
      for (const s of sliders) drop(ctx, s.x, s.y, s.r);
    },
  };
}
