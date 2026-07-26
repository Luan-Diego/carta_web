import { TAU, clamp, rand } from './util.js';
import { baked, brilhosAgua, ceu, delta, luz, nuvemSprite, rot, serra } from './paisagem.js';

// Pássaros ao pôr do sol: um bando que voa em conjunto (cada ave segue vizinhos, evita
// bater e acompanha o rumo do grupo), outro bando distante, nuvens em camadas, o sol
// sobre o lago e juncos. As aves fogem do ponteiro; tocar assusta o bando, que depois se reúne.
export default function passaros(w, h, dark, hue) {
  const d = delta(hue, 20);
  let t = 0, panico = 0, par = 0, camadas = null, nuvens = [], lastPtr = { x: -9999, y: -9999 };
  let perto = [], longe = [];
  const U = () => Math.min(h, w * 1.1);
  const hy = () => h * 0.76;

  const ave = (x, y, z) => ({ x, y, vx: rand(40, 80) * (Math.random() < 0.85 ? 1 : -1), vy: rand(-10, 10), z, ph: rand(TAU), sp: rand(7, 10) });
  function popular() {
    const n = Math.round(clamp((w * h) / (1280 * 720), 0.5, 1.2) * 46);
    perto = Array.from({ length: n }, () => ave(rand(w * 0.1, w * 0.5), rand(h * 0.2, h * 0.5), rand(0.6, 1.1)));
    longe = Array.from({ length: Math.round(n * 0.6) }, () => ave(rand(w), rand(h * 0.3, h * 0.55), rand(0.25, 0.4)));
  }

  function bake() {
    const u = U(), Hy = hy();
    const sky = baked(w, h, (x) => {
      ceu(x, w, Hy, [[0, rot('#2a1c52', d)], [0.35, rot('#7a3a7a', d)], [0.62, rot('#d8566a', d)], [0.85, rot('#ff9a56', d)], [1, rot('#ffd88a', d)]]);
      const sx = w * 0.62, sy = Hy - u * 0.015;
      luz(x, sx, sy, u * 0.75, '255,170,90', 0.5);
      luz(x, sx, sy, u * 0.25, '255,220,150', 0.65);
      const g = x.createRadialGradient(sx, sy, 0, sx, sy, u * 0.07);
      g.addColorStop(0, 'rgba(255,252,230,1)'); g.addColorStop(0.9, 'rgba(255,225,160,1)'); g.addColorStop(1, 'rgba(255,200,120,0)');
      x.fillStyle = g; x.beginPath(); x.arc(sx, sy, u * 0.07, 0, TAU); x.fill();
    });
    const serras = baked(w, h, (x) => {
      serra(x, w, h, Hy + 2, u * 0.12, 0.006, rot('#7a3a68', d), 31);
      serra(x, w, h, Hy + 2, u * 0.07, 0.011, rot('#4a2450', d), 32);
      serra(x, w, h, Hy + 3, u * 0.03, 0.02, rot('#2a1838', d), 33);
    });
    const lago = baked(w, h - Hy, (x, ww, hh) => {
      ceu(x, ww, hh, [[0, rot('#ffb070', d)], [0.12, rot('#c05a76', d)], [0.5, rot('#5a2c68', d)], [1, rot('#1c1030', d)]]);
    });
    const juncos = baked(w, h, (x) => {
      x.strokeStyle = '#120a1a'; x.lineCap = 'round';
      for (const [bx, dir] of [[0, 1], [w, -1]]) {
        for (let i = 0; i < 26; i++) {
          const x0 = bx + dir * rand(0, w * 0.2), len = rand(0.12, 0.3) * u, ang = -Math.PI / 2 + dir * rand(-0.35, 0.3);
          x.lineWidth = rand(1.2, 2.4);
          x.beginPath(); x.moveTo(x0, h + 4); x.quadraticCurveTo(x0 + Math.cos(ang) * len * 0.4 + dir * 8, h - len * 0.5, x0 + Math.cos(ang) * len, h - len * 0.9 + 4); x.stroke();
          if (i % 3 === 0) { x.fillStyle = '#120a1a'; x.beginPath(); x.ellipse(x0 + Math.cos(ang) * len, h - len * 0.9, 3, 10, ang + Math.PI / 2, 0, TAU); x.fill(); }
        }
      }
    });
    nuvens = [];
    const tipos = [[0.14, 0.9, 5], [0.27, 1.2, 9], [0.4, 1.5, 14]];
    tipos.forEach(([ky, esc, v], li) => {
      for (let i = 0; i < 4; i++) nuvens.push({ img: nuvemSprite(300, 110, '255,190,140', '120,50,100', li * 10 + i + 3), x: rand(w * 1.2) - 100, y: h * ky + rand(-0.04, 0.05) * h, s: esc * rand(0.8, 1.3) * (u / 600 + 0.3), v: v * rand(0.7, 1.3), p: 3 + li * 5 });
    });
    camadas = { sky, serras, lago, juncos };
  }
  bake(); popular();

  function mover(lista, dt, ptr, forca, rumo, z0) {
    const n = lista.length;
    let cx = 0, cy = 0, avx = 0, avy = 0;
    for (const a of lista) { cx += a.x; cy += a.y; avx += a.vx; avy += a.vy; }
    cx /= n; cy /= n; avx /= n; avy /= n;
    const su = U() / 600;
    for (const a of lista) {
      let ax = (cx - a.x) * 0.25 * forca + (avx - a.vx) * 0.9 * forca + (rumo.x - a.x) * 0.05, ay = (cy - a.y) * 0.25 * forca + (avy - a.vy) * 0.9 * forca + (rumo.y - a.y) * 0.1;
      for (const b of lista) {
        if (a === b) continue;
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy, r = 24 * su * (z0 ? 0.5 : 1);
        if (d2 < r * r && d2 > 0.01) { const dd = Math.sqrt(d2); ax += (dx / dd) * 160 * (1 - dd / r); ay += (dy / dd) * 160 * (1 - dd / r); }
      }
      if (ptr.x > -1000 && !z0) {
        const dx = a.x - ptr.x, dy = a.y - ptr.y, d2 = dx * dx + dy * dy, r = 170 * su;
        if (d2 < r * r) { const dd = Math.sqrt(d2) || 1; ax += (dx / dd) * 600 * (1 - dd / r); ay += (dy / dd) * 600 * (1 - dd / r); }
      }
      if (panico > 0 && !z0) { ax += a.vx * 1.2 * panico + rand(-60, 60) * panico; ay += rand(-60, 60) * panico - 30 * panico; }
      // mantém no céu
      if (a.y < h * 0.08) ay += 120; if (a.y > hy() * 0.8) ay -= 160;
      a.vx += ax * dt; a.vy += ay * dt;
      const sp = Math.hypot(a.vx, a.vy) || 1, vmin = (z0 ? 28 : 70) * su, vmax = (z0 ? 50 : 120) * su * (1 + panico * 0.8);
      const k = clamp(sp, vmin, vmax) / sp; a.vx *= k; a.vy *= k;
      a.x += a.vx * dt; a.y += a.vy * dt; a.ph += dt * a.sp * (0.8 + panico);
      if (a.x > w + 40) a.x = -40; else if (a.x < -40) a.x = w + 40;
    }
  }

  function desenhar(ctx, a, cor, alvo) {
    const s = (7 + 9 * a.z) * (U() / 600 + 0.25);
    const f = Math.sin(a.ph);
    const dir = a.vx >= 0 ? 1 : -1;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(clamp(Math.atan2(a.vy, Math.abs(a.vx)), -0.6, 0.6) * dir);
    ctx.scale(dir, 1);
    ctx.fillStyle = cor; ctx.strokeStyle = cor; ctx.lineWidth = Math.max(1.1, s * 0.12); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.14, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.42, -s * 0.02, s * 0.09, 0, TAU); ctx.fill();
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * s * 0.35, -f * s * 0.55 - s * 0.2, side * s * 0.85, -f * s * 0.85 + s * 0.05 * (1 - f));
      ctx.quadraticCurveTo(side * s * 0.4, -f * s * 0.3 + s * 0.08, 0, s * 0.06); ctx.fill();
    }
    ctx.restore();
  }

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); popular(); },
    tap(x, y) { panico = 1; for (let i = 0; i < 5 && perto.length < 80; i++) perto.push(ave(x + rand(-20, 20), y + rand(-20, 20), rand(0.6, 1.1))); for (const a of perto) { const dx = a.x - x, dy = a.y - y, dd = Math.hypot(dx, dy) || 1; a.vx += (dx / dd) * 120; a.vy += (dy / dd) * 120; } },
    step(dt, ptr) {
      lastPtr = ptr; t += dt;
      panico = Math.max(0, panico - dt * 0.55);
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      const rumoA = { x: w * (0.5 + 0.38 * Math.sin(t * 0.11)), y: h * (0.3 + 0.1 * Math.sin(t * 0.17 + 1)) };
      mover(perto, dt, ptr, 1 - panico * 0.7, rumoA, false);
      mover(longe, dt, ptr, 1, { x: w * (0.5 + 0.45 * Math.sin(t * 0.07 + 2)), y: h * 0.4 }, true);
      for (const n of nuvens) { n.x += n.v * dt; if (n.x > w + 40) n.x = -300 * n.s; }
      if (perto.length > 52 && Math.random() < dt * 0.3) perto.shift();
    },
    draw(ctx) {
      const { sky, serras, lago, juncos } = camadas;
      const Hy = hy();
      ctx.drawImage(sky, 0, 0, w, h);
      nuvens.filter((n) => n.p < 8).forEach((n) => ctx.drawImage(n.img, n.x - par * n.p, n.y, 300 * n.s, 110 * n.s));
      for (const a of longe) desenhar(ctx, a, 'rgba(60,24,70,.55)');
      nuvens.filter((n) => n.p >= 8).forEach((n) => ctx.drawImage(n.img, n.x - par * n.p, n.y, 300 * n.s, 110 * n.s));
      ctx.drawImage(serras, -par * 4, 0, w, h);
      ctx.drawImage(lago, 0, Hy, w, h - Hy);
      ctx.globalCompositeOperation = 'lighter';
      brilhosAgua(ctx, w * 0.62, w * 0.62, Hy + 2, h, t, '255,210,140', 0.55, 6);
      ctx.globalCompositeOperation = 'source-over';
      for (const a of perto) desenhar(ctx, a, 'rgba(24,10,30,.92)');
      ctx.drawImage(juncos, -par * 12, 0, w, h);
    },
  };
}
