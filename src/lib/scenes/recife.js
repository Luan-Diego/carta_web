import { TAU, rand } from './util.js';
import { baked, ceu, delta, luz, rot, ruido, serra } from './paisagem.js';

// Recife encantado: fundo do mar de águas turquesa com raios de luz, areia clara, uma pequena
// cidade submarina (torres de coral, casa-concha em espiral, casa de vieira, cúpulas de vidro
// ligadas por tubos, naufrágio distante, postes de luz), uma grande pedra, corais, algas que
// balançam, águas-vivas, cardumes e bolhas. Os peixes fogem do ponteiro; tocar solta bolhas
// e faz as janelas brilharem.
export default function recife(w, h, dark, hue) {
  const d = delta(hue, 190);
  let t = 0, par = 0, brilho = 0, camadas = null;
  let bolhas = [], peixes = [], medusas = [], algas = [], luzes = [], bocas = [];
  const U = () => Math.min(h, w * 1.15);
  const fy = () => h * 0.7;
  const PEIXE = ['#ffb347', '#ff6f91', '#ffd93d', '#7fe3b5', '#b19cff'];

  function ramo(x, px, py, ang, len, prof, cor) {
    if (prof === 0 || len < 3) return;
    const ex = px + Math.cos(ang) * len, ey = py + Math.sin(ang) * len;
    x.strokeStyle = cor; x.lineWidth = Math.max(1.5, len * 0.22); x.lineCap = 'round';
    x.beginPath(); x.moveTo(px, py); x.lineTo(ex, ey); x.stroke();
    ramo(x, ex, ey, ang - rand(0.3, 0.55), len * 0.74, prof - 1, cor);
    ramo(x, ex, ey, ang + rand(0.3, 0.55), len * 0.74, prof - 1, cor);
  }

  function pedra(x, cx, by, W, H) {
    const n = ruido(7), pts = [];
    for (let a = Math.PI; a <= TAU + 0.001; a += 0.15) pts.push([cx + Math.cos(a) * (W / 2) * (1 + n(a * 3) * 0.08), by + Math.sin(a) * H * (1 + n(a * 5 + 3) * 0.12)]);
    x.beginPath(); x.moveTo(cx - W / 2, by + 4);
    for (const [px, py] of pts) x.lineTo(px, py);
    x.lineTo(cx + W / 2, by + 4); x.closePath();
    const g = x.createRadialGradient(cx - W * 0.2, by - H * 0.8, W * 0.05, cx, by - H * 0.3, W * 0.6);
    g.addColorStop(0, rot('#c98480', d)); g.addColorStop(0.5, rot('#9a5450', d)); g.addColorStop(1, rot('#5e2e3a', d));
    x.fillStyle = g; x.fill();
    x.save(); x.clip();
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(50,20,30,${rand(0.1, 0.3)})`; x.beginPath(); x.arc(rand(cx - W / 2, cx + W / 2), rand(by - H, by), rand(1, 3), 0, TAU); x.fill(); }
    x.restore();
    ramo(x, cx + W * 0.12, by - H * 0.95, -Math.PI / 2 - 0.2, H * 0.22, 3, rot('#ff8fa8', d));
  }

  function concha(x, cx, by, W, H) {
    const g = x.createLinearGradient(cx - W / 2, 0, cx + W / 2, 0);
    g.addColorStop(0, rot('#f4cdb4', d)); g.addColorStop(0.55, rot('#e4a58c', d)); g.addColorStop(1, rot('#b87868', d));
    x.fillStyle = g; x.beginPath(); x.moveTo(cx - W * 0.5, by);
    x.bezierCurveTo(cx - W * 0.62, by - H * 0.55, cx - W * 0.12, by - H * 0.82, cx + W * 0.12, by - H);
    x.bezierCurveTo(cx + W * 0.5, by - H * 0.82, cx + W * 0.62, by - H * 0.35, cx + W * 0.5, by);
    x.closePath(); x.fill();
    x.strokeStyle = 'rgba(150,85,70,.7)'; x.lineWidth = Math.max(1.5, W * 0.012);
    for (let k = 1; k < 6; k++) {
      const wk = W * (1.02 - k / 6.2);
      x.beginPath(); x.ellipse(cx + (k / 6) * W * 0.06, by - (H * k) / 6.4, wk / 2, wk * 0.12, -0.1, 0.08 * Math.PI, 0.92 * Math.PI); x.stroke();
    }
    // porta em arco e degrau
    const dw = W * 0.2, dh = H * 0.2, dx = cx - W * 0.04;
    x.fillStyle = '#7a4a32'; x.beginPath(); x.moveTo(dx - dw / 2, by); x.lineTo(dx - dw / 2, by - dh + dw / 2); x.arc(dx, by - dh + dw / 2, dw / 2, Math.PI, 0); x.lineTo(dx + dw / 2, by); x.closePath(); x.fill();
    x.fillStyle = '#e8c070'; x.beginPath(); x.arc(dx + dw * 0.25, by - dh * 0.4, dw * 0.05, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,240,220,.6)'; x.beginPath(); x.ellipse(dx, by + 2, dw * 0.8, dw * 0.12, 0, 0, TAU); x.fill();
    luzes.push({ x: dx, y: by - dh * 0.5, r: dw * 1.1, ph: 0, porta: true });
    // vigias redondas
    for (const [px, py, r] of [[cx - W * 0.2, by - H * 0.45, W * 0.07], [cx + W * 0.12, by - H * 0.62, W * 0.055]]) {
      x.fillStyle = '#5a6fa8'; x.beginPath(); x.arc(px, py, r * 1.25, 0, TAU); x.fill();
      x.fillStyle = '#a8e6f2'; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
      luzes.push({ x: px, y: py, r: r * 2.6, ph: rand(TAU) });
    }
    // cano de bolhas no alto
    x.strokeStyle = '#6a78a8'; x.lineWidth = W * 0.035; x.lineCap = 'round';
    x.beginPath(); x.moveTo(cx + W * 0.12, by - H * 0.98); x.lineTo(cx + W * 0.2, by - H * 1.06); x.stroke();
    bocas.push({ x: cx + W * 0.2, y: by - H * 1.07 });
  }

  function domo(x, cx, by, D) {
    const r = D / 2, cy = by - r * 0.95;
    x.fillStyle = '#4a5a88'; x.beginPath(); x.ellipse(cx, by, r * 1.08, r * 0.14, 0, 0, TAU); x.fill();
    x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.clip();
    const g = x.createRadialGradient(cx, cy + r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, 'rgba(255,222,160,.75)'); g.addColorStop(1, 'rgba(150,215,240,.55)');
    x.fillStyle = g; x.fillRect(cx - r, cy - r, D, D);
    x.fillStyle = 'rgba(90,60,70,.8)'; x.fillRect(cx - r, by - r * 0.2, D, r * 0.2);
    x.fillStyle = 'rgba(120,70,60,.85)'; x.beginPath(); x.ellipse(cx - r * 0.2, by - r * 0.3, r * 0.3, r * 0.1, 0, 0, TAU); x.fill();
    x.fillRect(cx - r * 0.22, by - r * 0.55, r * 0.04, r * 0.3);
    x.fillStyle = 'rgba(255,200,120,.9)'; x.beginPath(); x.arc(cx + r * 0.35, by - r * 0.6, r * 0.12, 0, TAU); x.fill();
    x.restore();
    x.strokeStyle = 'rgba(235,250,255,.85)'; x.lineWidth = Math.max(2, r * 0.04);
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke();
    x.beginPath(); x.arc(cx, cy, r * 0.82, Math.PI * 1.05, Math.PI * 1.45); x.stroke();
    x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx, cy - r * 1.35); x.stroke();
    x.fillStyle = rot('#ff8fa8', d); x.beginPath();
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.07 : r * 0.17, a = (i * Math.PI) / 5 - Math.PI / 2; x.lineTo(cx + Math.cos(a) * rr, cy - r * 1.38 + Math.sin(a) * rr); }
    x.closePath(); x.fill();
    luzes.push({ x: cx, y: cy + r * 0.2, r: r * 1.2, ph: 1, domo: true });
  }


  const bolinhas = (x, cx, cy, rx, ry, n, cor) => { for (let i = 0; i < n; i++) { x.fillStyle = cor; x.beginPath(); x.arc(cx + rand(-rx, rx), cy + rand(-ry, ry), rand(0.8, 2.2), 0, TAU); x.fill(); } };
  function vigia(x, px, py, r, quente = true) {
    x.fillStyle = '#4a5a8c'; x.beginPath(); x.arc(px, py, r * 1.3, 0, TAU); x.fill();
    x.fillStyle = quente ? '#ffe2a0' : '#a8e6f2'; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(60,40,30,.6)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px - r, py); x.lineTo(px + r, py); x.moveTo(px, py - r); x.lineTo(px, py + r); x.stroke();
    if (quente) luzes.push({ x: px, y: py, r: r * 3, ph: rand(TAU) });
  }
  // Torre de coral: casa alta em tubo, com anéis, janelas redondas, porta e pólipos no topo
  function torreCoral(x, cx, by, W, H, c1, c2) {
    const top = by - H, g = x.createLinearGradient(cx - W / 2, 0, cx + W / 2, 0);
    g.addColorStop(0, rot(c1, d)); g.addColorStop(0.55, rot(c2, d)); g.addColorStop(1, rot(c1, d, 1));
    x.beginPath(); x.moveTo(cx - W * 0.5, by); x.bezierCurveTo(cx - W * 0.48, by - H * 0.45, cx - W * 0.36, by - H * 0.8, cx - W * 0.34, top + W * 0.2);
    x.ellipse(cx, top + W * 0.2, W * 0.34, W * 0.2, 0, Math.PI, TAU);
    x.bezierCurveTo(cx + W * 0.36, by - H * 0.8, cx + W * 0.48, by - H * 0.45, cx + W * 0.5, by); x.closePath();
    x.fillStyle = g; x.fill();
    x.save(); x.clip();
    x.fillStyle = 'rgba(30,10,40,.18)'; x.fillRect(cx + W * 0.1, top, W, H);
    for (let k = 1; k < 9; k++) { const yy = top + (H * k) / 9; x.strokeStyle = `rgba(40,10,50,${0.12 + (k % 2) * 0.08})`; x.lineWidth = 1.4; x.beginPath(); x.ellipse(cx, yy, W * 0.46, W * 0.05, 0, 0.05 * Math.PI, 0.95 * Math.PI); x.stroke(); }
    bolinhas(x, cx, top + H / 2, W * 0.4, H / 2, 40, 'rgba(255,230,240,.25)');
    x.restore();
    x.fillStyle = 'rgba(20,10,30,.7)'; x.beginPath(); x.ellipse(cx, top + W * 0.18, W * 0.2, W * 0.07, 0, 0, TAU); x.fill();
    for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI, bx = cx + Math.cos(a) * W * 0.3, by2 = top + W * 0.2 + Math.sin(a) * W * 0.18; x.strokeStyle = rot(c2, d); x.lineWidth = 2; x.beginPath(); x.moveTo(bx, by2); x.lineTo(bx + Math.cos(a) * W * 0.07, by2 + Math.sin(a) * W * 0.09); x.stroke(); x.fillStyle = '#ffe9f2'; x.beginPath(); x.arc(bx + Math.cos(a) * W * 0.07, by2 + Math.sin(a) * W * 0.09, 2.2, 0, TAU); x.fill(); }
    const nj = Math.max(2, Math.round(H / (W * 0.9)));
    for (let k = 0; k < nj; k++) vigia(x, cx + (k % 2 ? 1 : -1) * W * 0.1, by - H * (0.32 + (0.5 * k) / nj), W * 0.07, true);
    x.fillStyle = '#6a4030'; x.beginPath(); x.moveTo(cx - W * 0.1, by); x.lineTo(cx - W * 0.1, by - W * 0.2); x.arc(cx, by - W * 0.2, W * 0.1, Math.PI, 0); x.lineTo(cx + W * 0.1, by); x.closePath(); x.fill();
  }
  // Casa-concha de vieira: leque de costelas com porta em arco, vigias e uma pérola
  function vieira(x, cx, by, W) {
    const R = W * 0.56, cy = by - R * 0.12, n = 11;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI;
      x.fillStyle = rot(i % 2 ? '#f5b8c8' : '#e89aae', d);
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); x.arc(cx, cy, R, a0, a1); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(120,50,70,.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); x.stroke();
    }
    x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, R * 0.97, Math.PI, TAU); x.stroke();
    x.fillStyle = rot('#c0687e', d); x.fillRect(cx - W * 0.2, cy, W * 0.4, R * 0.12); x.beginPath(); x.ellipse(cx, cy + R * 0.12, W * 0.2, R * 0.06, 0, 0, Math.PI); x.fill();
    x.fillStyle = '#6a4030'; x.beginPath(); x.moveTo(cx - W * 0.09, by); x.lineTo(cx - W * 0.09, by - W * 0.15); x.arc(cx, by - W * 0.15, W * 0.09, Math.PI, 0); x.lineTo(cx + W * 0.09, by); x.closePath(); x.fill();
    vigia(x, cx - W * 0.22, cy - R * 0.35, W * 0.055); vigia(x, cx + W * 0.22, cy - R * 0.35, W * 0.055); vigia(x, cx, cy - R * 0.6, W * 0.05);
    const pg = x.createRadialGradient(cx - 2, cy - R * 1.02, 1, cx, cy - R * 0.97, W * 0.05); pg.addColorStop(0, '#fff'); pg.addColorStop(1, '#bcd0ee');
    x.fillStyle = pg; x.beginPath(); x.arc(cx, cy - R * 0.97, W * 0.05, 0, TAU); x.fill();
    for (const sx of [-1, 1]) { x.fillStyle = rot('#d87e96', d); x.beginPath(); x.ellipse(cx + sx * W * 0.38, by - 2, W * 0.14, W * 0.05, 0, Math.PI, TAU); x.fill(); }
  }
  // Casco de navio naufragado, inclinado, com mastro e velas rasgadas (usado distante, na bruma)
  function naufragio(x, cx, by, S) {
    x.save(); x.translate(cx, by); x.rotate(-0.14);
    x.fillStyle = rot('#2c5a82', d); x.beginPath(); x.moveTo(-S * 0.5, -S * 0.1); x.lineTo(S * 0.5, -S * 0.2); x.lineTo(S * 0.38, S * 0.06); x.quadraticCurveTo(0, S * 0.12, -S * 0.4, S * 0.04); x.closePath(); x.fill();
    x.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 0; k < 4; k++) x.fillRect(-S * 0.46, -S * 0.08 + k * S * 0.035, S * 0.9, 1.2);
    x.strokeStyle = rot('#24486c', d); x.lineWidth = Math.max(2, S * 0.014);
    for (const mx of [-S * 0.2, S * 0.18]) { x.beginPath(); x.moveTo(mx, -S * 0.14); x.lineTo(mx + S * 0.02, -S * 0.55); x.stroke(); }
    x.fillStyle = 'rgba(180,215,235,.35)'; x.beginPath(); x.moveTo(-S * 0.18, -S * 0.5); x.lineTo(-S * 0.02, -S * 0.46); x.lineTo(-S * 0.08, -S * 0.32); x.lineTo(-S * 0.17, -S * 0.34); x.closePath(); x.fill();
    for (let k = 0; k < 5; k++) { x.fillStyle = 'rgba(255,225,160,.6)'; x.beginPath(); x.arc(-S * 0.34 + k * S * 0.17, -S * 0.07 - k * S * 0.014, S * 0.013, 0, TAU); x.fill(); }
    x.restore();
  }
  function poste(x, cx, by, s) {
    x.strokeStyle = rot('#5a6a98', d); x.lineWidth = Math.max(2, s * 0.05); x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, by); x.lineTo(cx, by - s); x.stroke();
    x.fillStyle = '#ffe9a8'; x.beginPath(); x.arc(cx, by - s - s * 0.06, s * 0.1, 0, TAU); x.fill(); luzes.push({ x: cx, y: by - s - s * 0.06, r: s * 0.8, ph: rand(TAU), porta: true });
  }
  function anemona(x, cx, by, s, cor) {
    for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (k / 13 - 0.5) * 2.1, L = s * rand(0.7, 1); x.strokeStyle = rot(cor, d); x.lineWidth = Math.max(1.5, s * 0.08); x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, by); x.quadraticCurveTo(cx + Math.cos(a) * L * 0.5 + rand(-3, 3), by + Math.sin(a) * L * 0.5, cx + Math.cos(a) * L, by + Math.sin(a) * L); x.stroke(); x.fillStyle = '#fff1f6'; x.beginPath(); x.arc(cx + Math.cos(a) * L, by + Math.sin(a) * L, Math.max(1.2, s * 0.05), 0, TAU); x.fill(); }
  }
  function estrela(x, cx, cy, r, cor) {
    x.fillStyle = rot(cor, d); x.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = (i * Math.PI) / 5 - Math.PI / 2; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill();
  }

  function bake() {
    const u = U(), y0 = fy();
    luzes = []; bocas = [];
    const agua = baked(w, h, (x) => {
      ceu(x, w, h, [[0, rot('#34d2da', d)], [0.35, rot('#1ea8cc', d)], [0.7, rot('#1678b4', d)], [1, rot('#124e8c', d)]]);
      serra(x, w, h, y0 - u * 0.02, u * 0.12, 0.008, rot('#2b86b4', d).replace(',1)', ',.55)'), 61);
      for (let i = 0; i < 9; i++) {
        const tx = rand(w), th = rand(0.1, 0.24) * u, tw = rand(0.02, 0.04) * u;
        x.fillStyle = rot('#3a9cc0', d).replace(',1)', ',.35)');
        x.beginPath(); x.moveTo(tx - tw / 2, y0); x.lineTo(tx - tw * 0.4, y0 - th); x.arc(tx, y0 - th, tw * 0.4, Math.PI, 0); x.lineTo(tx + tw / 2, y0); x.closePath(); x.fill();
      }
    });
    const chao = baked(w, h, (x) => {
      const g = x.createLinearGradient(0, y0, 0, h);
      g.addColorStop(0, rot('#f3e6b8', d)); g.addColorStop(1, rot('#d4bf86', d));
      x.fillStyle = g; x.beginPath(); x.moveTo(-5, h);
      for (let xx = -5; xx <= w + 5; xx += 8) x.lineTo(xx, y0 + Math.sin(xx * 0.011) * u * 0.012 + Math.sin(xx * 0.033) * u * 0.004);
      x.lineTo(w + 5, h); x.closePath(); x.fill();
      for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(150,120,80,${rand(0.08, 0.25)})`; x.beginPath(); x.arc(rand(w), rand(y0 + 6, h), rand(0.8, 2), 0, TAU); x.fill(); }
      for (let q = 0; q < 9; q++) {
        const k = q / 8, px = w * (0.52 - 0.06 * k) + Math.sin(k * 5) * w * 0.02, py = h * 0.98 - (h * 0.98 - (y0 + u * 0.05)) * k, rr = u * (0.06 - 0.045 * k);
        x.fillStyle = 'rgba(120,150,120,.7)'; x.beginPath(); x.ellipse(px, py, rr, rr * 0.35, 0, 0, TAU); x.fill();
        x.fillStyle = 'rgba(190,215,190,.55)'; x.beginPath(); x.ellipse(px, py - rr * 0.07, rr * 0.9, rr * 0.28, 0, 0, TAU); x.fill();
      }
    });
    const larga = w > h * 1.1;
    const longe = baked(w, h, (x) => {
      const L = [[0.07, 0.24, '#b86ab0', '#d88ac8'], [0.3, 0.3, '#6a8ad0', '#8aa8e8'], [0.55, 0.22, '#d8788c', '#f09aa8'], [0.9, 0.28, '#7a6ac8', '#9a8ae0']];
      for (const [fx, fh, c1, c2] of (larga ? L : [L[1], L[3]])) torreCoral(x, w * fx, y0 + u * 0.02, u * 0.08, u * fh, c1, c2);
      naufragio(x, w * (larga ? 0.7 : 0.6), y0 + u * 0.03, u * 0.42);
      domo(x, w * (larga ? 0.42 : 0.18), y0 + u * 0.025, u * 0.12);
      x.globalCompositeOperation = 'source-atop';
      const fg = x.createLinearGradient(0, y0 - u * 0.35, 0, y0 + u * 0.05); fg.addColorStop(0, 'rgba(30,150,190,.62)'); fg.addColorStop(1, 'rgba(30,140,185,.4)');
      x.fillStyle = fg; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'source-over';
    });
    const casas = baked(w, h, (x) => {
      const by = y0 + u * 0.1;
      pedra(x, w * (larga ? 0.08 : 0.1), y0 + u * 0.13, u * 0.28, u * 0.2);
      if (larga) {
        torreCoral(x, w * 0.27, by + u * 0.01, u * 0.13, u * 0.46, '#c4509a', '#e87ac0');
        torreCoral(x, w * 0.72, by, u * 0.1, u * 0.3, '#e08a3c', '#f4b25c');
        vieira(x, w * 0.625, by + u * 0.02, u * 0.25);
        for (const px of [0.38, 0.55, 0.78]) poste(x, w * px, by + u * 0.02, u * 0.1);
        x.strokeStyle = 'rgba(210,240,250,.55)'; x.lineWidth = u * 0.03; x.lineCap = 'round'; x.beginPath(); x.moveTo(w * 0.84 + u * 0.1, by - u * 0.1); x.lineTo(w * 0.95 - u * 0.05, by - u * 0.07); x.stroke();
        x.strokeStyle = 'rgba(120,170,200,.8)'; x.lineWidth = 1.5; x.stroke();
        domo(x, w * 0.955, by, u * 0.17);
      } else {
        torreCoral(x, w * 0.3, by + u * 0.01, u * 0.13, u * 0.42, '#c4509a', '#e87ac0');
        poste(x, w * 0.58, by + u * 0.02, u * 0.1);
      }
      concha(x, w * (larga ? 0.46 : 0.5), by, u * 0.3, u * 0.5);
      domo(x, w * (larga ? 0.84 : 0.88), by, u * 0.3);
    });
    const frente = baked(w, h, (x) => {
      const cores = ['#e0508a', '#ff7a5c', '#a86cd8'];
      for (const [px, dir] of [[w * 0.02, 1], [w * 0.97, -1]]) ramo(x, px, h + 4, -Math.PI / 2 + dir * 0.25, u * 0.11, 5, rot(cores[(Math.random() * 3) | 0], d));
      x.fillStyle = rot('#3d5a8c', d); x.beginPath(); x.ellipse(w * 0.97, h + 6, u * 0.14, u * 0.07, 0, Math.PI, TAU); x.fill();
      x.fillStyle = rot('#3d5a8c', d); x.beginPath(); x.ellipse(w * 0.03, h + 6, u * 0.12, u * 0.06, 0, Math.PI, TAU); x.fill();
    });
    const detalhes = baked(w, h, (x) => {
      for (const [fx, c] of [[0.2, '#ff7a9c'], [0.62, '#ffb347'], [0.9, '#c07aff']]) anemona(x, w * fx, h * 0.93, u * 0.06, c);
      for (let i = 0; i < 9; i++) ramo(x, w * (0.08 + 0.1 * i) + rand(-20, 20), h * rand(0.9, 1.02), -Math.PI / 2 + rand(-0.3, 0.3), u * rand(0.03, 0.05), 4, rot(['#ff6f91', '#ffa24a', '#b98aff', '#ff8fa8'][i % 4], d));
      estrela(x, w * 0.36, h * 0.9, u * 0.03, '#ff8a5c'); estrela(x, w * 0.78, h * 0.95, u * 0.025, '#ffd05c');
      for (let i = 0; i < 26; i++) { const k = rand(w), yy = rand(y0 + u * 0.1, h), r = rand(1.5, 4) * (u / 600); x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,235,225' : '255,200,190'},.7)`; x.beginPath(); x.ellipse(k, yy, r * 1.4, r, 0, 0, TAU); x.fill(); }
    });
    camadas = { agua, chao, longe, casas, frente, detalhes };
    algas = Array.from({ length: 12 }, (_, i) => ({ x: w * (0.04 + 0.92 * (i / 11)) + rand(-10, 10), by: y0 + u * rand(0.04, 0.2), s: u * rand(0.12, 0.26), ph: rand(TAU), c: i % 3 ? '#2fa86a' : '#4ec88a' }));
    peixes = Array.from({ length: 30 }, (_, i) => ({ x: rand(w), y: rand(h * 0.12, y0), v: rand(20, 55) * (i % 2 ? 1 : -1), s: rand(5, 10) * (u / 600), c: PEIXE[i % PEIXE.length], ph: rand(TAU), pan: 0 }));
    medusas = Array.from({ length: 4 }, () => ({ x: rand(w), y: rand(h * 0.1, y0 * 0.8), r: rand(14, 24) * (u / 600), ph: rand(TAU), v: rand(6, 12) }));
    bolhas = [];
  }
  bake();

  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap(x, y) { brilho = 1; for (let i = 0; i < 24; i++) bolhas.push({ x: x + rand(-14, 14), y: y + rand(-8, 8), r: rand(2, 6), v: rand(40, 100), ph: rand(TAU), a: 0.8 }); for (const p of peixes) p.pan = 1; },
    step(dt, ptr) {
      t += dt; brilho = Math.max(0, brilho - dt * 0.4);
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      for (const b of bocas) if (Math.random() < dt * 2) bolhas.push({ x: b.x - par * 8, y: b.y, r: rand(2, 5), v: rand(30, 60), ph: rand(TAU), a: 0.8 });
      if (Math.random() < dt * 3) bolhas.push({ x: rand(w), y: h * 0.95, r: rand(1.5, 4), v: rand(25, 55), ph: rand(TAU), a: 0.6 });
      for (const b of bolhas) { b.y -= b.v * dt; b.x += Math.sin(t * 2 + b.ph) * 14 * dt; if (b.y < -10) b.a = 0; }
      bolhas = bolhas.filter((b) => b.a > 0);
      for (const p of peixes) {
        p.pan = Math.max(0, p.pan - dt * 0.5);
        p.x += p.v * (1 + p.pan * 3) * dt; p.y += Math.sin(t * 1.5 + p.ph) * 10 * dt;
        if (ptr.x > -1000) { const dx = p.x - ptr.x, dy = p.y - ptr.y, dd = dx * dx + dy * dy; if (dd < 14000) { const k = 1 - Math.sqrt(dd) / 118; p.x += (dx / 118) * 260 * k * dt; p.y += (dy / 118) * 260 * k * dt; } }
        if (p.v > 0 && p.x > w + 20) p.x = -20; if (p.v < 0 && p.x < -20) p.x = w + 20;
        p.y = Math.max(h * 0.08, Math.min(fy() + 10, p.y));
      }
      for (const m of medusas) { m.y -= (m.v * (0.6 + 0.6 * Math.sin(t * 2 + m.ph))) * dt; m.x += Math.sin(t * 0.5 + m.ph) * 6 * dt; if (m.y < -40) { m.y = fy(); m.x = rand(w); } }
    },
    draw(ctx) {
      const { agua, chao, longe, casas, frente, detalhes } = camadas, u = U();
      ctx.drawImage(agua, -par * 3, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) {
        const x0 = w * (i / 6) + Math.sin(t * 0.25 + i * 1.7) * 30 - par * 6, wd = w * 0.07;
        const g = ctx.createLinearGradient(0, 0, 0, h * 0.85);
        g.addColorStop(0, `rgba(210,255,255,${0.14 + 0.05 * Math.sin(t * 0.7 + i)})`); g.addColorStop(1, 'rgba(210,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 - wd * 0.3, 0); ctx.lineTo(x0 + wd * 0.3, 0); ctx.lineTo(x0 + w * 0.12 + wd, h * 0.85); ctx.lineTo(x0 + w * 0.12 - wd, h * 0.85); ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(chao, -par * 5, 0, w, h);
      // brilhos de luz na areia
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,230,.35)'; ctx.lineWidth = 1;
      for (let i = 0; i < 36; i++) {
        const cx = (i * 97) % w, cy = fy() + 10 + ((i * 53) % (h - fy() - 14)), a = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.3);
        ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.quadraticCurveTo(cx, cy - 3, cx + 6, cy); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(longe, -par * 6, 0, w, h);
      const px = -par * 9;
      ctx.drawImage(casas, px, 0, w, h);
      ctx.drawImage(detalhes, -par * 11, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const l of luzes) luz(ctx, l.x + px, l.y, l.r, '255,214,140', (l.porta ? 0.28 : l.domo ? 0.12 : 0.4) * (0.8 + 0.2 * Math.sin(t * 2 + l.ph)) + brilho * 0.35);
      ctx.globalCompositeOperation = 'source-over';
      // algas
      ctx.lineCap = 'round';
      for (const a of algas) {
        ctx.strokeStyle = rot(a.c, d); ctx.lineWidth = a.s * 0.07;
        ctx.beginPath(); ctx.moveTo(a.x + px, a.by);
        for (let k = 1; k <= 8; k++) { const q = k / 8; ctx.lineTo(a.x + px + Math.sin(t * 1.2 + a.ph + q * 3) * a.s * 0.18 * q, a.by - a.s * q); }
        ctx.stroke();
      }
      // medusas
      for (const m of medusas) {
        const pul = 1 + 0.12 * Math.sin(t * 3 + m.ph), r = m.r;
        ctx.fillStyle = 'rgba(255,170,220,.5)'; ctx.beginPath(); ctx.ellipse(m.x, m.y, r * (2 - pul), r * pul * 0.9, 0, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(255,190,230,.55)'; ctx.lineWidth = 1.4;
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(m.x + k * r * 0.4, m.y); for (let q = 1; q <= 5; q++) ctx.lineTo(m.x + k * r * 0.4 + Math.sin(t * 2 + q + k) * 3, m.y + q * r * 0.45); ctx.stroke(); }
      }
      // peixes
      for (const p of peixes) {
        const dir = p.v > 0 ? 1 : -1, s = p.s, bat = Math.sin(t * 10 + p.ph) * s * 0.25;
        ctx.fillStyle = rot(p.c, d);
        ctx.beginPath(); ctx.ellipse(p.x, p.y, s * 1.4, s * 0.8, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(p.x - dir * s * 1.2, p.y); ctx.lineTo(p.x - dir * s * 2.3, p.y - s * 0.8 + bat); ctx.lineTo(p.x - dir * s * 2.3, p.y + s * 0.8 + bat); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x + dir * s * 0.7, p.y - s * 0.15, s * 0.28, 0, TAU); ctx.fill();
        ctx.fillStyle = '#123'; ctx.beginPath(); ctx.arc(p.x + dir * s * 0.78, p.y - s * 0.15, s * 0.13, 0, TAU); ctx.fill();
      }
      for (const b of bolhas) {
        ctx.strokeStyle = `rgba(235,252,255,${b.a * 0.75})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${b.a * 0.5})`; ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, TAU); ctx.fill();
      }
      ctx.drawImage(frente, -par * 14, 0, w, h);
    },
  };
}
