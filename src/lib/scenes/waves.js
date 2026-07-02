import { blend } from './util.js';

// Ondas abstratas em camadas translúcidas. Toque (ou arrastar o dedo/mouse
// pela parte de baixo) cria ondulações que se espalham.
export default function waves(w, h, dark) {
  let t = 0, cool = 0;
  const ripples = [];
  const layers = Array.from({ length: 5 }, (_, i) => ({
    base: 0.5 + 0.085 * i,
    amp: 0.03 + 0.008 * i,
    freq: 0.0028 + 0.0011 * i,
    speed: (0.45 + 0.17 * i) * (i % 2 ? -1 : 1),
    a: 0.16 + 0.05 * i,
  }));
  const rgb = dark ? '90,180,255' : '30,140,220';

  const rip = (x, i) => {
    let s = 0;
    for (const r of ripples) {
      const dx = x - r.x;
      s += Math.exp(-(dx * dx) / 38000) * Math.exp(-r.age * 1.1) * Math.cos(dx * 0.045 - r.age * 9) * r.amp * (1 - i * 0.12);
    }
    return s;
  };

  return {
    resize(nw, nh) { w = nw; h = nh; },
    tap(x) { ripples.push({ x, age: 0, amp: 30 }); },
    step(dt, ptr) {
      t += dt; cool -= dt;
      const speed = Math.hypot(ptr.vx, ptr.vy);
      if (ptr.x > -1000 && ptr.y > h * 0.35 && speed > 120 && cool <= 0) {
        ripples.push({ x: ptr.x, age: 0, amp: 11 }); cool = 0.14;
      }
      for (const r of ripples) r.age += dt;
      while (ripples.length && (ripples[0].age > 3.5 || ripples.length > 16)) ripples.shift();
    },
    draw(ctx) {
      blend(ctx, dark);
      const STEP = 6, n = Math.ceil(w / STEP) + 1;
      layers.forEach((L, i) => {
        const base = h * L.base, amp = h * L.amp;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let k = 0; k < n; k++) {
          const x = k * STEP;
          const y = base + Math.sin(x * L.freq + t * L.speed + i) * amp + Math.sin(x * L.freq * 2.3 - t * L.speed * 0.7) * amp * 0.4 + rip(x, i);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, base - amp * 2, 0, h);
        g.addColorStop(0, `rgba(${rgb},${L.a})`);
        g.addColorStop(1, `rgba(${rgb},${L.a * 0.35})`);
        ctx.fillStyle = g;
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
