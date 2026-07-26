import { TAU, clamp, rand } from './util.js';
import { baked, ceu, delta, dpr, fbm, luz, rot, serra } from './paisagem.js';

// Japão ao anoitecer: o monte Fuji nevado, um pagode, um torii de pé na água (como em
// Itsukushima), lanternas de pedra, folhas de bordo e pétalas caindo, vaga-lumes,
// lanternas flutuando na água e lanternas de papel subindo. Tocar solta uma lanterna.
export default function japao(w, h, dark, hue) {
  const d = delta(hue, 20);
  let t = 0, camadas = null, par = 0;
  let lant = [], flut = [], folhas = [], vagas = [], aneis = [], mist = [];

  const hy = () => h * 0.68;
  const U = () => Math.min(h, w * 1.1); // medida de referência: em telas altas e estreitas os objetos não crescem demais

  function torii(x, cx, by, s) {
    const red = (a, b) => { const g = x.createLinearGradient(0, by - s, 0, by); g.addColorStop(0, rot('#e2452c', d)); g.addColorStop(1, rot('#a82a1c', d)); return g; };
    x.fillStyle = red();
    for (const sd of [-1, 1]) {
      const px = cx + sd * s * 0.27;
      x.beginPath(); x.moveTo(px - s * 0.03 - sd * 0.005 * s, by); x.lineTo(px - s * 0.026, by - s * 0.88); x.lineTo(px + s * 0.026, by - s * 0.88); x.lineTo(px + s * 0.03 + sd * 0.005 * s, by); x.fill();
      x.fillStyle = '#1b1416'; x.fillRect(px - s * 0.034, by - s * 0.05, s * 0.068, s * 0.05); x.fillStyle = red();
    }
    // nuki (viga de baixo)
    x.fillRect(cx - s * 0.36, by - s * 0.66, s * 0.72, s * 0.045);
    // kasagi (viga de cima, com pontas viradas para cima)
    x.beginPath();
    x.moveTo(cx - s * 0.52, by - s * 1.0);
    x.quadraticCurveTo(cx, by - s * 0.9, cx + s * 0.52, by - s * 1.0);
    x.lineTo(cx + s * 0.46, by - s * 0.88);
    x.quadraticCurveTo(cx, by - s * 0.8, cx - s * 0.46, by - s * 0.88);
    x.closePath(); x.fill();
    x.fillStyle = '#17120f';
    x.beginPath();
    x.moveTo(cx - s * 0.54, by - s * 1.03);
    x.quadraticCurveTo(cx, by - s * 0.93, cx + s * 0.54, by - s * 1.03);
    x.lineTo(cx + s * 0.52, by - s * 0.99);
    x.quadraticCurveTo(cx, by - s * 0.89, cx - s * 0.52, by - s * 0.99);
    x.closePath(); x.fill();
    x.fillStyle = red(); x.fillRect(cx - s * 0.03, by - s * 0.88, s * 0.06, s * 0.22);
  }

  function pagode(x, cx, by, s) {
    const piso = [0.56, 0.49, 0.42, 0.35, 0.28];
    let y = by;
    for (let i = 0; i < 5; i++) {
      const ww = s * piso[i], wh = s * 0.085, ow = ww * 1.45, rh = s * 0.05;
      x.fillStyle = '#3b2733'; x.fillRect(cx - ww / 2, y - wh, ww, wh);
      x.fillStyle = 'rgba(255,200,120,.9)';
      for (let k = -1; k <= 1; k++) x.fillRect(cx + k * ww * 0.26 - 3, y - wh * 0.72, 6, wh * 0.42);
      const yb = y - wh;
      x.fillStyle = '#211c36';
      x.beginPath();
      x.moveTo(cx - ow, yb - s * 0.022);
      x.quadraticCurveTo(cx - ow * 0.55, yb + s * 0.008, cx, yb + s * 0.012);
      x.quadraticCurveTo(cx + ow * 0.55, yb + s * 0.008, cx + ow, yb - s * 0.022);
      x.lineTo(cx + ww * 0.42, yb - rh); x.lineTo(cx - ww * 0.42, yb - rh); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(255,170,110,.55)'; x.lineWidth = 1.1;
      x.beginPath(); x.moveTo(cx - ow, yb - s * 0.022); x.quadraticCurveTo(cx - ow * 0.55, yb + s * 0.008, cx, yb + s * 0.012); x.quadraticCurveTo(cx + ow * 0.55, yb + s * 0.008, cx + ow, yb - s * 0.022); x.stroke();
      y = yb - rh * 0.8;
    }
    x.fillStyle = '#2a2230'; x.fillRect(cx - 1.4, y - s * 0.2, 2.8, s * 0.2);
    for (let k = 0; k < 7; k++) x.fillRect(cx - 5 + k * 0.4, y - s * 0.04 - k * s * 0.02, 10 - k * 1.3, 2);
  }

  function lanterna(x, cx, by, s) {
    x.fillStyle = '#4b4650';
    x.fillRect(cx - s * 0.32, by - s * 0.07, s * 0.64, s * 0.07);
    x.fillRect(cx - s * 0.09, by - s * 0.5, s * 0.18, s * 0.43);
    x.fillStyle = '#3c3842'; x.fillRect(cx - s * 0.26, by - s * 0.74, s * 0.52, s * 0.24);
    x.fillStyle = 'rgba(255,190,100,.92)'; x.fillRect(cx - s * 0.15, by - s * 0.69, s * 0.3, s * 0.14);
    x.fillStyle = '#4b4650';
    x.beginPath(); x.moveTo(cx - s * 0.44, by - s * 0.74); x.lineTo(cx, by - s * 0.98); x.lineTo(cx + s * 0.44, by - s * 0.74); x.closePath(); x.fill();
    x.beginPath(); x.arc(cx, by - s * 1.0, s * 0.07, 0, TAU); x.fill();
  }

  function bake() {
    const Hy = hy(), u = U();
    const s = Math.min(w / 700, h / 600);
    const sky = baked(w, h, (x) => {
      ceu(x, w, h, [[0, rot('#14143e', d)], [0.3, rot('#4a3a7c', d)], [0.52, rot('#c8607a', d)], [0.66, rot('#ffb070', d)], [1, rot('#ffd9a0', d)]]);
      for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${rand(0.15, 0.6)})`; x.fillRect(rand(w), rand(h * 0.3), 1.2, 1.2); }
      luz(x, w * 0.6, Hy - h * 0.05, h * 0.55, '255,200,140', 0.5);
      // lua grande e pálida
      const mg = x.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, h * 0.07);
      mg.addColorStop(0, 'rgba(255,248,225,.95)'); mg.addColorStop(1, 'rgba(255,248,225,.0)');
      x.fillStyle = mg; x.beginPath(); x.arc(w * 0.3, h * 0.2, h * 0.07, 0, TAU); x.fill();
    });
    const longe = baked(w, h, (x) => {
      // Fuji
      const cx = w * 0.62, top = Hy - h * 0.4, hb = Math.max(w * 0.34, h * 0.46);
      const g = x.createLinearGradient(0, top, 0, Hy);
      g.addColorStop(0, rot('#6a5a98', d)); g.addColorStop(1, rot('#b08aa8', d));
      const montanha = () => {
        x.beginPath();
        x.moveTo(cx - hb, Hy + 4);
        x.bezierCurveTo(cx - hb * 0.5, Hy - 8, cx - hb * 0.2, top + (Hy - top) * 0.3, cx - hb * 0.07, top);
        x.lineTo(cx + hb * 0.07, top);
        x.bezierCurveTo(cx + hb * 0.2, top + (Hy - top) * 0.3, cx + hb * 0.5, Hy - 8, cx + hb, Hy + 4);
        x.closePath();
      };
      montanha(); x.fillStyle = g; x.fill();
      // neve: só dentro da montanha, com a borda de baixo em dentes
      x.save(); montanha(); x.clip();
      const f = fbm(5), nb = top + (Hy - top) * 0.3;
      x.fillStyle = 'rgba(255,240,246,.93)';
      x.beginPath(); x.moveTo(cx - hb, top - 4); x.lineTo(cx + hb, top - 4);
      for (let i = 24; i >= 0; i--) {
        const k = i / 24, xx = cx - hb * 0.5 + hb * k;
        x.lineTo(xx, nb + (f(i * 0.9) - 0.4) * (Hy - top) * 0.3 + (i % 2 ? 1 : -1) * (Hy - top) * 0.022 + Math.abs(k - 0.5) * (Hy - top) * 0.1);
      }
      x.closePath(); x.fill();
      x.restore();
      // morros e névoa
      serra(x, w, h, Hy - 2, h * 0.07, 0.012, rot('#4a3a6c', d), 8);
      serra(x, w, h, Hy + 4, h * 0.05, 0.02, rot('#30244e', d), 11);
      const mg = x.createLinearGradient(0, Hy - h * 0.14, 0, Hy + 6);
      mg.addColorStop(0, 'rgba(255,200,170,0)'); mg.addColorStop(1, 'rgba(255,205,170,.55)');
      x.fillStyle = mg; x.fillRect(0, Hy - h * 0.14, w, h * 0.14 + 6);
    });
    const margem = baked(w, h, (x) => {
      // pinheiros e pagode na margem esquerda
      const px = w * 0.2, py = Hy + h * 0.015;
      x.fillStyle = '#1c1a2c';
      for (let i = 0; i < 9; i++) {
        const tx = px - w * 0.18 + i * w * 0.05 + rand(-8, 8), th = rand(60, 130) * s * 1.2;
        for (let k = 0; k < 4; k++) { const y = py - th * (k / 4), ww = th * (0.34 - k * 0.07); x.beginPath(); x.moveTo(tx - ww, y); x.lineTo(tx, y - th * 0.38); x.lineTo(tx + ww, y); x.fill(); }
        x.fillRect(tx - 2, py - 6, 4, 8);
      }
      pagode(x, px, py, u * 0.32);
      // terreno
      x.fillStyle = '#16142a';
      const tw = Math.min(w * 0.42, u * 0.5);
      x.beginPath(); x.moveTo(0, Hy + u * 0.09); x.quadraticCurveTo(tw * 0.35, Hy - u * 0.005, tw * 0.8, Hy + u * 0.045); x.quadraticCurveTo(tw * 0.95, Hy + u * 0.07, tw, h); x.lineTo(0, h); x.closePath(); x.fill();
      lanterna(x, tw * 0.25, Hy + u * 0.11, u * 0.09);
      lanterna(x, tw * 0.74, Hy + u * 0.065, u * 0.06);
    });
    const tor = baked(w, h, (x) => torii(x, w * 0.74, Hy + U() * 0.13, U() * 0.34));
    const agua = baked(w, h - Hy, (x, ww, hh) => {
      ceu(x, ww, hh, [[0, rot('#e0907a', d, 0.95)], [0.18, rot('#7a4a8a', d)], [1, rot('#0e0e26', d)]]);
    });
    // galhos de bordo, no canto de cima
    const bordo = baked(w, h, (x) => {
      x.strokeStyle = '#1b1218'; x.lineCap = 'round';
      const ramo = (x0, y0, ang, len, wd, nivel) => {
        x.lineWidth = wd; x.beginPath(); x.moveTo(x0, y0);
        const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
        x.quadraticCurveTo((x0 + x1) / 2 + rand(-8, 8), (y0 + y1) / 2 + rand(-8, 8), x1, y1); x.stroke();
        if (nivel > 0) { ramo(x1, y1, ang + rand(0.2, 0.7), len * 0.7, wd * 0.7, nivel - 1); ramo(x1, y1, ang - rand(0.2, 0.7), len * 0.68, wd * 0.7, nivel - 1); }
        else for (let i = 0; i < 7; i++) {
          const lx = x1 + rand(-18, 18) * s, ly = y1 + rand(-14, 20) * s;
          x.fillStyle = Math.random() < 0.6 ? rot('#d2402a', d, rand(0.7, 0.95)) : rot('#f08a2a', d, rand(0.7, 0.95));
          x.beginPath(); for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU - Math.PI / 2; x.lineTo(lx + Math.cos(a) * 11 * s, ly + Math.sin(a) * 11 * s); x.lineTo(lx + Math.cos(a + 0.6) * 4.5 * s, ly + Math.sin(a + 0.6) * 4.5 * s); } x.fill();
        }
      };
      ramo(-10, h * 0.05, 0.25, h * 0.2, 7 * s, 4);
      ramo(w * 0.04, -8, 0.9, h * 0.13, 5 * s, 3);
    });
    const nevoa = baked(w * 1.4, h * 0.2, (x, ww, hh) => {
      for (let i = 0; i < 12; i++) luz(x, rand(hh, ww - hh), hh * 0.5, hh * rand(0.3, 0.5), '255,210,200', 0.18);
    });
    camadas = { sky, longe, margem, tor, agua, bordo, nevoa };
    mist = [{ x: 0 }, { x: -w * 0.7 }];
  }
  bake();

  const novaLant = (x = rand(w * 0.3, w * 0.9), y = rand(hy(), h)) => lant.push({ x, y, vy: rand(14, 26), ph: rand(TAU), a: 0 });
  for (let i = 0; i < 5; i++) novaLant(rand(w), rand(h * 0.2, h * 0.75));
  for (let i = 0; i < 5; i++) flut.push({ x: rand(w * 0.35, w), y: hy() + rand(0.1, 0.28) * h, vx: rand(2, 6), ph: rand(TAU) });
  for (let i = 0; i < 26; i++) folhas.push({ x: rand(w), y: rand(h), ph: rand(TAU), v: rand(18, 40), r: rand(3, 6), c: Math.random() < 0.5 ? '255,170,190' : '220,80,50' });
  for (let i = 0; i < 14; i++) vagas.push({ x: rand(w * 0.5), y: hy() + rand(0, h * 0.1), ph: rand(TAU), v: rand(0.3, 0.9) });

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap(x, y) { novaLant(x, y); novaLant(x + rand(-30, 30), y + rand(0, 20)); aneis.push({ x, y, r: 2, a: 0.8 }); },
    step(dt, ptr) {
      t += dt;
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      for (const m of mist) { m.x += dt * 6; if (m.x > w) m.x -= w * 1.4 * 2 - 0; }
      if (lant.length < 9 && Math.random() < dt * 0.35) novaLant(rand(w * 0.3, w * 0.95), h * rand(0.7, 0.95));
      for (const l of lant) { l.y -= l.vy * dt; l.x += Math.sin(t * 0.6 + l.ph) * 8 * dt; l.a = Math.min(1, l.a + dt * 0.8); }
      lant = lant.filter((l) => l.y > -30);
      for (const f of flut) { f.x += f.vx * dt; if (f.x > w + 20) f.x = w * 0.3; }
      for (const f of folhas) {
        f.y += f.v * dt; f.x += Math.sin(t * 0.8 + f.ph) * 22 * dt + 8 * dt; f.ph += dt * 1.5;
        if (ptr.x > -1000) { const dx = f.x - ptr.x, dy = f.y - ptr.y, dd = dx * dx + dy * dy; if (dd < 14000) { f.x += (dx / 40) * dt * 60; f.y += (dy / 40) * dt * 30; } }
        if (f.y > h + 10) { f.y = -10; f.x = rand(w); }
      }
      for (const v of vagas) { v.ph += dt * v.v; v.x += Math.sin(v.ph * 1.3) * 12 * dt; v.y += Math.cos(v.ph) * 8 * dt; }
      if (ptr.x > -1000 && ptr.y > hy() && Math.random() < dt * 5) aneis.push({ x: ptr.x, y: ptr.y, r: 2, a: 0.45 });
      for (const a of aneis) { a.r += dt * 55; a.a -= dt * 0.5; }
      aneis = aneis.filter((a) => a.a > 0);
    },
    draw(ctx) {
      const { sky, longe, margem, tor, agua, bordo, nevoa } = camadas;
      const Hy = hy();
      ctx.drawImage(sky, 0, 0, w, h);
      ctx.drawImage(longe, -par * 5, 0, w, h);
      for (const m of mist) ctx.drawImage(nevoa, m.x - w * 0.2, Hy - h * 0.12, w * 1.4, h * 0.2);
      // água e reflexos
      ctx.drawImage(agua, 0, Hy, w, h - Hy);
      ctx.save(); ctx.beginPath(); ctx.rect(0, Hy, w, h - Hy); ctx.clip();
      ctx.globalAlpha = 0.3;
      const k = dpr(), sh = 3;
      for (let y = 0; y < h - Hy; y += sh) {
        const sy = Hy - y * 0.9 - sh;
        ctx.drawImage(longe, 0, Math.max(0, sy * k), w * k, sh * k, Math.sin(t * 1.4 + y * 0.3) * (1 + y * 0.03), Hy + y, w, sh + 0.5);
      }
      for (let y = 0; y < h - Hy; y += sh) {
        const sy = Hy + U() * 0.13 - y - sh;
        if (sy < 0) break;
        ctx.drawImage(tor, 0, sy * k, w * k, sh * k, Math.sin(t * 1.7 + y * 0.4) * (1.5 + y * 0.04), Hy + y + U() * 0.13 - (U() * 0.13), w, sh + 0.5);
      }
      ctx.globalAlpha = 1; ctx.restore();
      ctx.drawImage(margem, -par * 10, 0, w, h);
      ctx.drawImage(tor, -par * 7, 0, w, h);
      // brilho da lua na água
      ctx.globalCompositeOperation = 'lighter';
      for (let y = 2; y < h - Hy; y += 6) {
        ctx.globalAlpha = (0.12 + 0.3 * Math.abs(Math.sin(t * 2 + y * 1.5))) * (1 - y / (h - Hy));
        ctx.fillStyle = 'rgba(255,230,190,.8)'; ctx.fillRect(w * 0.3 + Math.sin(t + y) * 6 - 14 - y * 0.2, Hy + y, 28 + y * 0.4, 1.3);
      }
      ctx.globalAlpha = 1;
      // luz das lanternas de pedra e do pagode
      const fl = 0.8 + Math.sin(t * 9) * 0.08 + Math.sin(t * 5.3) * 0.08;
      { const u = U(), tw = Math.min(w * 0.42, u * 0.5); for (const [lx, ly, lr] of [[tw * 0.25, Hy + u * 0.11 - u * 0.062, u * 0.1], [tw * 0.74, Hy + u * 0.065 - u * 0.04, u * 0.07]]) luz(ctx, lx - par * 10, ly, lr, '255,180,90', 0.5 * fl); }
      // lanternas flutuando
      for (const f of flut) {
        luz(ctx, f.x, f.y, 26, '255,170,80', 0.35 * fl);
        ctx.fillStyle = 'rgba(255,214,140,.95)'; ctx.fillRect(f.x - 5, f.y - 4, 10, 7);
        luz(ctx, f.x, f.y + 9 + Math.abs(Math.sin(t + f.ph)) * 3, 18, '255,170,80', 0.18);
      }
      // lanternas de papel subindo
      for (const l of lant) {
        const fk = (0.75 + Math.sin(t * 7 + l.ph) * 0.12) * l.a;
        luz(ctx, l.x, l.y, 34, '255,160,70', 0.4 * fk);
        const g = ctx.createLinearGradient(l.x, l.y - 9, l.x, l.y + 9);
        g.addColorStop(0, `rgba(255,236,170,${fk})`); g.addColorStop(1, `rgba(255,140,50,${fk})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(l.x - 6, l.y - 9); ctx.lineTo(l.x + 6, l.y - 9); ctx.lineTo(l.x + 8, l.y + 9); ctx.lineTo(l.x - 8, l.y + 9); ctx.closePath(); ctx.fill();
      }
      // vaga-lumes
      for (const v of vagas) { const a = 0.3 + 0.7 * Math.abs(Math.sin(v.ph * 3)); luz(ctx, v.x, v.y, 9, '230,255,150', a * 0.9); }
      ctx.globalCompositeOperation = 'source-over';
      for (const a of aneis) { ctx.strokeStyle = `rgba(255,220,190,${a.a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.r, a.r * 0.3, 0, 0, TAU); ctx.stroke(); }
      // folhas e pétalas
      for (const f of folhas) {
        ctx.fillStyle = `rgba(${f.c},.85)`;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.ph); ctx.scale(1, 0.55 + 0.45 * Math.sin(f.ph * 1.7));
        ctx.beginPath(); ctx.ellipse(0, 0, f.r, f.r * 0.6, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.drawImage(bordo, -par * 14, 0, w, h);
    },
  };
}
