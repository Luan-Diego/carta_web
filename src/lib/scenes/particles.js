import { TAU, blend, density, glow, near, rand, rotStr, tintDelta } from './util.js';

// Partículas flutuantes: orbes luminosos que sobem devagar, fogem do dedo/mouse
// e se ligam por linhas finas quando ficam perto. Toque: explosão de partículas.
export default function particles(w, h, dark, hue) {
  const d = tintDelta(hue, 200);
  const base = dark ? [[190, 225, 255], [255, 210, 255], [200, 255, 240]] : [[60, 160, 225], [110, 140, 235], [50, 190, 190]];
  const rgbs = base.map((c) => rotStr(c, d));
  const total = () => Math.round(100 * density(w, h));
  let list = [];
  let t = 0;

  const make = (x = rand(w), y = rand(h)) => ({
    x, y, bx: 0, by: 0,
    r: rand(2, 6.5),
    vx: rand(-14, 14),
    vy: rand(-55, -18),
    ph: rand(TAU),
    rgb: rgbs[Math.floor(Math.random() * rgbs.length)],
    a: rand(0.4, 0.85) * (dark ? 1 : 1.5),
    ttl: 0, // 0 = permanente
  });
  const fill = () => {
    const base = list.filter((p) => !p.ttl);
    while (base.length < total()) base.push(make());
    list = base.slice(0, total()).concat(list.filter((p) => p.ttl));
  };
  fill();

  return {
    resize(nw, nh) { w = nw; h = nh; fill(); },
    tap(x, y) {
      for (let i = 0; i < 18; i++) {
        const a = rand(TAU), v = rand(60, 220);
        const p = make(x, y);
        p.bx = Math.cos(a) * v; p.by = Math.sin(a) * v; p.ttl = 4;
        list.push(p);
      }
    },
    step(dt, ptr) {
      t += dt;
      const decay = Math.exp(-2.2 * dt);
      for (const p of list) {
        p.x += (p.vx + Math.sin(t * 0.9 + p.ph) * 22 + p.bx) * dt;
        p.y += (p.vy + p.by) * dt;
        p.bx *= decay; p.by *= decay;
        const n = near(ptr, p.x, p.y, 150);
        if (n) { p.x += n.dx * n.k * 280 * dt; p.y += n.dy * n.k * 280 * dt; }
        if (p.ttl) p.ttl -= dt;
        if (!p.ttl && p.y < -20) { p.y = h + 20; p.x = rand(w); }
        if (!p.ttl) { if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20; }
      }
      list = list.filter((p) => !p.ttl || p.ttl > 0);
    },
    draw(ctx) {
      blend(ctx, dark);
      ctx.lineWidth = 1;
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 7000) {
            ctx.strokeStyle = `rgba(${a.rgb},${(1 - d2 / 7000) * 0.22})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of list) {
        const fade = p.ttl ? Math.min(1, p.ttl) : 1;
        const a = p.a * (0.65 + 0.35 * Math.sin(t * 2 + p.ph)) * fade;
        glow(ctx, p.x, p.y, p.r * 4, p.rgb, a * 0.55);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.45, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
