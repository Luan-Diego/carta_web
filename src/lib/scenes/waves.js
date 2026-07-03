import { TAU, clamp, rand, rotRgb, tintDelta } from './util.js';

// Água (estilo aquarela): uma grande onda em curva, em faixas de azul do marinho
// ao celeste, com fios de correnteza, bolhas na crista e respingos. O ponteiro
// ergue a onda na sua direção e solta gotas; tocar faz uma ondulação e um respingo.
const FAIXAS = [ // [r, g, b, alpha, deslocamento (fração da altura)]
  [8, 38, 140, 0.96, 0],
  [20, 80, 190, 0.92, 0.012],
  [34, 125, 225, 0.85, 0.04],
  [60, 170, 238, 0.78, 0.085],
  [110, 205, 246, 0.7, 0.14],
  [160, 225, 250, 0.6, 0.21],
  [205, 240, 252, 0.5, 0.3],
];

export default function waves(w, h, dark, hue) {
  const d = tintDelta(hue, 205);
  const esc = dark ? 0.62 : 1;
  const col = (c, a) => {
    const [r, g, b] = rotRgb([c[0] * esc, c[1] * esc, c[2] * esc], d);
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
  };
  let t = 0, px = 0.5, pw = 0, emit = 0;
  const drops = [], ripples = [];
  const bolhas = Array.from({ length: 16 }, () => ({ u: Math.random(), r: rand(2, 5.5), ph: rand(TAU) }));
  const fios = Array.from({ length: 8 }, (_, i) => ({ off: 0.025 + i * 0.03, u0: rand(0, 0.6), len: rand(0.25, 0.5), sp: rand(0.01, 0.03), ph: rand(TAU) }));
  let Y = [];

  function crest(u) {
    const bowl = Math.sin(Math.PI * clamp(u * 1.04 - 0.02, 0, 1));
    let y = (0.16 + 0.4 * Math.pow(bowl, 1.15) - 0.17 * Math.pow(u, 5)) * h;
    y += Math.sin(u * 5.2 + t * 0.7) * h * 0.012 + Math.sin(u * 9 - t * 1.25) * h * 0.004;
    const dx = u - px;
    y -= pw * h * 0.1 * Math.exp(-(dx * dx) / 0.012);
    for (const r of ripples) {
      const q = (u - r.u) * w;
      y += Math.exp(-(q * q) / 30000) * Math.exp(-r.age * 1.2) * Math.cos(q * 0.05 - r.age * 8) * r.amp;
    }
    return y;
  }
  const at = (u) => {
    const f = clamp(u, 0, 1) * (Y.length - 1), i = Math.min(Y.length - 2, Math.floor(f));
    return Y[i] + (Y[i + 1] - Y[i]) * (f - i);
  };
  function spray(u, n, power = 1) {
    for (let i = 0; i < n; i++) {
      drops.push({ x: u * w + rand(-14, 14), y: crest(u) - 2, vx: rand(-60, 60) * power, vy: -rand(120, 300) * power, r: rand(1.2, 3.8), life: rand(0.8, 1.6), age: 0 });
    }
    while (drops.length > 120) drops.shift();
  }

  return {
    resize(nw, nh) { w = nw; h = nh; },
    tap(x) {
      const u = clamp(x / w, 0, 1);
      ripples.push({ u, age: 0, amp: h * 0.05 });
      spray(u, 22, 1.4);
    },
    step(dt, ptr) {
      t += dt; emit -= dt;
      const on = ptr.x > -1000;
      pw += ((on ? 1 : 0) - pw) * Math.min(1, dt * 3);
      if (on) px += (clamp(ptr.x / w, 0, 1) - px) * Math.min(1, dt * 4);
      const sp = Math.hypot(ptr.vx, ptr.vy);
      if (on && sp > 120 && emit <= 0 && Math.abs(ptr.y - crest(ptr.x / w)) < h * 0.3) { spray(clamp(ptr.x / w, 0, 1), 3, 0.8); emit = 0.07; }
      if (Math.random() < dt * 3) spray(Math.random() < 0.6 ? rand(0.04, 0.35) : rand(0.88, 1), 2);
      for (const r of ripples) r.age += dt;
      while (ripples.length && (ripples[0].age > 3.5 || ripples.length > 14)) ripples.shift();
      for (const p of drops) { p.age += dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      for (let i = drops.length - 1; i >= 0; i--) if (drops[i].age > drops[i].life) drops.splice(i, 1);
      for (const b of bolhas) b.u = (b.u + dt * 0.012) % 1;
    },
    draw(ctx) {
      const n = Math.ceil(w / 6) + 1, stepX = w / (n - 1);
      Y = new Array(n);
      for (let i = 0; i < n; i++) Y[i] = crest(i / (n - 1));

      const g = ctx.createLinearGradient(0, 0, 0, h);
      if (dark) { g.addColorStop(0, '#050d24'); g.addColorStop(1, '#0a2447'); }
      else { g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#eaf8fd'); g.addColorStop(1, '#bfeafb'); }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      FAIXAS.forEach((f, j) => {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const u = i / (n - 1);
          const y = Y[i] + f[4] * h * (1 + 0.25 * Math.sin(u * 3.5 + t * 0.5 + j * 1.3));
          i ? ctx.lineTo(i * stepX, y) : ctx.moveTo(0, y);
        }
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = col(f, f[3]);
        ctx.fill();
      });

      const b = ctx.createLinearGradient(0, h * 0.6, 0, h);
      b.addColorStop(0, col([30, 175, 245], 0));
      b.addColorStop(1, col([30, 175, 245], dark ? 0.3 : 0.55));
      ctx.fillStyle = b;
      ctx.fillRect(0, h * 0.6, w, h * 0.4);

      // fios de correnteza
      ctx.lineWidth = 1.1;
      for (const f of fios) {
        const u0 = (f.u0 + t * f.sp) % 1, u1 = Math.min(1, u0 + f.len);
        ctx.strokeStyle = `rgba(255,255,255,${0.18 + 0.2 * Math.abs(Math.sin(t + f.ph))})`;
        ctx.beginPath();
        for (let u = u0; u <= u1; u += 0.01) {
          const y = at(u) + (f.off + 0.03) * h * (1 + 0.25 * Math.sin(u * 3.5 + t * 0.5)) + Math.sin(u * 9 + t + f.ph) * 3;
          u === u0 ? ctx.moveTo(u * w, y) : ctx.lineTo(u * w, y);
        }
        ctx.stroke();
      }

      // brilho fino na crista
      ctx.strokeStyle = col([190, 235, 255], 0.55);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < n; i++) (i ? ctx.lineTo(i * stepX, Y[i] - 1) : ctx.moveTo(0, Y[0] - 1));
      ctx.stroke();

      // bolhas na crista
      for (const k of bolhas) {
        const x = k.u * w, y = at(k.u) - k.r - 1 + Math.sin(t * 1.5 + k.ph) * 1.5;
        ctx.strokeStyle = col([50, 120, 225], 0.9);
        ctx.fillStyle = col([200, 235, 255], 0.5);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, k.r, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.beginPath(); ctx.arc(x - k.r * 0.3, y - k.r * 0.3, k.r * 0.28, 0, TAU); ctx.fill();
      }

      // respingos
      for (const p of drops) {
        const a = 1 - p.age / p.life;
        ctx.fillStyle = col([60, 130, 225], 0.85 * a);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.8 * a})`;
        ctx.beginPath(); ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.3, 0, TAU); ctx.fill();
      }
    },
  };
}
