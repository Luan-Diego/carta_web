import { blend, rand, rotStr, tintDelta } from './util.js';

// Água: camadas de mar com profundidade (claro e turvo ao longe, escuro e limpo
// perto), cristas com espuma, reflexos brilhando e luz no fundo. O ponteiro
// desloca as ondas (como na aurora) e deixa um rastro; tocar cria ondulações.
const L = 6;
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));

export default function waves(w, h, dark, hue) {
  const d = tintDelta(hue, 205);
  let t = 0, par = 0, cool = 0;
  const ripples = [];
  const topFar = [165, 228, 240], topNear = [40, 140, 185];
  const botFar = [90, 180, 215], botNear = [6, 40, 90];
  const glints = Array.from({ length: 70 }, () => ({ x: Math.random(), i: 2 + Math.floor(Math.random() * 4), ph: rand(6.28), sp: rand(1.5, 3.5) }));

  const layers = Array.from({ length: L }, (_, i) => {
    const k = i / (L - 1);
    return {
      base: 0.4 + 0.1 * i,
      amp: 0.012 + 0.016 * k,
      freq: 0.0034 - 0.0018 * k + 0.0008,
      speed: (0.5 + 0.35 * k) * (i % 2 ? -1 : 1),
      top: rotStr(mix(topFar, topNear, k), d),
      bot: rotStr(mix(botFar, botNear, k), d),
      alpha: 0.88,
    };
  });

  function y(i, x, speed = 0) {
    const Ly = layers[i], k = i / (L - 1);
    const p = x * Ly.freq + t * Ly.speed + i * 1.7 + par * (2 + k * 4);
    const s = Math.sin(p);
    const crest = Math.pow(Math.max(0, s), 2.4) * 0.45; // cristas mais agudas que as cavas
    let v = h * Ly.base + (s * 0.7 + crest + Math.sin(x * Ly.freq * 2.1 - t * Ly.speed * 0.8 + i) * 0.35 + Math.sin(x * Ly.freq * 4.7 + t * 1.1 + i * 3) * 0.12) * h * Ly.amp * 1.6;
    for (const r of ripples) {
      const dx = x - r.x;
      v += Math.exp(-(dx * dx) / 42000) * Math.exp(-r.age * 1.1) * Math.cos(dx * 0.045 - r.age * 9) * r.amp * (0.5 + k * 0.7);
    }
    return v;
  }

  return {
    resize(nw, nh) { w = nw; h = nh; },
    tap(x) { ripples.push({ x, age: 0, amp: 34 }); },
    step(dt, ptr) {
      t += dt; cool -= dt;
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      const speed = Math.hypot(ptr.vx, ptr.vy);
      if (ptr.x > -1000 && ptr.y > h * 0.3 && speed > 100 && cool <= 0) {
        ripples.push({ x: ptr.x, age: 0, amp: 8 + Math.min(14, speed / 90) }); cool = 0.11;
      }
      for (const r of ripples) r.age += dt;
      while (ripples.length && (ripples[0].age > 3.5 || ripples.length > 18)) ripples.shift();
    },
    draw(ctx) {
      const STEP = 5, n = Math.ceil(w / STEP) + 1;
      const a = dark ? 1 : 0.95;
      // bruma clara no horizonte
      const hz = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.5);
      hz.addColorStop(0, 'rgba(255,255,255,0)');
      hz.addColorStop(1, 'rgba(255,255,255,.35)');
      ctx.fillStyle = hz;
      ctx.fillRect(0, h * 0.3, w, h * 0.2);

      layers.forEach((Ly, i) => {
        const ys = [];
        ctx.beginPath();
        ctx.moveTo(0, h + 2);
        for (let k = 0; k < n; k++) { const yy = y(i, k * STEP); ys.push(yy); ctx.lineTo(k * STEP, yy); }
        ctx.lineTo(w, h + 2);
        ctx.closePath();
        const top = h * Ly.base - h * Ly.amp * 2.4;
        const g = ctx.createLinearGradient(0, top, 0, Math.min(h, top + h * 0.34));
        g.addColorStop(0, `rgba(${Ly.top},${Ly.alpha * a})`);
        g.addColorStop(1, `rgba(${Ly.bot},${Ly.alpha * a})`);
        ctx.fillStyle = g;
        ctx.fill();

        // brilho na borda da crista e espuma
        ctx.lineWidth = 1 + i * 0.15;
        ctx.strokeStyle = `rgba(255,255,255,${0.1 + i * 0.03})`;
        ctx.beginPath();
        ys.forEach((yy, k) => (k ? ctx.lineTo(k * STEP, yy) : ctx.moveTo(0, yy)));
        ctx.stroke();
        if (i >= 3) {
          ctx.fillStyle = 'rgba(255,255,255,.5)';
          for (let k = 2; k < n - 2; k += 2) {
            const slope = ys[k + 2] - ys[k - 2];
            const crista = ys[k] < h * Ly.base - h * Ly.amp * 0.9;
            if (crista && Math.sin(k * 12.9898 + i * 78.233 + t * 0.5) > 0.3) {
              ctx.beginPath(); ctx.arc(k * STEP, ys[k] + Math.abs(slope) * 0.05 + 1, 1.2 + (i - 2) * 0.5, 0, 6.3); ctx.fill();
            }
          }
        }
      });

      // reflexos que brilham na superfície
      ctx.save();
      blend(ctx, true);
      for (const gl of glints) {
        const x = gl.x * w, yy = y(gl.i, x);
        const al = Math.pow(Math.max(0, Math.sin(t * gl.sp + gl.ph)), 6);
        if (al < 0.05) continue;
        const r = 3 + gl.i * 1.1;
        ctx.strokeStyle = `rgba(255,255,255,${al * 0.9})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x - r, yy); ctx.lineTo(x + r, yy); ctx.moveTo(x, yy - r * 0.7); ctx.lineTo(x, yy + r * 0.7); ctx.stroke();
      }
      // luz que desce na água (cáusticas)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(190,250,255,.07)';
      for (let k = 0; k < 9; k++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const yy = h * (0.84 + 0.014 * k) + Math.sin(x * 0.02 + t * 0.9 + k) * 7 + Math.sin(x * 0.047 - t * 0.7 + k * 2) * 4;
          x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    },
  };
}
