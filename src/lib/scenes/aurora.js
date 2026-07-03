import { TAU, clamp, rand, rotRgb, tintDelta } from './util.js';

// Aurora boreal: cortinas de raios verticais (verde, ciano, violeta e rosa) sobre um
// céu estrelado, com montanha e nuvens baixas. Os raios inclinam em perspectiva e
// ondulam. O ponteiro atrai e acende os raios por perto e empurra a ondulação;
// tocar dispara uma "tempestade": a aurora sobe e um pulso de luz corre pelas cortinas.
const suave = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };

function raio(rgb) { // faixa vertical: brilho forte embaixo, some para cima, bordas macias
  const c = document.createElement('canvas');
  c.width = 16; c.height = 256;
  const x = c.getContext('2d');
  const [r, g, b] = rgb.map((v) => Math.min(255, Math.round(v + (255 - v) * 0.18)));
  const v = x.createLinearGradient(0, 256, 0, 0);
  v.addColorStop(0, `rgba(${r},${g},${b},0)`);
  v.addColorStop(0.03, `rgba(${r},${g},${b},.95)`);
  v.addColorStop(0.25, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.55)`);
  v.addColorStop(0.6, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.17)`);
  v.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  x.fillStyle = v; x.fillRect(0, 0, 16, 256);
  const hz = x.createLinearGradient(0, 0, 16, 0);
  hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(0.5, 'rgba(0,0,0,1)'); hz.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalCompositeOperation = 'destination-in';
  x.fillStyle = hz; x.fillRect(0, 0, 16, 256);
  return c;
}

export default function aurora(w, h, dark, hue) {
  const d = tintDelta(hue, 150);
  const CORTINAS = [ // do fundo para a frente
    { rgb: [140, 100, 255], base: 0.72, alt: 0.85, a: 0.3, ph: 2.1, f: 0.8, sp: 0.2, env: () => 1 },
    { rgb: [60, 210, 235], base: 0.78, alt: 0.62, a: 0.42, ph: 4.3, f: 1.2, sp: 0.3, env: () => 1 },
    { rgb: [50, 255, 170], base: 0.74, alt: 0.8, a: 0.9, ph: 0.4, f: 1, sp: 0.35, env: () => 1 },
    { rgb: [255, 90, 170], base: 0.86, alt: 0.36, a: 0.8, ph: 5.7, f: 1.6, sp: 0.4, env: (u) => suave(0.4, 0.85, u) },
  ].map((c) => ({ ...c, sprite: raio(rotRgb(c.rgb, d)) }));
  let t = 0, px = 0, pw = 0, fase = 0, tempestade = 0, estrelaT = 6, estrela = null;
  let stars = [], land = null;
  const pulsos = [];

  function build() {
    const n = Math.round(clamp((w * h) / 2600, 80, 420));
    stars = Array.from({ length: n }, () => ({ x: rand(w), y: rand(h * 0.85), r: rand(0.3, 1.1), ph: rand(TAU), l: rand(0.3, 1) }));
    // montanha e nuvens baixas, desenhadas uma vez (2x para ficar nítido)
    land = document.createElement('canvas'); land.width = Math.ceil(w * 2); land.height = Math.ceil(h * 2);
    const c = land.getContext('2d'); c.scale(2, 2);
    const pts = [[0, 0.46], [0.04, 0.48], [0.09, 0.54], [0.14, 0.63], [0.19, 0.74], [0.25, 0.86], [0.31, 0.97], [0.34, 1.02]];
    const edge = pts.map(([x, y], i) => [x * w, y * h + (i > 0 && i < pts.length - 1 ? rand(-0.012, 0.012) * h : 0)]);
    const g = c.createLinearGradient(0, h * 0.45, 0, h);
    g.addColorStop(0, '#04080f'); g.addColorStop(1, '#010306');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, h);
    for (const [x, y] of edge) c.lineTo(x, y);
    c.lineTo(0, h * 1.02); c.fill();
    c.lineCap = 'round'; // neve ao longo da crista
    for (let i = 0; i < edge.length - 1; i++) {
      for (let k = 0; k < 6; k++) {
        const u = rand(), [x0, y0] = edge[i], [x1, y1] = edge[i + 1];
        c.strokeStyle = `rgba(200,225,255,${rand(0.4, 0.9)})`; c.lineWidth = rand(1, 3.2);
        c.beginPath(); const sx = x0 + (x1 - x0) * u, sy = y0 + (y1 - y0) * u;
        c.moveTo(sx, sy); c.lineTo(sx + rand(8, 26), sy + rand(8, 30)); c.stroke();
      }
    }
    const hz = c.createLinearGradient(0, h * 0.86, 0, h);
    hz.addColorStop(0, 'rgba(110,150,215,0)'); hz.addColorStop(1, 'rgba(120,150,210,.2)');
    c.fillStyle = hz; c.fillRect(w * 0.3, h * 0.86, w * 0.7, h * 0.14);
    c.fillStyle = 'rgba(5,10,24,.95)';
    c.beginPath(); c.moveTo(w * 0.25, h);
    for (let x = w * 0.25; x <= w; x += 12) c.lineTo(x, h * 0.965 + Math.sin(x * 0.02) * h * 0.008 + Math.sin(x * 0.07) * h * 0.004);
    c.lineTo(w, h); c.fill();
  }
  build();

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x) { tempestade = 1; pulsos.push({ x, age: 0 }); },
    step(dt, ptr) {
      t += dt;
      const on = ptr.x > -1000;
      pw += ((on ? 1 : 0) - pw) * Math.min(1, dt * 3);
      if (on) { px += (ptr.x - px) * Math.min(1, dt * 6); fase += clamp(ptr.vx, -1500, 1500) * dt * 0.0004; }
      tempestade = Math.max(0, tempestade - dt * 0.35);
      for (const p of pulsos) p.age += dt;
      while (pulsos.length && pulsos[0].age > 3) pulsos.shift();
      estrelaT -= dt;
      if (estrelaT <= 0 && !estrela) { estrela = { x: rand(w * 0.3, w), y: rand(h * 0.05, h * 0.25), age: 0 }; estrelaT = rand(7, 14); }
      if (estrela && (estrela.age += dt) > 0.7) estrela = null;
    },
    draw(ctx) {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#020a1f'); sky.addColorStop(0.55, '#0a2a52'); sky.addColorStop(1, '#0d3a5c');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        ctx.fillStyle = `rgba(255,255,255,${(0.3 + 0.7 * Math.abs(Math.sin(t * 1.1 + s.ph))) * s.l})`;
        ctx.fillRect(s.x, s.y, s.r * 1.5, s.r * 1.5);
      }
      if (estrela) {
        const k = estrela.age / 0.7, x = estrela.x + k * 260, y = estrela.y + k * 80;
        const g = ctx.createLinearGradient(x - 70, y - 22, x, y);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${0.9 * (1 - k)})`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 70, y - 22); ctx.lineTo(x, y); ctx.stroke();
      }

      ctx.globalCompositeOperation = 'lighter';
      // névoa de cor atrás das cortinas
      for (const [fx, fy, rgb, a] of [[0.2, 0.5, [40, 220, 160], 0.12], [0.5, 0.45, [110, 80, 230], 0.12], [0.85, 0.72, [240, 90, 160], 0.12]]) {
        const [r, g, b] = rotRgb(rgb, d), R = Math.max(w, h) * 0.5;
        const gr = ctx.createRadialGradient(w * fx, h * fy, 0, w * fx, h * fy, R);
        gr.addColorStop(0, `rgba(${r},${g},${b},${a * (1 + tempestade * 0.5)})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      }

      const passo = Math.max(3, w / 230), n = Math.ceil(w / passo) + 2;
      CORTINAS.forEach((c) => {
        const larg = passo * 1.5;
        for (let i = 0; i < n; i++) {
          const x0 = i * passo, u = x0 / w;
          const ruido = (k) => 0.5 + 0.25 * (Math.sin(x0 * 0.007 * c.f + t * c.sp * k + c.ph + fase) + Math.sin(x0 * 0.0153 * c.f - t * c.sp * 1.4 * k + c.ph * 2));
          const nz = Math.pow(clamp(ruido(1), 0, 1), 1.8), nz2 = Math.pow(clamp(ruido(2.3), 0, 1), 1.5);
          const yb = h * c.base + Math.sin(x0 * 0.004 + t * 0.3 + c.ph + fase) * h * 0.05 + Math.sin(x0 * 0.011 - t * 0.5 + c.ph) * h * 0.018;
          const dx = px - x0, perto = pw * Math.exp(-(dx * dx) / (2 * 150 * 150));
          let pulso = 0;
          for (const p of pulsos) { const q = Math.abs(x0 - p.x) - p.age * 520; pulso += Math.exp(-(q * q) / (2 * 80 * 80)) * Math.exp(-p.age * 0.9); }
          const H = h * c.alt * (0.2 + 0.8 * nz) * (1 + tempestade * 0.35 + perto * 0.25 + pulso * 0.3);
          const a = clamp(c.a * c.env(u) * (0.15 + 0.85 * nz2) * (1 + tempestade * 0.6 + perto * 0.9 + pulso * 1.2), 0, 1);
          if (a < 0.02) continue;
          const x = x0 + dx * 0.22 * perto;
          ctx.globalAlpha = a;
          ctx.save();
          ctx.transform(1, 0, (x - w * 0.5) / w * 0.3, 1, x, yb);
          ctx.drawImage(c.sprite, -larg / 2, -H, larg, H);
          ctx.restore();
        }
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(land, 0, 0, w, h);
    },
  };
}
