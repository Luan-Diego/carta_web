import { TAU, density, near, rand, rotRgb, tintDelta } from './util.js';

// Fogo: dezenas de "línguas" de luz (partículas com brilho) que sobem, giram e
// esfriam do branco-amarelo ao vermelho e à fumaça, mais brasas e faíscas.
// O ponteiro sopra as chamas; tocar solta uma labareda.
const STAGES = [[255, 250, 220], [255, 225, 120], [255, 160, 50], [245, 95, 22], [190, 40, 12], [70, 28, 18]];

function sprite(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.35, `rgba(${rgb},.55)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return c;
}

export default function fire(w, h, dark, hue) {
  const d = tintDelta(hue, 30);
  const sprites = STAGES.map((c) => sprite(rotRgb(c, d).join(',')));
  let t = 0, acc = 0, wind = 0;
  let flames = [], embers = [], smoke = [];

  const centro = (x) => 1 - Math.min(1, Math.abs(x - w / 2) / (w * 0.55));
  const flame = (x = w / 2 + (Math.random() + Math.random() - 1) * w * 0.5, y = h + 10, big = 1) => {
    const c = centro(x);
    return {
      x, y, life: rand(0.8, 1.6), max: 1.6, seed: rand(TAU),
      size: rand(38, 80) * (0.55 + 0.6 * c) * big,
      vx: rand(-15, 15),
      vy: -rand(150, 300) * (0.55 + 0.7 * c) * (big > 1 ? 1.3 : 1),
    };
  };
  const ember = (x = rand(w), y = h + 6, burst = false) => {
    const life = rand(1.8, 4.2);
    embers.push({ x, y, life, max: life, seed: rand(TAU), size: rand(1.2, 3.4), vx: burst ? rand(-160, 160) : rand(-12, 12), vy: burst ? rand(-380, -120) : -rand(50, 150) });
  };

  return {
    resize(nw, nh) { w = nw; h = nh; },
    tap(x, y) {
      for (let i = 0; i < 40; i++) flames.push(flame(x + rand(-30, 30), y, 1.5));
      for (let i = 0; i < 40; i++) ember(x, y, true);
    },
    step(dt, ptr) {
      t += dt;
      const k = density(w, h);
      acc += dt * 230 * k;
      while (acc >= 1) {
        acc -= 1;
        flames.push(flame());
        if (Math.random() < 0.35) ember(w / 2 + (Math.random() + Math.random() - 1) * w * 0.55);
        if (Math.random() < 0.08) smoke.push({ x: rand(w * 0.15, w * 0.85), y: h * 0.75, life: 3, max: 3, vx: rand(-10, 10), vy: -rand(40, 80), s: rand(50, 90) });
      }
      wind += (((ptr.x > -1000 ? ptr.vx : 0) * 0.002) - wind) * Math.min(1, dt * 3);
      for (const f of flames) {
        f.life -= dt;
        const turb = Math.sin(t * 4 + f.seed + f.y * 0.012) * 55 + Math.sin(t * 7.3 + f.seed * 2) * 25;
        f.vx += (turb - f.vx * 0.9) * dt * 3;
        f.x += (f.vx + wind * 350) * dt;
        f.y += f.vy * dt;
        f.vy *= Math.exp(-0.2 * dt);
        const n = near(ptr, f.x, f.y, 230);
        if (n) { f.vx += (n.dx * 360 + ptr.vx * 0.5) * n.k * dt * 3; f.vy += n.dy * 80 * n.k * dt; }
      }
      flames = flames.filter((f) => f.life > 0);
      for (const e of embers) {
        e.life -= dt;
        e.vx += (Math.sin(t * 2.2 + e.seed) * 40 - e.vx * 0.4) * dt;
        e.x += e.vx * dt; e.y += e.vy * dt; e.vy *= Math.exp(-0.25 * dt);
        const n = near(ptr, e.x, e.y, 170);
        if (n) { e.vx += (n.dx * 420 + ptr.vx * 0.5) * n.k * dt; e.vy += n.dy * 120 * n.k * dt; }
      }
      embers = embers.filter((e) => e.life > 0 && e.y > -30);
      for (const s of smoke) { s.life -= dt; s.x += (s.vx + wind * 200) * dt; s.y += s.vy * dt; s.s += 12 * dt; }
      smoke = smoke.filter((s) => s.life > 0);
    },
    draw(ctx) {
      const flick = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
      // fumaça (por baixo da luz)
      for (const s of smoke) {
        const a = (s.life / s.max) * 0.07;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.s);
        g.addColorStop(0, `rgba(60,50,48,${a})`);
        g.addColorStop(1, 'rgba(60,50,48,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, TAU); ctx.fill();
      }
      // luz do fogo no ambiente
      const base = ctx.createLinearGradient(0, h, 0, h * 0.35);
      base.addColorStop(0, `rgba(255,110,30,${0.5 * flick})`);
      base.addColorStop(1, 'rgba(255,60,10,0)');
      ctx.fillStyle = base;
      ctx.fillRect(0, h * 0.35, w, h * 0.65);

      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      for (const f of flames) {
        const kk = Math.max(0, f.life / f.max); // 1 = recém-nascida
        const stage = Math.min(STAGES.length - 1, Math.floor((1 - kk) * STAGES.length * 0.98));
        const s = f.size * (0.3 + 0.7 * Math.pow(kk, 0.6));
        ctx.globalAlpha = Math.min(1, kk * 2.4) * (dark ? 0.55 : 0.4) * (stage === 5 ? 0.5 : 1);
        ctx.drawImage(sprites[stage], f.x - s, f.y - s * 1.15, s * 2, s * 2.3);
      }
      ctx.globalAlpha = 1;
      for (const e of embers) {
        const kk = e.life / e.max;
        const st = kk > 0.66 ? 1 : kk > 0.33 ? 2 : 4;
        const r = e.size * (0.6 + kk * 0.7) * 5;
        ctx.globalAlpha = Math.min(1, kk * 1.6);
        ctx.drawImage(sprites[st], e.x - r, e.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
