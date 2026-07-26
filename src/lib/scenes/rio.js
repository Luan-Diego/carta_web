import { TAU, clamp, rand } from './util.js';
import { baked, brilhosAgua, ceu, delta, fbm, luz, nuvemSprite, rot, serra } from './paisagem.js';

// Rio de Janeiro no fim da tarde: o Cristo Redentor iluminado no Corcovado, o Pão de Açúcar
// com o bondinho, a baía com veleiros e o brilho do sol na água, palmeiras e as luzes da
// orla acendendo. Nuvens passam rente ao morro. Tocar faz o Cristo brilhar.
export default function rio(w, h, dark, hue) {
  const d = delta(hue, 15);
  let t = 0, par = 0, brilho = 0, camadas = null, nuvens = [], barcos = [], aves = [], luzes = [];
  const U = () => Math.min(h, w * 1.1);
  const hy = () => h * 0.7;

  function cristo(x, cx, by, s) {
    x.fillStyle = '#d8d0c0';
    // pedestal
    x.fillRect(cx - s * 0.1, by - s * 0.22, s * 0.2, s * 0.22);
    x.fillRect(cx - s * 0.13, by - s * 0.05, s * 0.26, s * 0.05);
    // corpo (túnica) e braços abertos
    x.beginPath();
    x.moveTo(cx - s * 0.075, by - s * 0.22);
    x.lineTo(cx - s * 0.06, by - s * 0.64);
    x.lineTo(cx - s * 0.5, by - s * 0.66); x.lineTo(cx - s * 0.5, by - s * 0.7); x.lineTo(cx - s * 0.04, by - s * 0.72);
    x.lineTo(cx - s * 0.03, by - s * 0.78); x.lineTo(cx + s * 0.03, by - s * 0.78);
    x.lineTo(cx + s * 0.04, by - s * 0.72); x.lineTo(cx + s * 0.5, by - s * 0.7); x.lineTo(cx + s * 0.5, by - s * 0.66);
    x.lineTo(cx + s * 0.06, by - s * 0.64); x.lineTo(cx + s * 0.075, by - s * 0.22);
    x.closePath(); x.fill();
    x.beginPath(); x.ellipse(cx, by - s * 0.82, s * 0.04, s * 0.052, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(160,150,140,.55)'; x.fillRect(cx - s * 0.005, by - s * 0.64, s * 0.01, s * 0.42);
  }

  function palmeira(x, px, by, s, ang) {
    x.strokeStyle = '#0b1410'; x.fillStyle = '#0b1410'; x.lineCap = 'round';
    x.lineWidth = s * 0.05;
    const tx = px + Math.sin(ang) * s * 0.3, ty = by - s;
    x.beginPath(); x.moveTo(px, by); x.quadraticCurveTo(px + Math.sin(ang) * s * 0.05, by - s * 0.5, tx, ty); x.stroke();
    x.lineWidth = s * 0.018;
    for (let i = 0; i < 9; i++) {
      const a = (i / 8) * Math.PI * 1.15 + Math.PI * 0.95;
      x.beginPath(); x.moveTo(tx, ty);
      x.quadraticCurveTo(tx + Math.cos(a) * s * 0.3, ty + Math.sin(a) * s * 0.3 - s * 0.12, tx + Math.cos(a) * s * 0.55, ty + Math.sin(a) * s * 0.55 + s * 0.06); x.stroke();
    }
  }

  function bake() {
    const Hy = hy(), u = U();
    luzes = [];
    const sky = baked(w, h, (x) => {
      ceu(x, w, Hy, [[0, rot('#243a78', d)], [0.35, rot('#7a5aa0', d)], [0.62, rot('#f0788a', d)], [0.85, rot('#ffae5c', d)], [1, rot('#ffdc92', d)]]);
      const sx = w * 0.3, sy = Hy - u * 0.04;
      luz(x, sx, sy, u * 0.8, '255,170,90', 0.45); luz(x, sx, sy, u * 0.22, '255,225,150', 0.7);
      x.fillStyle = 'rgba(255,248,220,.98)'; x.beginPath(); x.arc(sx, sy, u * 0.05, 0, TAU); x.fill();
    });
    const mar = baked(w, h - Hy, (x, ww, hh) => ceu(x, ww, hh, [[0, rot('#ffb36a', d)], [0.15, rot('#c9627a', d)], [0.5, rot('#3a3a78', d)], [1, rot('#10183c', d)]]));
    const morros = baked(w, h, (x) => {
      // morros distantes
      serra(x, w, h, Hy + 3, u * 0.1, 0.006, rot('#6a4a88', d), 41);
      // Pão de Açúcar e morro da Urca (esquerda-centro), dentro da baía
      const px = w * 0.34;
      x.fillStyle = rot('#3a2a58', d);
      x.beginPath(); x.moveTo(px - u * 0.2, Hy + 2); x.quadraticCurveTo(px - u * 0.17, Hy - u * 0.09, px - u * 0.1, Hy - u * 0.1);
      x.quadraticCurveTo(px - u * 0.07, Hy - u * 0.09, px - u * 0.045, Hy + 2); x.fill();
      x.beginPath(); x.moveTo(px - u * 0.07, Hy + 2); x.quadraticCurveTo(px - u * 0.04, Hy - u * 0.2, px + u * 0.05, Hy - u * 0.24);
      x.quadraticCurveTo(px + u * 0.11, Hy - u * 0.22, px + u * 0.12, Hy - u * 0.12); x.quadraticCurveTo(px + u * 0.13, Hy - u * 0.04, px + u * 0.16, Hy + 2); x.closePath(); x.fill();
      // Corcovado à direita, verde-escuro, com o Cristo no topo
      const cx = w * 0.76, topY = Hy - u * 0.47, H = u * 0.47, f = fbm(44);
      const perfil = () => {
        x.beginPath(); x.moveTo(cx - u * 0.6, Hy + 3);
        for (let xx = cx - u * 0.6; xx <= cx + u * 0.6; xx += 3) {
          const dx = xx - cx;
          const y = Hy - H * (0.72 * Math.exp(-((dx / (u * 0.15)) ** 2)) + 0.36 * Math.exp(-((dx / (u * 0.36)) ** 2))) * (0.94 + f(xx * 0.03) * 0.1);
          x.lineTo(xx, y);
        }
        x.lineTo(cx + u * 0.6, Hy + 3); x.closePath();
      };
      const g = x.createLinearGradient(0, topY, 0, Hy);
      g.addColorStop(0, rot('#24442f', d)); g.addColorStop(1, rot('#0e1d16', d));
      perfil(); x.fillStyle = g; x.fill();
      x.save(); perfil(); x.clip();
      const lg = x.createLinearGradient(cx - u * 0.35, 0, cx + u * 0.1, 0);
      lg.addColorStop(0, 'rgba(255,140,90,.28)'); lg.addColorStop(1, 'rgba(255,140,90,0)');
      x.fillStyle = lg; x.fillRect(cx - u * 0.6, topY - 4, u * 0.7, H + 8);
      x.restore();
      cristo(x, cx, topY + H * 0.06, u * 0.12);
    });
    const orla = baked(w, h, (x) => {
      // morro baixo, prédios da orla e palmeiras em primeiro plano
      x.fillStyle = '#0c1620';
      x.beginPath(); x.moveTo(0, h); x.lineTo(0, Hy + u * 0.1); x.quadraticCurveTo(w * 0.12, Hy + u * 0.07, w * 0.3, Hy + u * 0.12); x.quadraticCurveTo(w * 0.5, Hy + u * 0.2, w * 0.62, h); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(w, h); x.lineTo(w, Hy + u * 0.08); x.quadraticCurveTo(w * 0.86, Hy + u * 0.06, w * 0.78, Hy + u * 0.14); x.quadraticCurveTo(w * 0.72, Hy + u * 0.22, w * 0.7, h); x.closePath(); x.fill();
      for (const [px, py, s, a] of [[w * 0.06, Hy + u * 0.1, u * 0.34, 0.2], [w * 0.14, Hy + u * 0.09, u * 0.26, -0.15], [w * 0.92, Hy + u * 0.09, u * 0.36, -0.2], [w * 0.85, Hy + u * 0.1, u * 0.24, 0.25]]) palmeira(x, px, py, s, a);
      // prédios da orla (pequenos), com luzes
      let px = w * 0.62;
      while (px < w * 0.97) {
        const bw = rand(0.015, 0.03) * u, bh = rand(0.02, 0.07) * u;
        x.fillStyle = '#0e1822'; x.fillRect(px, Hy + u * 0.12 - bh, bw, bh);
        for (let k = 0; k < bh * bw * 0.02; k++) luzes.push({ x: px + rand(1, bw - 1), y: Hy + u * 0.12 - rand(2, bh), ph: rand(TAU), on: Math.random() < 0.7 });
        px += bw + rand(1, 4);
      }
    });
    nuvens = [0, 1, 2, 3, 4].map((i) => ({ img: nuvemSprite(300, 110, '255,170,140', '130,60,110', i + 9), x: rand(w), y: h * (0.1 + i * 0.07) + (i > 2 ? u * 0.15 : 0), s: rand(0.9, 1.5) * (u / 600 + 0.3), v: rand(3, 9), p: 3 + i * 3 }));
    barcos = Array.from({ length: 5 }, () => ({ x: rand(w * 0.2, w * 0.7), y: Hy + rand(0.05, 0.16) * (h - Hy) / 0.3 * 0.3 + 4, v: rand(2, 6), s: rand(0.7, 1.2), ph: rand(TAU) }));
    aves = Array.from({ length: 6 }, () => ({ x: rand(w), y: rand(h * 0.2, h * 0.5), v: rand(25, 45), ph: rand(TAU), s: rand(0.7, 1.1) }));
    camadas = { sky, mar, morros, orla, cx: w * 0.76, cy: Hy - u * 0.47 - u * 0.04, u };
  }
  bake();

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap() { brilho = 1; },
    step(dt, ptr) {
      t += dt; brilho = Math.max(0, brilho - dt * 0.5);
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      for (const n of nuvens) { n.x += n.v * dt; if (n.x > w + 40) n.x = -300 * n.s; }
      for (const b of barcos) { b.x += b.v * dt; if (b.x > w + 30) b.x = -30; }
      for (const a of aves) { a.x += a.v * dt; a.ph += dt * 6; a.y += Math.sin(a.ph * 0.2) * 6 * dt; if (a.x > w + 20) a.x = -20; }
    },
    draw(ctx) {
      const { sky, mar, morros, orla, cx, cy, u } = camadas;
      const Hy = hy();
      ctx.drawImage(sky, 0, 0, w, h);
      nuvens.filter((n) => n.p < 9).forEach((n) => ctx.drawImage(n.img, n.x - par * n.p, n.y, 300 * n.s, 110 * n.s));
      ctx.drawImage(morros, -par * 5, 0, w, h);
      nuvens.filter((n) => n.p >= 9).forEach((n) => ctx.drawImage(n.img, n.x - par * n.p, n.y, 300 * n.s, 110 * n.s));
      // bondinho no cabo entre os dois morros
      const px = w * 0.34 - par * 5, ax = px - u * 0.1, ay = Hy - u * 0.1, bx = px + u * 0.05, by = Hy - u * 0.24;
      ctx.strokeStyle = 'rgba(30,20,40,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      const k = 0.5 + 0.45 * Math.sin(t * 0.25);
      ctx.fillStyle = '#c8402a'; ctx.fillRect(ax + (bx - ax) * k - 4, ay + (by - ay) * k + 1, 8, 5);
      // mar
      ctx.drawImage(mar, 0, Hy, w, h - Hy);
      ctx.globalCompositeOperation = 'lighter';
      brilhosAgua(ctx, w * 0.3, w * 0.3, Hy + 2, h, t, '255,214,140', 0.6, 6);
      ctx.globalCompositeOperation = 'source-over';
      for (const b of barcos) {
        const y = b.y + Math.sin(t + b.ph) * 1.2, s = b.s * (u / 600 + 0.3) * 12;
        ctx.fillStyle = '#150f26'; ctx.beginPath(); ctx.moveTo(b.x - s, y); ctx.lineTo(b.x + s, y); ctx.lineTo(b.x + s * 0.6, y + s * 0.3); ctx.lineTo(b.x - s * 0.6, y + s * 0.3); ctx.fill();
        ctx.fillStyle = 'rgba(255,210,170,.9)'; ctx.beginPath(); ctx.moveTo(b.x, y - s * 1.7); ctx.lineTo(b.x + s * 0.8, y - s * 0.1); ctx.lineTo(b.x, y - s * 0.1); ctx.fill();
        ctx.fillStyle = 'rgba(40,20,60,.9)'; ctx.beginPath(); ctx.moveTo(b.x - 1, y - s * 1.4); ctx.lineTo(b.x - s * 0.6, y - s * 0.1); ctx.lineTo(b.x - 1, y - s * 0.1); ctx.fill();
      }
      ctx.drawImage(orla, -par * 12, 0, w, h);
      // Cristo iluminado (holofotes) e luzes da orla
      ctx.globalCompositeOperation = 'lighter';
      const pulso = 0.45 + Math.sin(t * 1.5) * 0.06 + brilho * 0.6;
      luz(ctx, cx - par * 5, cy, u * (0.09 + brilho * 0.08), '255,236,190', pulso * 0.8);
      luz(ctx, cx - par * 5, cy + u * 0.02, u * 0.3, '255,200,130', 0.12 + brilho * 0.2);
      for (const l of luzes) { const a = l.on ? 0.5 + 0.5 * Math.abs(Math.sin(t * 1.1 + l.ph)) : 0; if (a > 0.2) { ctx.fillStyle = `rgba(255,214,130,${a})`; ctx.fillRect(l.x - par * 12, l.y, 1.8, 1.8); } }
      ctx.globalCompositeOperation = 'source-over';
      // aves
      ctx.strokeStyle = 'rgba(20,10,30,.8)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      for (const a of aves) { const s = 7 * a.s * (u / 600 + 0.3), f = Math.sin(a.ph); ctx.beginPath(); ctx.moveTo(a.x - s, a.y - f * s * 0.6); ctx.quadraticCurveTo(a.x - s * 0.4, a.y - s * 0.3 - f * s * 0.3, a.x, a.y); ctx.quadraticCurveTo(a.x + s * 0.4, a.y - s * 0.3 - f * s * 0.3, a.x + s, a.y - f * s * 0.6); ctx.stroke(); }
    },
  };
}
