import { TAU, rand } from './util.js';
import { baked, ceu, delta, dpr, luz, nuvemSprite, rot, serra } from './paisagem.js';

// Paris ao entardecer: céu rosado, nuvens, telhados, a Torre Eiffel (feita de treliças
// iluminadas), o Sena com o reflexo da torre e um barco. A torre brilha em intervalos
// (e quando você toca); o farol do topo gira. O ponteiro desloca as camadas e agita a água.
export default function paris(w, h, dark, hue) {
  const d = delta(hue, 330);
  let t = 0, flash = 0, timer = 4, par = 0, camadas = null, glints = [], nuvens = [], aneis = [], barco = { x: 0.2, v: 0.012 };

  const tower = () => {
    const hy = h * 0.78;
    const TH = Math.min(h * 0.64, w * 1.15);
    const half = TH * 0.2;
    return { hy, TH, half, cx: w * 0.5 };
  };
  const hw = (T, u) => T.half * (0.022 + 0.978 * u ** 2.5);
  const yu = (T, u) => T.hy - T.TH * (1 - u);

  function bake() {
    const T = tower();
    const sky = baked(w, h, (x) => {
      ceu(x, w, h, [[0, rot('#0b1030', d)], [0.3, rot('#2a2a6a', d)], [0.58, rot('#9a4a86', d)], [0.76, rot('#f08a5a', d)], [1, rot('#ffc27a', d)]]);
      for (let i = 0; i < 90; i++) {
        x.fillStyle = `rgba(255,255,255,${rand(0.2, 0.7)})`;
        x.fillRect(rand(w), rand(h * 0.45), 1.2, 1.2);
      }
      luz(x, w * 0.5, T.hy, h * 0.7, '255,170,110', 0.45);
    });
    const cidade = baked(w, h, (x) => {
      // morros e telhados de Paris ao fundo
      serra(x, w, h, T.hy - 6, 14, 0.012, rot('#3a2350', d), 3);
      let px = 0;
      while (px < w) {
        const bw = rand(26, 58), bh = rand(T.TH * 0.06, T.TH * 0.14);
        const g = x.createLinearGradient(0, T.hy - bh, 0, T.hy);
        g.addColorStop(0, rot('#2a1c40', d)); g.addColorStop(1, rot('#1c1230', d));
        x.fillStyle = g;
        x.fillRect(px, T.hy - bh, bw, bh + 4);
        x.beginPath(); x.moveTo(px - 2, T.hy - bh); x.lineTo(px + bw * 0.18, T.hy - bh - bw * 0.22); x.lineTo(px + bw * 0.82, T.hy - bh - bw * 0.22); x.lineTo(px + bw + 2, T.hy - bh); x.fill();
        for (let wy = T.hy - bh + 8; wy < T.hy - 6; wy += 9) for (let wx = px + 5; wx < px + bw - 6; wx += 9) {
          if (Math.random() < 0.28) { x.fillStyle = 'rgba(255,205,120,.85)'; x.fillRect(wx, wy, 3, 4); }
        }
        px += bw + rand(0, 3);
      }
      // parque: copas escuras
      for (let i = 0; i < w / 7; i++) {
        const tx = rand(w), tr = rand(5, 11);
        x.fillStyle = rot(Math.random() < 0.5 ? '#1c2a2a' : '#17202a', d);
        x.beginPath(); x.arc(tx, T.hy - tr * 0.3, tr, 0, TAU); x.fill();
      }
    });
    const torre = baked(w, h, (x) => {
      const L = (u) => T.cx - hw(T, u), R = (u) => T.cx + hw(T, u);
      // silhueta
      x.beginPath();
      for (let u = 0; u <= 1.001; u += 0.02) x.lineTo(L(u), yu(T, u));
      for (let u = 1; u >= -0.001; u -= 0.02) x.lineTo(R(u), yu(T, u));
      x.closePath();
      const g = x.createLinearGradient(0, T.hy - T.TH, 0, T.hy);
      g.addColorStop(0, 'rgba(70,44,26,.55)'); g.addColorStop(1, 'rgba(40,26,18,.78)');
      x.fillStyle = g; x.fill();
      // arcos: a base é vazada entre as pernas
      x.globalCompositeOperation = 'destination-out';
      x.beginPath(); x.ellipse(T.cx, T.hy + T.TH * 0.02, T.half * 0.6, T.TH * 0.2, 0, Math.PI, TAU); x.fill();
      x.beginPath(); x.ellipse(T.cx, yu(T, 0.74), hw(T, 0.7) * 0.5, T.TH * 0.05, 0, Math.PI, TAU); x.fill();
      x.fillRect(T.cx - hw(T, 0.9) * 0.55, T.hy - T.TH * 0.2, hw(T, 0.9) * 1.1, T.TH * 0.2 + 2);
      x.globalCompositeOperation = 'source-over';
      // treliça iluminada
      x.strokeStyle = 'rgba(255,196,112,.55)'; x.lineWidth = 0.9;
      const braces = (a, b, n) => {
        for (let i = 0; i < n; i++) {
          const u0 = a + ((b - a) * i) / n, u1 = a + ((b - a) * (i + 1)) / n;
          x.beginPath();
          x.moveTo(L(u0), yu(T, u0)); x.lineTo(R(u1), yu(T, u1));
          x.moveTo(R(u0), yu(T, u0)); x.lineTo(L(u1), yu(T, u1));
          x.moveTo(L(u1), yu(T, u1)); x.lineTo(R(u1), yu(T, u1));
          x.stroke();
        }
      };
      braces(0.02, 0.52, 18); braces(0.55, 0.76, 9); braces(0.78, 0.9, 5);
      // bordas das pernas
      x.strokeStyle = 'rgba(255,214,140,.8)'; x.lineWidth = 1.6;
      x.beginPath(); for (let u = 0; u <= 1; u += 0.02) x.lineTo(L(u), yu(T, u)); x.stroke();
      x.beginPath(); for (let u = 0; u <= 1; u += 0.02) x.lineTo(R(u), yu(T, u)); x.stroke();
      // plataformas
      x.fillStyle = 'rgba(255,214,140,.9)';
      for (const u of [0.54, 0.77]) x.fillRect(L(u) - T.TH * 0.012, yu(T, u) - 1.5, hw(T, u) * 2 + T.TH * 0.024, T.TH * 0.012 + 2);
      x.fillRect(T.cx - 1, yu(T, 0) - T.TH * 0.06, 2, T.TH * 0.07); // antena
    });
    const rio = baked(w, h - T.hy, (x, ww, hh) => {
      ceu(x, ww, hh, [[0, rot('#e0805e', d, 0.9)], [0.25, rot('#6a3a78', d, 0.95)], [1, rot('#10122c', d)]]);
    });
    // pontos que cintilam sobre a torre
    glints = [];
    for (let i = 0; i < 260; i++) {
      const u = Math.sqrt(Math.random()) ** 0.9 * 0.95 + 0.02;
      const side = Math.random() < 0.5 ? -1 : 1;
      glints.push({ x: T.cx + side * hw(T, u) * rand(0.1, 1), y: yu(T, u), ph: rand(TAU), sp: rand(1.5, 4) });
    }
    nuvens = [0, 1, 2, 3].map((i) => ({
      img: nuvemSprite(300, 110, '255,170,150', '90,50,110', i + 1),
      x: rand(w), y: h * (0.12 + i * 0.11), s: rand(0.8, 1.5), v: rand(3, 9), p: 6 + i * 4,
    }));
    camadas = { sky, cidade, torre, rio, T };
  }
  bake();

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap(x, y) { flash = 1; if (y > camadas.T.hy) aneis.push({ x, y, r: 2, a: 0.8 }); },
    step(dt, ptr) {
      t += dt;
      timer -= dt;
      if (timer <= 0) { flash = 1; timer = rand(9, 14); }
      flash = Math.max(0, flash - dt * 0.45);
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      for (const n of nuvens) { n.x += n.v * dt; if (n.x > w + 150) n.x = -300 * n.s; }
      barco.x += barco.v * dt; if (barco.x > 1.15) barco.x = -0.15;
      if (ptr.x > -1000 && ptr.y > camadas.T.hy && Math.random() < dt * 6) aneis.push({ x: ptr.x, y: ptr.y, r: 2, a: 0.5 });
      for (const a of aneis) { a.r += dt * 60; a.a -= dt * 0.5; }
      while (aneis.length && aneis[0].a <= 0) aneis.shift();
    },
    draw(ctx) {
      const { sky, cidade, torre, rio, T } = camadas;
      ctx.drawImage(sky, 0, 0, w, h);
      for (const n of nuvens) ctx.drawImage(n.img, n.x - par * n.p, n.y, 300 * n.s, 110 * n.s);
      ctx.drawImage(cidade, -par * 4, 0, w, h);
      ctx.drawImage(torre, -par * 8, 0, w, h);
      const px = -par * 8;

      // farol que gira no topo
      const top = { x: T.cx + px, y: T.hy - T.TH - T.TH * 0.06 };
      ctx.globalCompositeOperation = 'lighter';
      for (const ph of [0, Math.PI]) {
        const a = t * 0.9 + ph, k = Math.cos(a);
        if (k > 0) {
          const len = w * 0.6 * k, ey = Math.sin(a * 0.5) * 6;
          const g = ctx.createLinearGradient(top.x, top.y, top.x + len * (ph ? -1 : 1), top.y + ey);
          g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(1, 'rgba(255,240,200,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(top.x + len * (ph ? -1 : 1), top.y - 20 * k); ctx.lineTo(top.x + len * (ph ? -1 : 1), top.y + 20 * k + ey); ctx.fill();
        }
      }
      luz(ctx, top.x, top.y, 26, '255,235,180', 0.7);

      // brilho de fundo da torre e faíscas
      luz(ctx, T.cx + px, T.hy - T.TH * 0.45, T.TH * 0.5, '255,170,90', 0.18 + flash * 0.25);
      const f = 0.25 + flash * 0.9;
      for (const g of glints) {
        const a = Math.pow(Math.max(0, Math.sin(t * g.sp + g.ph)), 12) * f + (flash > 0.2 ? Math.random() * flash * 0.5 : 0);
        if (a > 0.05) luz(ctx, g.x + px, g.y, 3 + a * 5, '255,236,170', Math.min(1, a));
      }
      ctx.globalCompositeOperation = 'source-over';

      // rio
      const ry = T.hy, rh = h - ry;
      ctx.drawImage(rio, 0, ry, w, rh);
      // reflexo da torre em faixas onduladas
      ctx.save();
      ctx.beginPath(); ctx.rect(0, ry, w, rh); ctx.clip();
      ctx.globalAlpha = 0.34 + flash * 0.2;
      const sh = h * 0.0045;
      for (let y = 0; y < rh; y += sh) {
        const sy = ry - y - sh;
        const off = Math.sin(t * 1.6 + y * 0.35) * (2 + y * 0.05);
        ctx.drawImage(torre, 0, sy * dpr(), w * dpr(), sh * dpr(), off + px, ry + y, w, sh + 0.5);
      }
      ctx.globalAlpha = 1;
      // luzes douradas na água
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,190,110,.5)';
      for (let y = 4; y < rh; y += 6) {
        const wv = 6 + y * 0.12, off = Math.sin(t * 1.4 + y) * wv;
        ctx.globalAlpha = (0.18 + 0.4 * Math.abs(Math.sin(t * 2 + y * 1.3))) * (1 - y / rh);
        ctx.fillRect(T.cx + px + off - 20 - y * 0.2, ry + y, 40 + y * 0.4, 1.4);
      }
      ctx.globalAlpha = 1;
      // barco-mosca com luzes
      const bx = w * barco.x, by = ry + rh * 0.42;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#120f22'; ctx.fillRect(bx - 22, by - 5, 44, 6); ctx.fillRect(bx - 12, by - 10, 22, 5);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = -2; i <= 2; i++) luz(ctx, bx + i * 8, by - 3, 6, '255,220,150', 0.9);
      luz(ctx, bx, by + 6, 40, '255,200,130', 0.25);
      for (const a of aneis) { ctx.strokeStyle = `rgba(255,220,170,${a.a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.r, a.r * 0.3, 0, 0, TAU); ctx.stroke(); }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
