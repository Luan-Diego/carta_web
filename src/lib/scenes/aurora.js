import { TAU, blend, clamp, rand, rotStr, tintDelta } from './util.js';

// Aurora boreal: três cortinas de luz ondulantes. O ponteiro desloca as ondas;
// um toque faz a aurora brilhar mais por um instante.
export default function aurora(w, h, dark, hue) {
  const d = tintDelta(hue, 150);
  let t = 0, glowK = 0, par = 0, stars = [];
  const bands = [
    { c: rotStr([60, 255, 170], d), k: 0, a: 0.6 },
    { c: rotStr([70, 190, 255], d), k: 1, a: 0.45 },
    { c: rotStr([180, 110, 255], d), k: 2, a: 0.4 },
  ];
  const build = () => {
    const n = Math.round(clamp((w * h) / 12000, 40, 120));
    stars = Array.from({ length: n }, () => ({ x: rand(w), y: rand(h * 0.7), r: rand(0.4, 1.3), ph: rand(TAU) }));
  };
  build();

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap() { glowK = 1; },
    step(dt, ptr) {
      t += dt;
      glowK = Math.max(0, glowK - dt * 0.7);
      const target = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (target - par) * Math.min(1, dt * 2);
    },
    draw(ctx) {
      const rgb = dark ? '255,255,255' : '60,70,130';
      for (const s of stars) {
        ctx.fillStyle = `rgba(${rgb},${0.25 + 0.5 * Math.abs(Math.sin(t + s.ph))})`;
        ctx.fillRect(s.x, s.y, s.r * 1.6, s.r * 1.6);
      }
      blend(ctx, dark);
      const STEP = 10, n = Math.ceil(w / STEP) + 1;
      for (const b of bands) {
        const base = h * (0.3 + 0.09 * b.k), amp = h * 0.07, hgt = h * (0.3 + 0.04 * b.k);
        const shift = par * 140 * (1 + 0.5 * b.k);
        const top = [], bot = [];
        for (let i = 0; i < n; i++) {
          const x = i * STEP + shift;
          const yb = base + Math.sin(x * 0.0045 + t * 0.35 + b.k * 2.1) * amp + Math.sin(x * 0.0123 - t * 0.6 + b.k) * amp * 0.35;
          const hh = hgt * (0.7 + 0.3 * Math.sin(x * 0.007 + t * 0.25 + b.k * 1.7));
          bot.push(yb); top.push(yb - hh);
        }
        const a = b.a * (1 + glowK * 0.7);
        const g = ctx.createLinearGradient(0, base - hgt * 1.1, 0, base + amp * 1.4);
        g.addColorStop(0, `rgba(${b.c},0)`);
        g.addColorStop(0.55, `rgba(${b.c},${a * 0.3})`);
        g.addColorStop(1, `rgba(${b.c},${a * 0.75})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, top[0]);
        for (let i = 1; i < n; i++) ctx.lineTo(i * STEP, top[i]);
        for (let i = n - 1; i >= 0; i--) ctx.lineTo(i * STEP, bot[i]);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(${b.c},${0.028 + glowK * 0.03})`; // raios verticais, bem suaves
        for (let i = 0; i < n; i += 3) {
          const len = (bot[i] - top[i]) * (0.35 + 0.65 * Math.pow(Math.abs(Math.sin(i * 0.37 + t * 0.8 + b.k)), 2));
          ctx.fillRect(i * STEP, bot[i] - len, STEP * 1.6, len);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
