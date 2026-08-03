import { TAU, clamp, hslToRgb, rand, rgbStr, semMatiz } from './util.js';

// Céu estrelado: três camadas de estrelas que cintilam e se movem com o ponteiro
// (paralaxe), uma faixa da Via Láctea e estrelas cadentes. Toque: lança uma estrela cadente.
export default function sky(w, h, dark, hue) {
  let t = 0, par = 0, parY = 0, timer = 2, stars = [];
  const shots = [];
  const LAYERS = [
    { n: 140, r: [0.5, 1.2], p: 6, a: 0.7 },
    { n: 80, r: [0.8, 1.7], p: 14, a: 0.85 },
    { n: 22, r: [1.2, 2.4], p: 26, a: 1 },
  ];
  const build = () => {
    const f = clamp((w * h) / (1280 * 720), 0.45, 1.3);
    stars = [];
    LAYERS.forEach((L, li) => {
      for (let i = 0; i < Math.round(L.n * f); i++) {
        stars.push({ x: rand(w), y: rand(h), r: rand(L.r[0], L.r[1]), ph: rand(TAU), sp: rand(0.8, 2.4), li });
      }
    });
  };
  build();
  const shoot = (x = rand(w * 0.1, w * 0.9), y = rand(h * 0.05, h * 0.4)) => {
    const a = rand(0.35, 0.8), v = rand(500, 800);
    shots.push({ x, y, vx: Math.cos(a) * v * (Math.random() < 0.5 ? 1 : -1), vy: Math.sin(a) * v, life: 1 });
  };

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x, y) { shoot(x, y); },
    step(dt, ptr) {
      t += dt;
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      const ty = ptr.x > -1000 ? ptr.y / h - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      parY += (ty - parY) * Math.min(1, dt * 2);
      timer -= dt;
      if (timer <= 0) { shoot(); timer = rand(2.5, 6); }
      for (const s of shots) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 0.9; }
      while (shots.length && shots[0].life <= 0) shots.shift();
    },
    draw(ctx) {
      const rgb = !semMatiz(hue) ? rgbStr(hslToRgb(hue, dark ? 0.75 : 0.6, dark ? 0.88 : 0.4)) : dark ? '255,255,255' : '50,70,140';
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.5);
      const g = ctx.createLinearGradient(0, -h * 0.25, 0, h * 0.25);
      g.addColorStop(0, 'rgba(160,180,255,0)');
      g.addColorStop(0.5, `rgba(180,190,255,${dark ? 0.1 : 0.06})`);
      g.addColorStop(1, 'rgba(160,180,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-w, -h * 0.25, w * 2, h * 0.5);
      ctx.restore();
      for (const s of stars) {
        const L = LAYERS[s.li];
        const x = s.x - par * L.p, y = s.y - parY * L.p;
        const a = L.a * (0.45 + 0.55 * Math.abs(Math.sin(t * s.sp + s.ph)));
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
        if (s.r > 1.9) {
          ctx.strokeStyle = `rgba(${rgb},${a * 0.5})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(x - s.r * 3, y); ctx.lineTo(x + s.r * 3, y); ctx.moveTo(x, y - s.r * 3); ctx.lineTo(x, y + s.r * 3); ctx.stroke();
        }
      }
      for (const s of shots) {
        const len = 0.12, x2 = s.x - s.vx * len, y2 = s.y - s.vy * len;
        const g2 = ctx.createLinearGradient(s.x, s.y, x2, y2);
        g2.addColorStop(0, `rgba(${rgb},${Math.max(0, s.life)})`);
        g2.addColorStop(1, `rgba(${rgb},0)`);
        ctx.strokeStyle = g2; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x2, y2); ctx.stroke();
      }
    },
  };
}
