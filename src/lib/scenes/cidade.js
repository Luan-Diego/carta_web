import { TAU, clamp, rand } from './util.js';
import { baked, ceu, delta, luz, rot } from './paisagem.js';

// Cidade à noite: céu com lua e brilho de horizonte, três camadas de prédios com milhares de
// janelas que acendem e apagam, letreiros de neon que piscam, luzes vermelhas nas antenas,
// avenida com faróis, um avião cruzando o céu. O ponteiro acende as janelas por perto;
// tocar solta fogos de artifício sobre a cidade.
export default function cidade(w, h, dark, hue) {
  const d = delta(hue, 230);
  let t = 0, par = 0, camadas = null, lastPtr = { x: -9999, y: -9999 };
  let jan = [], neons = [], beacons = [], carros = [], fogos = [], aviao = null, timerAviao = 6;
  const U = () => Math.min(h, w * 1.2);
  const hy = () => h * 0.86;
  const LUZES = ['255,214,130', '255,226,160', '220,235,255', '150,200,255'];

  function predios(x, camada, cor, alt0, alt1, larg0, larg1, janelas, topo) {
    const Hy = hy(), u = U();
    let px = -rand(10, 40);
    while (px < w + 40) {
      const bw = rand(larg0, larg1) * u, bh = rand(alt0, alt1) * u;
      const g = x.createLinearGradient(0, Hy - bh, 0, Hy);
      g.addColorStop(0, rot(cor[0], d)); g.addColorStop(1, rot(cor[1], d));
      x.fillStyle = g; x.fillRect(px, Hy - bh, bw, bh + 2);
      // detalhes do topo
      const r = Math.random();
      if (r < 0.2) x.fillRect(px + bw * 0.1, Hy - bh - bh * 0.05, bw * 0.8, bh * 0.05 + 1);
      if (r > 0.8) { x.fillRect(px + bw * 0.4, Hy - bh - bw * 0.35, 2, bw * 0.35); if (topo) beacons.push({ x: px + bw * 0.4 + 1, y: Hy - bh - bw * 0.35, ph: rand(TAU) }); }
      if (r > 0.45 && r < 0.6) { x.beginPath(); x.moveTo(px, Hy - bh); x.lineTo(px + bw / 2, Hy - bh - bw * 0.3); x.lineTo(px + bw, Hy - bh); x.fill(); }
      if (janelas) {
        const cw = Math.max(3, u * 0.011), ch = cw * 1.5, gx = cw * 1.9, gy = ch * 1.55;
        const cols = Math.floor((bw - cw) / gx), rows = Math.floor((bh - ch) / gy);
        const ox = px + (bw - (cols - 1) * gx - cw) / 2;
        for (let r2 = 0; r2 < rows; r2++) for (let c = 0; c < cols; c++) {
          jan.push({ x: ox + c * gx, y: Hy - bh + ch * 0.9 + r2 * gy, w: cw, h: ch, on: Math.random() < 0.38, c: LUZES[(Math.random() * 4) | 0], a: rand(0.55, 1), cam: camada });
        }
      } else {
        // prédios distantes: janelas só como pontinhos
        for (let k = 0; k < bw * bh * 0.0016; k++) jan.push({ x: px + rand(2, bw - 2), y: Hy - rand(6, bh), w: 1.6, h: 1.8, on: Math.random() < 0.6, c: LUZES[(Math.random() * 4) | 0], a: rand(0.3, 0.7), cam: camada });
      }
      px += bw + rand(-0.01, 0.025) * u;
    }
  }

  function bake() {
    const Hy = hy(), u = U();
    jan = []; neons = []; beacons = [];
    const sky = baked(w, h, (x) => {
      ceu(x, w, h, [[0, rot('#03061a', d)], [0.4, rot('#0c1838', d)], [0.7, rot('#2a2c5a', d)], [0.9, rot('#7a4f6e', d)], [1, rot('#d08a70', d)]]);
      for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${rand(0.15, 0.6)})`; x.fillRect(rand(w), rand(h * 0.45), 1.2, 1.2); }
      luz(x, w * 0.5, Hy, u * 0.9, '255,150,110', 0.28);
      // lua
      const mx = w * 0.78, my = h * 0.16, mr = u * 0.045;
      luz(x, mx, my, mr * 5, '200,220,255', 0.18);
      const mg = x.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 0, mx, my, mr);
      mg.addColorStop(0, '#fffdf2'); mg.addColorStop(1, '#d9e0f0');
      x.fillStyle = mg; x.beginPath(); x.arc(mx, my, mr, 0, TAU); x.fill();
      x.fillStyle = 'rgba(150,160,190,.3)'; for (const [ox, oy, r] of [[-0.3, -0.1, 0.22], [0.25, 0.2, 0.3], [0.05, -0.4, 0.15]]) { x.beginPath(); x.arc(mx + ox * mr, my + oy * mr, r * mr, 0, TAU); x.fill(); }
    });
    const longe = baked(w, h, (x) => predios(x, 0, ['#1d2a56', '#2a2f5a'], 0.1, 0.34, 0.04, 0.08, false, false));
    const meio = baked(w, h, (x) => predios(x, 1, ['#131c40', '#1e2448'], 0.1, 0.26, 0.05, 0.1, true, true));
    const perto = baked(w, h, (x) => predios(x, 2, ['#0a1028', '#101636'], 0.06, 0.2, 0.07, 0.13, true, true));
    // letreiros de neon em alguns prédios do meio
    const cores = ['255,60,160', '60,220,255', '255,210,60'];
    for (let i = 0; i < 4; i++) neons.push({ x: rand(w * 0.1, w * 0.85), y: Hy - rand(0.08, 0.2) * u, w: rand(0.05, 0.09) * u, c: cores[i % 3], ph: rand(TAU) });
    const rua = baked(w, h - Hy, (x, ww, hh) => {
      ceu(x, ww, hh, [[0, '#1a1a32'], [1, '#07070f']]);
      x.fillStyle = 'rgba(255,255,255,.1)'; for (let xx = 0; xx < ww; xx += 40) x.fillRect(xx, hh * 0.5, 22, 1.5);
    });
    camadas = { sky, longe, meio, perto, rua };
    carros = Array.from({ length: 16 }, (_, i) => ({ x: rand(w), faixa: i % 2, v: rand(60, 120) * (i % 2 ? -1 : 1), c: i % 2 ? '255,250,225' : '255,60,50' }));
  }
  bake();

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap(x, y) {
      const cor = ['255,120,100', '120,200,255', '255,230,120', '190,140,255'][(Math.random() * 4) | 0];
      for (let i = 0; i < 70; i++) { const a = rand(TAU), v = rand(40, 190); fogos.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, a: 1, c: cor }); }
    },
    step(dt, ptr) {
      lastPtr = ptr; t += dt;
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      // janelas acendendo e apagando; as próximas do ponteiro acendem
      for (let i = 0; i < 6; i++) { const j = jan[(Math.random() * jan.length) | 0]; if (j) j.on = Math.random() < 0.4; }
      if (ptr.x > -1000) for (const j of jan) if (!j.on && j.cam > 0 && (j.x - ptr.x) ** 2 + (j.y - ptr.y) ** 2 < 4400 && Math.random() < dt * 8) j.on = true;
      for (const c of carros) { c.x += c.v * dt * (U() / 600); if (c.x > w + 30) c.x = -30; if (c.x < -30) c.x = w + 30; }
      timerAviao -= dt;
      if (timerAviao <= 0 && !aviao) { aviao = { x: -20, y: rand(h * 0.08, h * 0.3), v: rand(50, 80) }; timerAviao = rand(14, 24); }
      if (aviao) { aviao.x += aviao.v * dt; aviao.y -= dt * 3; if (aviao.x > w + 30) aviao = null; }
      for (const f of fogos) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 90 * dt; f.vx *= 0.985; f.a -= dt * 0.55; }
      fogos = fogos.filter((f) => f.a > 0);
    },
    draw(ctx) {
      const { sky, longe, meio, perto, rua } = camadas;
      const Hy = hy(), u = U();
      ctx.drawImage(sky, 0, 0, w, h);
      const camada = (img, p) => ctx.drawImage(img, -par * p, 0, w, h);
      camada(longe, 3);
      camada(meio, 7);
      camada(perto, 12);
      // janelas acesas
      for (const j of jan) {
        if (!j.on) continue;
        const p = j.cam === 0 ? 3 : j.cam === 1 ? 7 : 12;
        ctx.fillStyle = `rgba(${j.c},${j.a})`;
        ctx.fillRect(j.x - par * p, j.y, j.w, j.h);
      }
      ctx.globalCompositeOperation = 'lighter';
      // neons
      for (const n of neons) {
        const f = 0.7 + Math.sin(t * 3 + n.ph) * 0.12 + (Math.sin(t * 17 + n.ph) > 0.97 ? -0.5 : 0);
        luz(ctx, n.x - par * 7, n.y, n.w * 1.6, n.c, 0.4 * f);
        ctx.fillStyle = `rgba(${n.c},${0.9 * f})`; ctx.fillRect(n.x - par * 7 - n.w / 2, n.y - 2, n.w, 3.5);
      }
      // antenas
      for (const b of beacons) { const a = Math.max(0, Math.sin(t * 2.2 + b.ph)); if (a > 0.3) luz(ctx, b.x - par * 9, b.y, 9, '255,60,50', a); }
      // brilho da cidade no horizonte
      luz(ctx, w * 0.5, Hy, u * 0.5, '255,160,100', 0.1);
      // avenida e faróis
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(rua, 0, Hy, w, h - Hy);
      ctx.globalCompositeOperation = 'lighter';
      for (const c of carros) {
        const y = Hy + (h - Hy) * (c.faixa ? 0.3 : 0.65), dir = c.v > 0 ? 1 : -1;
        luz(ctx, c.x, y, 14, c.c, 0.8);
        luz(ctx, c.x + 9, y, 14, c.c, 0.8);
        const tr = ctx.createLinearGradient(c.x, y, c.x - dir * 50, y);
        tr.addColorStop(0, `rgba(${c.c},.5)`); tr.addColorStop(1, `rgba(${c.c},0)`);
        ctx.fillStyle = tr; ctx.fillRect(Math.min(c.x, c.x - dir * 50), y - 1.5, 50, 3);
        luz(ctx, c.x, y + (h - Hy) * 0.18, 18, c.c, 0.15);
      }
      // avião
      if (aviao) {
        ctx.fillStyle = 'rgba(255,255,255,.9)'; if (Math.sin(t * 6) > 0) luz(ctx, aviao.x, aviao.y, 7, '255,255,255', 0.9);
        luz(ctx, aviao.x - 6, aviao.y + 1, 6, '255,50,50', Math.sin(t * 3) > 0 ? 0.9 : 0.1);
        luz(ctx, aviao.x + 6, aviao.y + 1, 6, '60,255,120', Math.sin(t * 3 + 1.5) > 0 ? 0.9 : 0.1);
      }
      // fogos
      for (const f of fogos) { luz(ctx, f.x, f.y, 5, f.c, f.a); }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
