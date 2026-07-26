import { TAU, rand } from './util.js';
import { baked, ceu, delta, luz, nuvemSprite, ruido, rot, serra } from './paisagem.js';

// Vila de inverno ao nascer do sol: montanhas verdes com picos nevados, raios de sol, casinhas
// pastel com neve nos telhados e fumaça nas chaminés, pinheiros nevados e uma placa de madeira
// com o nome "Vila da Carta". O ponteiro sopra a neve; tocar levanta uma rajada de flocos.
export default function inverno(w, h, dark, hue) {
  const d = delta(hue, 215);
  let t = 0, par = 0, rajada = 0, camadas = null, sol = { x: 0, y: 0 };
  let neve = [], fumacas = [], janelas = [], nuvens = [], flocos = [];
  const U = () => Math.min(h, w * 1.15);
  const hy = () => h * 0.56;
  const PASTEL = ['#e8a07a', '#7ab0d8', '#9fcf9a', '#e8c86a', '#c88ab8', '#d9d2c0'];
  const sorteia = (l) => l[(Math.random() * l.length) | 0];

  function monte(x, cx, base, hg, hw, fill, seed) {
    const n = ruido(seed);
    const y = (xx) => base - hg * Math.pow(Math.max(0, 1 - Math.abs(xx - cx) / hw), 1.15) * (0.93 + n(xx * 0.05) * 0.14);
    x.beginPath(); x.moveTo(cx - hw, base);
    for (let xx = cx - hw; xx <= cx + hw; xx += 4) x.lineTo(xx, y(xx));
    x.lineTo(cx + hw, base); x.closePath();
    x.fillStyle = fill; x.fill();
    x.save(); x.clip();
    const capY = base - hg * 0.66, g = x.createLinearGradient(cx - hw * 0.4, 0, cx + hw * 0.4, 0);
    g.addColorStop(0, '#f8fbff'); g.addColorStop(1, '#c8d8f0');
    x.fillStyle = g; x.beginPath(); x.moveTo(cx - hw, base - hg * 1.2); x.lineTo(cx + hw, base - hg * 1.2); x.lineTo(cx + hw, capY);
    for (let xx = cx + hw; xx >= cx - hw; xx -= 7) x.lineTo(xx, capY + Math.abs(Math.sin(xx * 0.09)) * hg * 0.1 + n(xx * 0.1) * hg * 0.06);
    x.closePath(); x.fill();
    x.restore();
  }

  const NEVE = '#f4f8ff', MADEIRA = '#5a3d30';
  function janela(x, wx, wy, ww, wh, venezianas) {
    x.fillStyle = 'rgba(40,30,50,.6)'; x.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);
    x.fillStyle = '#d8c8a0'; x.fillRect(wx, wy, ww, wh);
    x.strokeStyle = 'rgba(60,40,30,.8)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh / 2); x.lineTo(wx + ww, wy + wh / 2); x.stroke();
    if (venezianas) { x.fillStyle = rot(sorteia(['#b5392f', '#2f6e56', '#3a5a9a']), d); x.fillRect(wx - ww * 0.42, wy - 1, ww * 0.38, wh + 2); x.fillRect(wx + ww * 1.04, wy - 1, ww * 0.38, wh + 2); }
    x.fillStyle = NEVE; x.fillRect(wx - 3, wy + wh + 1, ww + 6, 3);
    janelas.push({ x: wx, y: wy, w: ww, h: wh, ph: rand(TAU) });
  }
  function neveTelhado(x, pts, fundo) {
    x.fillStyle = NEVE; x.beginPath();
    pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
    for (let i = pts.length - 1; i >= 0; i--) x.lineTo(pts[i][0], pts[i][1] + fundo * (0.7 + 0.6 * ((i * 37) % 5) / 5));
    x.closePath(); x.fill();
  }
  function chale(x, cx, by, cw, ch, fum) {
    const rh = cw * 0.62, wall = rot(sorteia(PASTEL), d), tel = rot(sorteia(['#5a4a58', '#6a3f3a', '#3f4a5a', '#4a5a48']), d);
    x.fillStyle = wall; x.fillRect(cx - cw / 2, by - ch, cw, ch);
    x.strokeStyle = 'rgba(40,30,50,.13)'; x.lineWidth = 1;
    for (let y = by - ch + 5; y < by; y += 5) { x.beginPath(); x.moveTo(cx - cw / 2, y); x.lineTo(cx + cw / 2, y); x.stroke(); }
    x.fillStyle = 'rgba(40,40,70,.12)'; x.fillRect(cx + cw * 0.05, by - ch, cw * 0.45, ch);
    x.fillStyle = MADEIRA; x.fillRect(cx - cw / 2, by - ch, 3, ch); x.fillRect(cx + cw / 2 - 3, by - ch, 3, ch); x.fillRect(cx - cw / 2, by - ch * 0.5 - 1.5, cw, 3);
    if (fum) { x.fillStyle = '#7a5e58'; x.fillRect(cx + cw * 0.22, by - ch - rh * 0.95, cw * 0.12, rh * 0.62); x.fillStyle = NEVE; x.fillRect(cx + cw * 0.2, by - ch - rh * 0.98, cw * 0.16, 3); fumacas.push({ x: cx + cw * 0.28, y: by - ch - rh * 0.98, p: [] }); }
    x.fillStyle = tel; x.beginPath(); x.moveTo(cx - cw * 0.66, by - ch + 2); x.lineTo(cx, by - ch - rh); x.lineTo(cx + cw * 0.66, by - ch + 2); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.22)'; for (let k = 1; k < 5; k++) { const q = k / 5, yy = by - ch - rh + rh * q, ex = cw * 0.66 * q; x.beginPath(); x.moveTo(cx - ex, yy); x.lineTo(cx + ex, yy); x.stroke(); }
    neveTelhado(x, [[cx - cw * 0.66, by - ch + 2], [cx - cw * 0.33, by - ch - rh * 0.5], [cx, by - ch - rh - 1], [cx + cw * 0.33, by - ch - rh * 0.5], [cx + cw * 0.66, by - ch + 2]], -cw * 0.07);
    if (cw > 36) { // lucarna
      const dw = cw * 0.2, dy = by - ch - rh * 0.34;
      x.fillStyle = wall; x.fillRect(cx - dw / 2, dy, dw, rh * 0.26); x.fillStyle = tel; x.beginPath(); x.moveTo(cx - dw * 0.7, dy + 1); x.lineTo(cx, dy - rh * 0.2); x.lineTo(cx + dw * 0.7, dy + 1); x.closePath(); x.fill();
      x.fillStyle = NEVE; x.beginPath(); x.moveTo(cx - dw * 0.7, dy + 1); x.lineTo(cx, dy - rh * 0.2); x.lineTo(cx, dy - rh * 0.12); x.lineTo(cx - dw * 0.55, dy + 1); x.closePath(); x.fill();
      janelas.push({ x: cx - dw * 0.22, y: dy + rh * 0.05, w: dw * 0.44, h: rh * 0.16, ph: rand(TAU) });
    }
    const ww = cw * 0.17, wh = ch * 0.2;
    for (const k of [-0.28, 0.28]) { janela(x, cx + k * cw - ww / 2, by - ch * 0.86, ww, wh, cw > 34); janela(x, cx + k * cw - ww / 2, by - ch * 0.4, ww, wh, false); }
    x.fillStyle = '#6a4430'; x.beginPath(); x.moveTo(cx - cw * 0.07, by); x.lineTo(cx - cw * 0.07, by - ch * 0.26); x.arc(cx, by - ch * 0.26, cw * 0.07, Math.PI, 0); x.lineTo(cx + cw * 0.07, by); x.closePath(); x.fill();
    x.fillStyle = '#c93a3a'; x.beginPath(); x.arc(cx, by - ch * 0.3, cw * 0.035, 0, TAU); x.fill();
    x.fillStyle = NEVE; x.fillRect(cx - cw * 0.62, by - 2, cw * 1.24, 4);
  }
  function loja(x, cx, by, cw, ch) {
    const wall = rot(sorteia(PASTEL), d), n = 3;
    x.fillStyle = wall; x.fillRect(cx - cw / 2, by - ch, cw, ch);
    x.fillStyle = 'rgba(40,40,70,.12)'; x.fillRect(cx + cw * 0.05, by - ch, cw * 0.45, ch);
    x.fillStyle = rot('#4a3a4a', d); x.fillRect(cx - cw / 2 - 2, by - ch - 4, cw + 4, 6);
    neveTelhado(x, [[cx - cw / 2 - 3, by - ch - 3], [cx - cw * 0.2, by - ch - 7], [cx + cw * 0.2, by - ch - 8], [cx + cw / 2 + 3, by - ch - 3]], 6);
    for (let i = 0; i < n; i++) { const wx = cx - cw * 0.4 + i * cw * 0.3; janela(x, wx, by - ch * 0.88, cw * 0.18, ch * 0.2, false); }
    const aw = cw * 0.9, ay = by - ch * 0.5;
    for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#f6efe0' : rot('#c0392b', d); x.beginPath(); x.moveTo(cx - aw / 2 + (i * aw) / 6, ay); x.lineTo(cx - aw / 2 + ((i + 1) * aw) / 6, ay); x.lineTo(cx - aw / 2 + ((i + 1) * aw) / 6 + 2, ay + ch * 0.12); x.lineTo(cx - aw / 2 + (i * aw) / 6 - 2, ay + ch * 0.12); x.closePath(); x.fill(); }
    janela(x, cx - cw * 0.34, ay + ch * 0.16, cw * 0.3, ch * 0.2, false);
    x.fillStyle = '#6a4430'; x.fillRect(cx + cw * 0.12, by - ch * 0.34, cw * 0.18, ch * 0.34);
    x.fillStyle = NEVE; x.fillRect(cx - cw * 0.52, by - 2, cw * 1.04, 4);
  }
  function torreRelogio(x, cx, by, s) {
    const tw = s * 0.07, th = s * 0.3;
    x.fillStyle = rot('#c9bca0', d); x.fillRect(cx - tw / 2, by - th, tw, th);
    x.fillStyle = 'rgba(40,40,70,.14)'; x.fillRect(cx, by - th, tw / 2, th);
    x.fillStyle = rot('#4a3a58', d); x.beginPath(); x.moveTo(cx - tw * 0.65, by - th); x.lineTo(cx, by - th - s * 0.14); x.lineTo(cx + tw * 0.65, by - th); x.closePath(); x.fill();
    neveTelhado(x, [[cx - tw * 0.65, by - th], [cx - tw * 0.3, by - th - s * 0.07], [cx, by - th - s * 0.14], [cx + tw * 0.3, by - th - s * 0.07], [cx + tw * 0.65, by - th]], -s * 0.012);
    x.fillStyle = '#f6efe0'; x.beginPath(); x.arc(cx, by - th * 0.78, tw * 0.3, 0, TAU); x.fill();
    x.strokeStyle = '#3a2a2a'; x.lineWidth = 1.3; x.beginPath(); x.arc(cx, by - th * 0.78, tw * 0.3, 0, TAU); x.moveTo(cx, by - th * 0.78); x.lineTo(cx, by - th * 0.78 - tw * 0.2); x.moveTo(cx, by - th * 0.78); x.lineTo(cx + tw * 0.14, by - th * 0.78); x.stroke();
    janelas.push({ x: cx - tw * 0.1, y: by - th * 0.5, w: tw * 0.2, h: th * 0.14, ph: 0 });
  }
  function poste(x, cx, by, s) {
    x.fillStyle = '#2a2a38'; x.fillRect(cx - 1.5, by - s, 3, s); x.fillRect(cx - s * 0.1, by - s - 2, s * 0.2, 3);
    janelas.push({ x: cx - s * 0.06, y: by - s - s * 0.16, w: s * 0.12, h: s * 0.14, ph: rand(TAU) });
  }
  function casa(x, cx, by, cw, ch, fum) {
    const r = Math.random();
    if (r < 0.28) loja(x, cx, by, cw * 1.05, ch * 1.15); else chale(x, cx, by, cw, ch, fum);
  }

  function pinheiro(x, cx, by, H) {
    x.fillStyle = '#4a3424'; x.fillRect(cx - H * 0.025, by - H * 0.08, H * 0.05, H * 0.08);
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const top = by - H * (0.96 - i * 0.04) + (H * 0.8 * i) / tiers - H * 0.8 * 0.0, bot = by - H * 0.08 - (H * 0.78 * (tiers - 1 - i)) / tiers;
      const hw = H * (0.1 + i * 0.055);
      const g = x.createLinearGradient(cx - hw, 0, cx + hw, 0);
      g.addColorStop(0, rot('#1f7a48', d)); g.addColorStop(1, rot('#125a38', d));
      x.save();
      x.fillStyle = g; x.beginPath(); x.moveTo(cx, top); x.lineTo(cx + hw, bot); x.lineTo(cx - hw, bot); x.closePath(); x.fill();
      x.clip();
      const yl = top + (bot - top) * 0.55, n = 5, sw = (hw * 2.4) / n;
      x.fillStyle = '#f4f8ff'; x.beginPath(); x.moveTo(cx - hw * 1.2, top - 4); x.lineTo(cx + hw * 1.2, top - 4); x.lineTo(cx + hw * 1.2, yl);
      for (let q = 0; q < n; q++) x.quadraticCurveTo(cx + hw * 1.2 - sw * (q + 0.5), yl + sw * 0.75, cx + hw * 1.2 - sw * (q + 1), yl);
      x.closePath(); x.fill();
      x.restore();
    }
  }

  function placa(x, u) {
    const sw = Math.min(u * 0.38, w * 0.42), sh = sw * 0.46, cx = w * 0.8, cy = h * 0.76, rotacao = -0.05;
    x.fillStyle = '#e8f0fa'; x.beginPath(); x.ellipse(cx, cy + sh * 0.95, sw * 0.32, sh * 0.16, 0, 0, TAU); x.fill();
    x.fillStyle = '#6a4a36'; x.fillRect(cx - sw * 0.035, cy + sh * 0.2, sw * 0.07, sh * 0.78);
    x.save(); x.translate(cx, cy); x.rotate(rotacao);
    const g = x.createLinearGradient(0, -sh / 2, 0, sh / 2);
    g.addColorStop(0, '#c4956a'); g.addColorStop(1, '#9a6c44');
    x.fillStyle = g; x.fillRect(-sw / 2, -sh / 2, sw, sh);
    x.strokeStyle = 'rgba(60,35,20,.35)'; x.lineWidth = 1.5;
    for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(-sw / 2, -sh / 2 + (sh * k) / 4); x.lineTo(sw / 2, -sh / 2 + (sh * k) / 4); x.stroke(); }
    x.strokeStyle = '#6a4228'; x.lineWidth = Math.max(3, sw * 0.02); x.strokeRect(-sw / 2, -sh / 2, sw, sh);
    x.fillStyle = '#f4f8ff'; x.beginPath(); x.moveTo(-sw / 2 - 2, -sh / 2 + 1);
    for (let q = 0; q <= 10; q++) x.lineTo(-sw / 2 + (sw * q) / 10, -sh / 2 - sh * 0.05 - Math.sin(q * 1.7) * sh * 0.04);
    x.lineTo(sw / 2 + 2, -sh / 2 + 1); x.closePath(); x.fill();
    // emblema: envelope com lacre (sem texto)
    const ew = sh * 0.52, eh = ew * 0.68, ey = 0;
    x.fillStyle = '#f6ecd6'; x.fillRect(-ew / 2, ey - eh / 2, ew, eh);
    x.strokeStyle = '#7a4a2e'; x.lineWidth = 2; x.strokeRect(-ew / 2, ey - eh / 2, ew, eh);
    x.beginPath(); x.moveTo(-ew / 2, ey - eh / 2); x.lineTo(0, ey + eh * 0.12); x.lineTo(ew / 2, ey - eh / 2); x.stroke();
    x.fillStyle = '#c9473a'; x.beginPath(); x.arc(0, ey + eh * 0.12, ew * 0.08, 0, TAU); x.fill();
    x.restore();
  }

  function bake() {
    const u = U(), y0 = hy();
    fumacas = []; janelas = [];
    sol = { x: w * 0.45, y: y0 - u * 0.05 };
    const sky = baked(w, h, (x) => ceu(x, w, h, [[0, rot('#5d6cb0', d)], [0.3, rot('#97a8da', d)], [0.55, rot('#e6d6d4', d)], [1, rot('#f8e2c6', d)]]));
    const montes = baked(w, h, (x) => {
      const b = y0 + u * 0.02;
      monte(x, w * 0.1, b, u * 0.3, w * 0.34, rot('#5a8a8e', d), 51);
      monte(x, w * 0.82, b, u * 0.33, w * 0.4, rot('#5a8a8e', d), 52);
      monte(x, w * 0.08, b + u * 0.02, u * 0.26, w * 0.32, rot('#2f6e56', d), 53);
      monte(x, w * 0.78, b + u * 0.02, u * 0.3, w * 0.38, rot('#2f6e56', d), 54);
      serra(x, w, h, y0 + u * 0.035, u * 0.02, 0.05, rot('#1f4a3c', d), 55);
      const nb = x.createLinearGradient(0, y0 - u * 0.1, 0, y0 + u * 0.05);
      nb.addColorStop(0, 'rgba(240,225,225,0)'); nb.addColorStop(1, 'rgba(240,225,225,.5)');
      x.fillStyle = nb; x.fillRect(0, y0 - u * 0.1, w, u * 0.15);
    });
    const planicie = baked(w, h, (x) => {
      const g = x.createLinearGradient(0, y0, 0, h);
      g.addColorStop(0, '#f6f9ff'); g.addColorStop(0.5, '#dfe8f6'); g.addColorStop(1, '#bccbe4');
      x.fillStyle = g; x.beginPath(); x.moveTo(-5, h);
      for (let xx = -5; xx <= w + 5; xx += 8) x.lineTo(xx, y0 + u * 0.035 + Math.sin(xx * 0.008) * u * 0.008);
      x.lineTo(w + 5, h); x.closePath(); x.fill();
      // caminho sinuoso
      x.fillStyle = 'rgba(150,165,196,.55)'; x.beginPath();
      const pt = (q, lado) => { const cx = w * (0.4 + 0.1 * q) + Math.sin(q * 3.2) * w * 0.06, yy = h + 4 - (h + 4 - (y0 + u * 0.05)) * q, lw = (w * 0.2 * (1 - q) + 3) ; return [cx + lado * lw, yy]; };
      for (let q = 0; q <= 1.001; q += 0.05) { const [px, py] = pt(q, -1); q ? x.lineTo(px, py) : x.moveTo(px, py); }
      for (let q = 1; q >= -0.001; q -= 0.05) { const [px, py] = pt(Math.max(0, q), 1); x.lineTo(px, py); }
      x.closePath(); x.fill();
    });
    const vila = baked(w, h, (x) => {
      torreRelogio(x, w * 0.3, y0 + u * 0.1, u * 1.15);
      const filas = [{ by: y0 + u * 0.05, s: 0.5 }, { by: y0 + u * 0.085, s: 0.75 }, { by: y0 + u * 0.18, s: 1.15 }];
      filas.forEach((r, ri) => {
        let cx = w * 0.03 + ri * 14;
        while (cx < w) {
          const cw = u * rand(0.075, 0.1) * r.s * 1.4, ch = cw * rand(0.7, 0.9), mx = cx + cw / 2;
          if (Math.abs(mx - w * 0.5) > w * 0.12 && !(ri === 1 && mx > w * 0.5 && mx < w * 0.86)) casa(x, mx, r.by, cw, ch, Math.random() < 0.4);
          cx += cw * rand(1.15, 1.6);
        }
      });
      for (const f of [0.16, 0.34, 0.62, 0.9]) poste(x, w * f, y0 + u * 0.215, u * 0.16);
    });
    const frente = baked(w, h, (x) => {
      pinheiro(x, w * 0.07, h * 1.03, u * 0.78);
      pinheiro(x, w * 0.955, h * 1.03, u * 0.55);
      placa(x, u);
    });
    const sp = [nuvemSprite(u * 0.8, u * 0.28, '255,255,255', '214,214,238', 5), nuvemSprite(u * 0.8, u * 0.28, '255,255,255', '214,214,238', 11)];
    nuvens = [{ img: sp[0], x: w * 0.08, y: h * 0.06, k: 0.9, v: 4 }, { img: sp[1], x: w * 0.62, y: h * 0.12, k: 0.8, v: 3 }, { img: sp[0], x: w * 0.38, y: h * 0.22, k: 0.55, v: 5 }];
    camadas = { sky, montes, planicie, vila, frente };
    neve = Array.from({ length: Math.round(110 * Math.min(1.3, (w * h) / (1280 * 720) + 0.4)) }, () => ({ x: rand(w), y: rand(h), z: rand(0.4, 1), ph: rand(TAU) }));
  }
  bake();

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap(x, y) { rajada = 1; for (let i = 0; i < 40; i++) flocos.push({ x, y, vx: rand(-140, 140), vy: rand(-180, 20), a: 1, r: rand(1, 2.6) }); },
    step(dt, ptr) {
      t += dt; rajada = Math.max(0, rajada - dt * 0.5);
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      const vento = (ptr.x > -1000 ? Math.max(-60, Math.min(60, ptr.vx * 0.04)) : 0) + rajada * 90;
      for (const n of neve) {
        n.y += (22 + n.z * 44) * dt; n.x += (Math.sin(t * 0.8 + n.ph) * 10 + 5) * dt * n.z + vento * dt * n.z;
        if (ptr.x > -1000) { const dx = n.x - ptr.x, dy = n.y - ptr.y; if (dx * dx + dy * dy < 7000) { n.x += dx * dt * 2; n.y += dy * dt; } }
        if (n.y > h + 4) { n.y = -4; n.x = rand(w); }
        if (n.x > w + 4) n.x = -4; if (n.x < -4) n.x = w + 4;
      }
      for (const n of nuvens) { n.x += n.v * dt; if (n.x > w) n.x = -U() * 0.8 * n.k; }
      for (const c of fumacas) {
        if (Math.random() < dt * 2.5) c.p.push({ x: c.x, y: c.y, r: 2, a: 0.5, vx: rand(4, 10), vy: rand(-18, -10) });
        for (const p of c.p) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 4; p.a -= dt * 0.2; }
        c.p = c.p.filter((p) => p.a > 0);
      }
      for (const f of flocos) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 120 * dt; f.vx *= 1 - dt * 0.8; f.a -= dt * 0.7; }
      flocos = flocos.filter((f) => f.a > 0);
    },
    draw(ctx) {
      const { sky, montes, planicie, vila, frente } = camadas, u = U();
      ctx.drawImage(sky, 0, 0, w, h);
      // sol e raios
      ctx.globalCompositeOperation = 'lighter';
      luz(ctx, sol.x, sol.y, u * 0.5, '255,226,190', 0.28 + rajada * 0.2);
      const R = Math.max(w, h) * 1.2;
      for (let i = 0; i < 14; i++) {
        const a0 = (i / 14) * TAU + t * 0.03;
        ctx.fillStyle = `rgba(255,240,210,${0.05 + 0.03 * Math.sin(t * 0.7 + i)})`;
        ctx.beginPath(); ctx.moveTo(sol.x, sol.y); ctx.lineTo(sol.x + Math.cos(a0) * R, sol.y + Math.sin(a0) * R); ctx.lineTo(sol.x + Math.cos(a0 + 0.1) * R, sol.y + Math.sin(a0 + 0.1) * R); ctx.closePath(); ctx.fill();
      }
      luz(ctx, sol.x, sol.y, u * 0.06, '255,250,235', 0.85);
      ctx.globalCompositeOperation = 'source-over';
      for (const n of nuvens) ctx.drawImage(n.img, n.x - par * 2, n.y, u * 0.8 * n.k, u * 0.28 * n.k);
      ctx.drawImage(montes, -par * 3, 0, w, h);
      ctx.drawImage(planicie, -par * 5, 0, w, h);
      const px = -par * 8;
      ctx.drawImage(vila, px, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const j of janelas) {
        const a = 0.75 + Math.sin(t * 3 + j.ph) * 0.1;
        luz(ctx, j.x + j.w / 2 + px, j.y + j.h / 2, j.w * 1.6, '255,180,90', 0.14 * a);
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const j of janelas) { ctx.fillStyle = `rgba(255,208,120,${0.8 + Math.sin(t * 3 + j.ph) * 0.1})`; ctx.fillRect(j.x + px, j.y, j.w, j.h); }
      for (const c of fumacas) for (const p of c.p) { ctx.fillStyle = `rgba(235,236,245,${p.a * 0.7})`; ctx.beginPath(); ctx.arc(p.x + px, p.y, p.r, 0, TAU); ctx.fill(); }
      ctx.drawImage(frente, -par * 14, 0, w, h);
      for (const n of neve) { ctx.fillStyle = `rgba(255,255,255,${0.4 + n.z * 0.55})`; ctx.beginPath(); ctx.arc(n.x, n.y, 0.8 + n.z * 1.9, 0, TAU); ctx.fill(); }
      for (const f of flocos) { ctx.fillStyle = `rgba(255,255,255,${f.a})`; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill(); }
    },
  };
}
