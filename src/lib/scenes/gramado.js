import { TAU, rand } from './util.js';
import { baked, ceu, delta, luz, rot, serra } from './paisagem.js';

// Gramado no Natal: serra com pinheiros, chalés de enxaimel com janelas acesas e fumaça nas
// chaminés, igreja de pedra, cordões de luzes, uma árvore de Natal enorme e neve caindo.
// O vento do ponteiro empurra a neve; tocar faz as luzes piscarem em festa.
export default function gramado(w, h, dark, hue) {
  const d = delta(hue, 220);
  let t = 0, festa = 0, camadas = null, par = 0, lastPtr = { x: -9999, y: -9999 };
  let janelas = [], bulbos = [], neve = [], fumaca = [], fios = [], faiscas = [];
  const COR = ['255,80,80', '255,200,70', '90,200,255', '120,255,140', '255,130,220', '255,255,240'];
  const U = () => Math.min(h, w * 1.15);

  function casa(x, cx, by, cw, ch, corpo) {
    x.fillStyle = corpo; x.fillRect(cx - cw / 2, by - ch, cw, ch);
    x.strokeStyle = 'rgba(52,34,28,.9)'; x.lineWidth = Math.max(1.2, cw * 0.025);
    x.strokeRect(cx - cw / 2, by - ch, cw, ch);
    x.beginPath(); x.moveTo(cx - cw / 2, by - ch * 0.5); x.lineTo(cx + cw / 2, by - ch * 0.5); x.moveTo(cx, by - ch); x.lineTo(cx, by);
    x.moveTo(cx - cw / 2, by); x.lineTo(cx, by - ch * 0.5); x.lineTo(cx + cw / 2, by); x.stroke();
    // telhado em A
    const rh = cw * 0.62;
    x.fillStyle = '#3d2630';
    x.beginPath(); x.moveTo(cx - cw * 0.62, by - ch + 2); x.lineTo(cx, by - ch - rh); x.lineTo(cx + cw * 0.62, by - ch + 2); x.closePath(); x.fill();
    x.fillStyle = 'rgba(235,242,255,.95)';
    x.beginPath(); x.moveTo(cx - cw * 0.62, by - ch + 2); x.lineTo(cx, by - ch - rh); x.lineTo(cx + cw * 0.62, by - ch + 2);
    x.lineTo(cx + cw * 0.5, by - ch + 2 - cw * 0.05); x.lineTo(cx, by - ch - rh + cw * 0.09); x.lineTo(cx - cw * 0.5, by - ch + 2 - cw * 0.05); x.closePath(); x.fill();
    // chaminé
    x.fillStyle = '#463238'; x.fillRect(cx + cw * 0.2, by - ch - rh * 0.78, cw * 0.1, rh * 0.4);
    fumaca.push({ x: cx + cw * 0.25, y: by - ch - rh * 0.78, p: [] });
    // janelas e porta (acesas dinamicamente)
    const ww = cw * 0.16, wh = ch * 0.22;
    for (const k of [-0.28, 0.28]) janelas.push({ x: cx + k * cw - ww / 2, y: by - ch * 0.82, w: ww, h: wh, ph: rand(TAU), on: Math.random() < 0.85 });
    janelas.push({ x: cx - ww / 2, y: by - ch * 0.38, w: ww, h: wh * 1.4, ph: rand(TAU), on: true });
    x.fillStyle = 'rgba(30,20,22,.5)';
    for (const j of janelas.slice(-3)) x.fillRect(j.x - 1.5, j.y - 1.5, j.w + 3, j.h + 3);
  }

  function arvore(x, cx, by, H) {
    const tiers = 6;
    for (let i = 0; i < tiers; i++) {
      const k = i / tiers;
      const top = by - H * (1 - k * 0.78) + (i ? 0 : 0), bot = by - H * (0.9 - (i + 1) * 0.145) + H * 0.08;
      const hw = H * (0.08 + i * 0.062);
      const g = x.createLinearGradient(cx - hw, 0, cx + hw, 0);
      g.addColorStop(0, '#0d3624'); g.addColorStop(0.5, '#1d6c44'); g.addColorStop(1, '#0b2c1e');
      x.fillStyle = g;
      x.beginPath(); x.moveTo(cx, top); x.lineTo(cx + hw, bot); x.quadraticCurveTo(cx, bot - H * 0.04, cx - hw, bot); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(255,214,120,.75)'; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(cx - hw * 0.92, bot - 2);
      for (let q = 0; q <= 8; q++) x.lineTo(cx - hw * 0.92 + (hw * 1.84 * q) / 8, bot - 2 - Math.sin((q / 8) * Math.PI) * -H * 0.02 - H * 0.012 + (q % 2 ? 2 : 0) * 0);
      x.stroke();
      x.fillStyle = 'rgba(240,246,255,.85)';
      x.beginPath(); x.ellipse(cx + hw * 0.25, bot - 2, hw * 0.28, H * 0.012, 0.1, 0, TAU); x.fill();
      // bulbos dentro do triângulo
      for (let b = 0; b < 8 + i * 3; b++) {
        const yy = top + (bot - top) * Math.sqrt(Math.random()) * 0.95, wid = ((yy - top) / (bot - top)) * hw * 0.9;
        bulbos.push({ x: cx + rand(-wid, wid), y: yy, c: COR[(Math.random() * COR.length) | 0], ph: rand(TAU), sp: rand(1.5, 4) });
      }
    }
    x.fillStyle = '#4a2c20'; x.fillRect(cx - H * 0.03, by - H * 0.05, H * 0.06, H * 0.07);
  }

  function bake() {
    const u = U(), hy = h * 0.6, base = h * 0.76;
    janelas = []; bulbos = []; fumaca = []; fios = [];
    const sky = baked(w, h, (x) => {
      ceu(x, w, h, [[0, rot('#08122e', d)], [0.3, rot('#1c3868', d)], [0.55, rot('#5a6a9c', d)], [0.7, rot('#e8a07c', d)], [1, rot('#f6c490', d)]]);
      for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(255,255,255,${rand(0.2, 0.75)})`; x.fillRect(rand(w), rand(h * 0.42), 1.3, 1.3); }
      luz(x, w * 0.5, hy, u * 0.7, '255,190,130', 0.3);
    });
    const serras = baked(w, h, (x) => {
      serra(x, w, h, hy + u * 0.02, u * 0.16, 0.007, rot('#3a4c7e', d), 21);
      serra(x, w, h, hy + u * 0.06, u * 0.12, 0.011, rot('#26385e', d), 22);
      // fileira de pinheiros na crista
      const f = (xx) => hy + u * 0.09 - 0;
      x.fillStyle = rot('#142744', d);
      for (let px = -10; px < w + 10; px += rand(9, 16)) {
        const th = rand(0.05, 0.1) * u, by = f(px) + rand(-4, 6);
        for (let k = 0; k < 3; k++) { const yy = by - th * (k / 3), ww = th * (0.3 - k * 0.07); x.beginPath(); x.moveTo(px - ww, yy); x.lineTo(px, yy - th * 0.45); x.lineTo(px + ww, yy); x.fill(); }
      }
      x.fillStyle = rot('#142744', d); x.fillRect(0, hy + u * 0.09, w, h);
      const nb = x.createLinearGradient(0, hy - u * 0.02, 0, hy + u * 0.12);
      nb.addColorStop(0, 'rgba(255,205,170,0)'); nb.addColorStop(1, 'rgba(255,215,190,.45)');
      x.fillStyle = nb; x.fillRect(0, hy - u * 0.02, w, u * 0.14);
    });
    const vila = baked(w, h, (x) => {
      const by = base;
      const corpos = ['#a89888', '#b4a090', '#9a8c84', '#bcaa98'];
      let cx = w * 0.33;
      while (cx < w + 40) {
        const cw = rand(0.09, 0.14) * u, ch = cw * rand(0.7, 0.95);
        casa(x, cx + cw * 0.5, by + rand(-4, 6), cw, ch, corpos[(Math.random() * 4) | 0]);
        cx += cw * rand(1.05, 1.3);
      }
      // igreja de pedra
      const ex = w * 0.72, ew = u * 0.15, eh = u * 0.15;
      x.fillStyle = '#8c8290'; x.fillRect(ex - ew / 2, by - eh, ew, eh);
      x.fillStyle = '#7a7080'; x.fillRect(ex - ew * 0.22, by - eh * 2, ew * 0.44, eh * 1.1);
      x.fillStyle = '#2f2c40'; x.beginPath(); x.moveTo(ex - ew * 0.27, by - eh * 2); x.lineTo(ex, by - eh * 3.1); x.lineTo(ex + ew * 0.27, by - eh * 2); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(ex - ew * 0.55, by - eh); x.lineTo(ex, by - eh * 1.6); x.lineTo(ex + ew * 0.55, by - eh); x.closePath(); x.fill();
      janelas.push({ x: ex - 4, y: by - eh * 0.5, w: 8, h: eh * 0.4, ph: 0, on: true, arco: true });
      janelas.push({ x: ex - ew * 0.38, y: by - eh * 0.75, w: 7, h: eh * 0.3, ph: 1, on: true, arco: true });
      janelas.push({ x: ex + ew * 0.38 - 7, y: by - eh * 0.75, w: 7, h: eh * 0.3, ph: 2, on: true, arco: true });
      x.fillStyle = '#e8d8a8'; x.beginPath(); x.arc(ex, by - eh * 1.62, ew * 0.08, 0, TAU); x.fill();
      // neve no chão
      const g = x.createLinearGradient(0, by - 6, 0, h);
      g.addColorStop(0, '#dbe6f6'); g.addColorStop(0.3, '#b4c6e2'); g.addColorStop(1, '#7a90b8');
      x.fillStyle = g;
      x.beginPath(); x.moveTo(0, by + 4);
      for (let xx = 0; xx <= w; xx += 12) x.lineTo(xx, by + 3 + Math.sin(xx * 0.01) * 4 + Math.sin(xx * 0.037) * 3);
      x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
      // cerca e postes
      x.fillStyle = '#3a2a2a';
      for (let xx = w * 0.3; xx < w; xx += 22) x.fillRect(xx, by + 5, 3, 14);
      x.fillRect(w * 0.3, by + 9, w * 0.7, 2.4);
    });
    const arv = baked(w, h, (x) => {
      arvore(x, w * 0.2, h * 0.97, u * 0.78);
      arvore(x, w * 0.93, h * 0.95, u * 0.34);
    });
    // cordões de luzes: catenárias entre o alto de dois postes
    const alturaPoste = h * 0.3;
    for (let i = 0; i < 3; i++) {
      const x0 = -10, x1 = w + 10, ya = alturaPoste - i * 8 + i * 22, sag = u * 0.09 + i * 8;
      const pts = [];
      for (let k = 0; k <= 30; k++) { const q = k / 30; pts.push([x0 + (x1 - x0) * q, ya + Math.sin(q * Math.PI) * sag + (i % 2) * 0]); }
      fios.push(pts);
    }
    camadas = { sky, serras, vila, arv };
    neve = Array.from({ length: Math.round(120 * Math.min(1.3, (w * h) / (1280 * 720) + 0.4)) }, () => ({ x: rand(w), y: rand(h), z: rand(0.4, 1), ph: rand(TAU) }));
    camadas.fumaca = fumaca;
  }
  bake();

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap(x, y) { festa = 1; for (let i = 0; i < 26; i++) faiscas.push({ x, y, vx: rand(-120, 120), vy: rand(-160, 20), c: COR[(Math.random() * COR.length) | 0], a: 1 }); },
    step(dt, ptr) {
      lastPtr = ptr;
      t += dt; festa = Math.max(0, festa - dt * 0.35);
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      const vento = ptr.x > -1000 ? clamp2(ptr.vx * 0.04, -60, 60) : 0;
      for (const n of neve) {
        n.y += (24 + n.z * 46) * dt; n.x += (Math.sin(t * 0.8 + n.ph) * 10 + 6) * dt * n.z + vento * dt * n.z;
        if (ptr.x > -1000) { const dx = n.x - ptr.x, dy = n.y - ptr.y; if (dx * dx + dy * dy < 7000) { n.x += dx * dt * 2; n.y += dy * dt; } }
        if (n.y > h + 4) { n.y = -4; n.x = rand(w); }
        if (n.x > w + 4) n.x = -4; if (n.x < -4) n.x = w + 4;
      }
      for (const c of fumaca) {
        if (Math.random() < dt * 3) c.p.push({ x: c.x, y: c.y, r: 3, a: 0.5, vx: rand(4, 12), vy: rand(-22, -12) });
        for (const p of c.p) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 5; p.a -= dt * 0.18; }
        c.p = c.p.filter((p) => p.a > 0);
      }
      for (const f of faiscas) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 160 * dt; f.a -= dt * 0.9; }
      faiscas = faiscas.filter((f) => f.a > 0);
    },
    draw(ctx) {
      const { sky, serras, vila, arv } = camadas;
      ctx.drawImage(sky, 0, 0, w, h);
      ctx.drawImage(serras, -par * 4, 0, w, h);
      ctx.drawImage(vila, -par * 8, 0, w, h);
      const px = -par * 8;
      ctx.globalCompositeOperation = 'lighter';
      // janelas acesas
      for (const j of janelas) {
        if (!j.on) continue;
        const a = 0.82 + Math.sin(t * 4 + j.ph) * 0.07 + Math.sin(t * 9.3 + j.ph * 2) * 0.05;
        luz(ctx, j.x + j.w / 2 + px, j.y + j.h / 2, j.w * 2.3, '255,170,80', 0.35 * a + festa * 0.2);
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const j of janelas) {
        if (!j.on) continue;
        const a = 0.82 + Math.sin(t * 4 + j.ph) * 0.07;
        ctx.fillStyle = `rgba(255,205,110,${a})`;
        if (j.arco) { ctx.beginPath(); ctx.moveTo(j.x + px, j.y + j.h); ctx.lineTo(j.x + px, j.y + j.w / 2); ctx.arc(j.x + j.w / 2 + px, j.y + j.w / 2, j.w / 2, Math.PI, 0); ctx.lineTo(j.x + j.w + px, j.y + j.h); ctx.fill(); }
        else { ctx.fillRect(j.x + px, j.y, j.w, j.h); ctx.fillStyle = 'rgba(60,36,28,.7)'; ctx.fillRect(j.x + px + j.w / 2 - 0.6, j.y, 1.2, j.h); ctx.fillRect(j.x + px, j.y + j.h / 2 - 0.6, j.w, 1.2); }
      }
      // fumaça
      for (const c of fumaca) for (const p of c.p) { ctx.fillStyle = `rgba(200,205,225,${p.a * 0.6})`; ctx.beginPath(); ctx.arc(p.x + px, p.y, p.r, 0, TAU); ctx.fill(); }
      ctx.drawImage(arv, -par * 14, 0, w, h);
      const ax = -par * 14;
      // luzes: bulbos da árvore, estrela e cordões
      ctx.globalCompositeOperation = 'lighter';
      for (const b of bulbos) {
        const base = 0.35 + 0.65 * Math.max(0, Math.sin(t * b.sp + b.ph));
        let a = Math.min(1, base * (0.8 + festa * 0.9));
        if (perto(lastPtr, b.x + ax, b.y)) a = 1;
        luz(ctx, b.x + ax, b.y, 3.5 + a * 4, b.c, 0.95 * a);
        if (a > 0.5) { ctx.fillStyle = `rgba(${b.c},${a})`; ctx.beginPath(); ctx.arc(b.x + ax, b.y, 1.6, 0, TAU); ctx.fill(); }
      }
      const ex = w * 0.2 + ax, ey = h * 0.97 - U() * 0.78;
      luz(ctx, ex, ey, 30 + festa * 30, '255,230,150', 0.8 + Math.sin(t * 3) * 0.1);
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(t * 0.2); ctx.fillStyle = 'rgba(255,240,170,.95)';
      ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = (i * Math.PI) / 5 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
      fios.forEach((pts, fi) => {
        pts.forEach(([x, y], k) => {
          if (k % 2) return;
          const c = COR[(k / 2 + fi * 2) % COR.length | 0], a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 + k * 0.9 + fi)) ;
          luz(ctx, x + px * 0.6, y, 4 + a * 3 + festa * 4, c, 0.9 * Math.min(1, a + festa * 0.5));
          ctx.fillStyle = `rgba(${c},${Math.min(1, a + 0.3)})`; ctx.beginPath(); ctx.arc(x + px * 0.6, y, 1.8, 0, TAU); ctx.fill();
        });
      });
      for (const f of faiscas) luz(ctx, f.x, f.y, 8, f.c, f.a);
      ctx.globalCompositeOperation = 'source-over';
      // fios
      ctx.strokeStyle = 'rgba(30,24,30,.7)'; ctx.lineWidth = 1;
      for (const pts of fios) { ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x + px * 0.6, y) : ctx.moveTo(x + px * 0.6, y))); ctx.stroke(); }
      // neve caindo
      for (const n of neve) { ctx.fillStyle = `rgba(255,255,255,${0.35 + n.z * 0.55})`; ctx.beginPath(); ctx.arc(n.x, n.y, 0.8 + n.z * 1.9, 0, TAU); ctx.fill(); }
    },
  };
}
const clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
const perto = (p, x, y) => p.x > -1000 && (p.x - x) ** 2 + (p.y - y) ** 2 < 900;
