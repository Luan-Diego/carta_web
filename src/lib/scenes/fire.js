import { TAU, blend, density, near, rand } from './util.js';

// Fogo e brasas: chamas baixas no chão e brasas que sobem. O ponteiro sopra as
// brasas para os lados; tocar solta uma rajada de faíscas.
export default function fire(w, h, dark) {
  let t = 0, acc = 0;
  let embers = [];

  const spawn = (x = rand(w), y = h + 6, burst = false) => {
    const life = rand(1.8, 4.2);
    embers.push({
      x, y, life, max: life, seed: rand(TAU), size: rand(1.2, 3.4),
      vx: burst ? rand(-160, 160) : rand(-12, 12),
      vy: burst ? rand(-380, -120) : -rand(50, 150),
    });
  };

  return {
    resize(nw, nh) { w = nw; h = nh; },
    tap(x, y) { for (let i = 0; i < 40; i++) spawn(x, y, true); },
    step(dt, ptr) {
      t += dt;
      acc += dt * 110 * density(w, h);
      while (acc >= 1) { acc -= 1; spawn(w / 2 + (Math.random() + Math.random() - 1) * w * 0.55); }
      for (const e of embers) {
        e.life -= dt;
        e.vx += (Math.sin(t * 2.2 + e.seed) * 40 - e.vx * 0.4) * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vy *= Math.exp(-0.25 * dt);
        const n = near(ptr, e.x, e.y, 170);
        if (n) { e.vx += (n.dx * 420 + ptr.vx * 0.5) * n.k * dt; e.vy += n.dy * 120 * n.k * dt; }
      }
      embers = embers.filter((e) => e.life > 0 && e.y > -30);
    },
    draw(ctx) {
      blend(ctx, dark);
      const flick = 0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 5.3);
      const base = ctx.createLinearGradient(0, h, 0, h * 0.55);
      base.addColorStop(0, `rgba(255,100,20,${0.5 * flick})`);
      base.addColorStop(1, 'rgba(255,60,10,0)');
      ctx.fillStyle = base;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      const N = Math.max(6, Math.round(w / 90));
      for (let i = 0; i < N; i++) {
        const x = ((i + 0.5) / N) * w;
        const ph = i * 1.7;
        const fh = h * 0.13 * (1 + 0.45 * Math.sin(t * 6 + ph) + 0.3 * Math.sin(t * 9.5 + ph * 2));
        const fw = (w / N) * 0.65;
        const sw = Math.sin(t * 3 + ph) * 16;
        const g = ctx.createLinearGradient(0, h, 0, h - fh);
        g.addColorStop(0, 'rgba(255,200,80,.55)');
        g.addColorStop(0.5, 'rgba(255,100,20,.4)');
        g.addColorStop(1, 'rgba(255,40,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - fw, h);
        ctx.quadraticCurveTo(x - fw * 0.5 + sw * 0.3, h - fh * 0.6, x + sw, h - fh);
        ctx.quadraticCurveTo(x + fw * 0.5 + sw * 0.3, h - fh * 0.6, x + fw, h);
        ctx.closePath();
        ctx.fill();
      }
      for (const e of embers) {
        const k = e.life / e.max;
        const rgb = k > 0.66 ? '255,225,140' : k > 0.33 ? '255,140,30' : '210,50,12';
        const a = Math.min(1, k * 1.6);
        const r = e.size * (0.6 + k * 0.7);
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 4);
        g.addColorStop(0, `rgba(${rgb},${a})`);
        g.addColorStop(0.3, `rgba(${rgb},${a * 0.45})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(e.x, e.y, r * 4, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
