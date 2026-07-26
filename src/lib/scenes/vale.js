import { TAU, rand } from './util.js';
import { baked, ceu, delta, fbm, luz, nuvemSprite, rot, serra } from './paisagem.js';

// Vila japonesa ao entardecer: prédios de vários andares com beirais curvos, janelas de shoji
// acesas, um pagode, um canal com ponte de arco vermelha e barcos, barracas de ramen, guioza,
// dango e chá com cortinas (noren) e letreiros em japonês, lanternas de papel que brilham,
// cerejeiras em flor, um paredão com cachoeira ao fundo e pétalas ao vento.
// O ponteiro sopra as pétalas e acende as lanternas próximas; tocar faz uma rajada de pétalas.
const FONTE = '"Noto Sans JP","Noto Sans CJK JP","Hiragino Sans","Yu Gothic","Meiryo",sans-serif';
const GESSO = ['#f0e7d3', '#e8dcc0', '#f5eddc', '#dfd2b6'];
const TELHA = ['#3f4a5c', '#5a3f3c', '#2f4a4c', '#4a4258'];
const ROSA = ['#f7bfd0', '#f2a3bd', '#fbd6e1', '#ffe8ef', '#ec8fb0'];
const PLACAS = ['酒', '麺', '茶', '宿', '薬', '餅', '蕎麦', '寿司'];
const BARRACAS = [
  { noren: 'ラーメン', lanterna: '麺', toldo: '#c0392b', tipo: 'ramen' },
  { noren: '餃子', lanterna: '焼', toldo: '#24406e', tipo: 'guioza' },
  { noren: '団子', lanterna: '甘', toldo: '#2f7a5a', tipo: 'dango' },
  { noren: 'お茶', lanterna: '茶', toldo: '#8a3f7a', tipo: 'cha' },
];

export default function vale(w, h, dark, hue) {
  const d = delta(hue, 20);
  let t = 0, par = 0, festa = 0, camadas = null, canal = null, ptrAtual = { x: -9999, y: -9999 };
  let nuvens = [], vapor = [], petalas = [], flut = [], aves = [], luzes = [], janelas = [];
  let queda = { x: 0, y0: 0, y1: 0 };
  const U = () => Math.min(h, w * 1.1);
  const sorteia = (l) => l[(Math.random() * l.length) | 0];

  function txt(x, s, cx, cy, size, cor, vert = false) {
    x.font = `bold ${size}px ${FONTE}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = cor;
    if (!vert) x.fillText(s, cx, cy);
    else [...s].forEach((c, i) => x.fillText(c, cx, cy + (i - (s.length - 1) / 2) * size * 1.05));
  }

  // Telhado de beiral curvo: y = linha do beiral, hg = altura, w = largura total
  function telhado(x, cx, y, wd, hg, cor) {
    const L = cx - wd / 2, R = cx + wd / 2, tp = hg * 0.45;
    x.save();
    x.beginPath(); x.moveTo(L, y - tp);
    x.quadraticCurveTo(L + wd * 0.06, y + hg * 0.12, L + wd * 0.16, y + hg * 0.12); x.lineTo(R - wd * 0.16, y + hg * 0.12);
    x.quadraticCurveTo(R - wd * 0.06, y + hg * 0.12, R, y - tp);
    x.quadraticCurveTo(R - wd * 0.22, y - hg * 0.3, R - wd * 0.27, y - hg); x.lineTo(L + wd * 0.27, y - hg);
    x.quadraticCurveTo(L + wd * 0.22, y - hg * 0.3, L, y - tp); x.closePath();
    x.fillStyle = cor; x.fill(); x.clip();
    const g = x.createLinearGradient(0, y - hg, 0, y + hg * 0.12);
    g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(10,5,15,.4)');
    x.fillStyle = g; x.fillRect(L, y - hg, wd, hg * 1.2);
    x.strokeStyle = 'rgba(0,0,0,.22)'; x.lineWidth = 1;
    for (let k = 1; k < 6; k++) { x.beginPath(); x.moveTo(L, y - (hg * k) / 6); x.lineTo(R, y - (hg * k) / 6); x.stroke(); }
    x.strokeStyle = 'rgba(0,0,0,.1)';
    for (let q = L; q < R; q += Math.max(5, wd / 26)) { x.beginPath(); x.moveTo(q, y - hg); x.lineTo(q + (q - cx) * 0.18, y + hg * 0.12); x.stroke(); }
    x.restore();
    x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(L + wd * 0.27, y - hg - 1, wd * 0.46, 2.5);
    x.fillStyle = 'rgba(25,12,12,.5)'; x.fillRect(L + wd * 0.17, y + hg * 0.12, wd * 0.66, hg * 0.16);
  }

  function chochin(x, cx, cy, s, glifo, reg = true, p = 6) {
    x.strokeStyle = 'rgba(40,20,20,.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx, cy - s * 0.9); x.lineTo(cx, cy - s * 0.55); x.stroke();
    const g = x.createLinearGradient(cx - s * 0.4, 0, cx + s * 0.4, 0);
    g.addColorStop(0, rot('#a42a22', d)); g.addColorStop(0.5, rot('#ee5a3c', d)); g.addColorStop(1, rot('#a42a22', d));
    x.fillStyle = '#2a1a14'; x.fillRect(cx - s * 0.2, cy - s * 0.58, s * 0.4, s * 0.1); x.fillRect(cx - s * 0.2, cy + s * 0.5, s * 0.4, s * 0.08);
    x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, s * 0.4, s * 0.52, 0, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(80,15,10,.5)'; x.lineWidth = 1;
    for (let k = -2; k <= 2; k++) { x.beginPath(); x.ellipse(cx, cy, s * 0.4, s * (0.1 + Math.abs(k) * 0.1), 0, 0, TAU); if (!k) x.stroke(); }
    if (glifo) txt(x, glifo, cx, cy, s * 0.46, 'rgba(255,235,200,.95)');
    if (reg) luzes.push({ x: cx, y: cy, r: s * 2.4, p, ph: rand(TAU) });
  }

  // Prédio de madeira e gesso com andares, beirais, shoji, sacada e placa vertical
  function predio(x, cx, by, bw, pisos, acesas = true) {
    const fh = bw * 0.38, gesso = rot(sorteia(GESSO), d), tel = rot(sorteia(TELHA), d);
    x.fillStyle = rot('#8d857a', d); x.fillRect(cx - bw / 2 - 1, by - fh * 0.16, bw + 2, fh * 0.16);
    let y = by - fh * 0.16;
    for (let i = 0; i < pisos; i++) {
      const wf = bw * (1 - i * 0.09), L = cx - wf / 2;
      x.fillStyle = gesso; x.fillRect(L, y - fh, wf, fh);
      x.fillStyle = 'rgba(70,45,30,.1)'; x.fillRect(cx, y - fh, wf / 2, fh);
      const nP = Math.max(3, Math.round(wf / (fh * 0.66))), pw = (wf - 3) / nP;
      for (let k = 0; k < nP; k++) {
        const wx = L + 3 + k * pw + pw * 0.12, ww = pw * 0.76, wy = y - fh + fh * 0.2, wh = fh * 0.6;
        const porta = i === 0 && k === (nP >> 1);
        if (porta) {
          x.fillStyle = rot('#5a3d2c', d); x.fillRect(wx, y - fh * 0.82, ww, fh * 0.82);
          x.fillStyle = rot('#243a66', d); x.fillRect(wx - 1, y - fh * 0.82, ww + 2, fh * 0.3);
          x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(wx + ww * 0.45, y - fh * 0.8, 1.2, fh * 0.26);
          continue;
        }
        x.fillStyle = rot('#4b3428', d); x.fillRect(wx - 1.5, wy - 1.5, ww + 3, wh + 3);
        x.fillStyle = '#cfc4a2'; x.fillRect(wx, wy, ww, wh);
        if (acesas && Math.random() < 0.72) janelas.push({ x: wx, y: wy, w: ww, h: wh, p: 6, ph: rand(TAU) });
        x.strokeStyle = rot('#4b3428', d); x.lineWidth = 1;
        x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh / 2); x.lineTo(wx + ww, wy + wh / 2); x.stroke();
      }
      x.fillStyle = rot('#4b3428', d);
      for (let k = 0; k <= nP; k++) x.fillRect(L + (wf - 3) * (k / nP), y - fh, 3, fh);
      x.fillRect(L, y - fh, wf, 3); x.fillRect(L, y - 3, wf, 3);
      if (i === 1) {
        x.fillStyle = rot('#6a4630', d); x.fillRect(L - 4, y - fh * 0.1, wf + 8, 3); x.fillRect(L - 4, y - fh * 0.34, wf + 8, 2);
        x.strokeStyle = rot('#6a4630', d); x.lineWidth = 1;
        for (let q = L - 3; q < L + wf + 5; q += 6) { x.beginPath(); x.moveTo(q, y - fh * 0.34); x.lineTo(q, y - fh * 0.1); x.stroke(); }
      }
      const topo = i === pisos - 1;
      telhado(x, cx, y - fh, wf * (topo ? 1.28 : 1.22), fh * (topo ? 0.95 : 0.34), tel);
      if (topo) { x.fillStyle = rot('#d9b04a', d); for (const sx of [-1, 1]) { x.beginPath(); x.arc(cx + sx * wf * 0.3, y - fh - fh * 0.95, fh * 0.07, 0, TAU); x.fill(); } }
      if (i === 0 && bw > 40 && Math.random() < 0.55) {
        const lx = cx - wf / 2 + wf * 0.1, ly = y - fh * 0.62;
        chochin(x, lx, ly, fh * 0.34, '', acesas, 6); chochin(x, cx + wf / 2 - wf * 0.1, ly, fh * 0.34, '', acesas, 6);
      }
      y -= fh + fh * 0.2;
    }
    if (bw > 50 && Math.random() < 0.65) {
      const s = sorteia(PLACAS), sx = cx + bw / 2 - fh * 0.1, sy = by - fh * 0.16 - fh * 0.95, vm = Math.random() < 0.5;
      x.fillStyle = vm ? rot('#b5392f', d) : '#f3ecdc'; x.fillRect(sx - fh * 0.14, sy, fh * 0.28, fh * (0.34 + 0.3 * s.length));
      x.strokeStyle = '#3a2418'; x.lineWidth = 1; x.strokeRect(sx - fh * 0.14, sy, fh * 0.28, fh * (0.34 + 0.3 * s.length));
      txt(x, s, sx, sy + fh * (0.17 + 0.15 * s.length), fh * 0.22, vm ? '#f6ecd6' : '#2a1812', true);
    }
  }

  function pagode(x, cx, by, s) {
    let y = by;
    for (let i = 0; i < 5; i++) {
      const wf = s * 0.17 * (1 - i * 0.14), fh = s * 0.075;
      x.fillStyle = rot('#efe3c6', d); x.fillRect(cx - wf / 2, y - fh, wf, fh);
      x.fillStyle = rot('#b5392f', d);
      for (const k of [0, 1 / 3, 2 / 3, 1]) x.fillRect(cx - wf / 2 + (wf - 3) * k, y - fh, 3, fh);
      x.fillRect(cx - wf / 2, y - fh, wf, 3);
      x.fillStyle = 'rgba(40,24,20,.75)'; x.fillRect(cx - wf * 0.12, y - fh * 0.8, wf * 0.24, fh * 0.5);
      telhado(x, cx, y - fh, wf * 1.75, fh * 0.9, rot('#3b5a5a', d));
      y -= fh + fh * 0.24;
    }
    x.strokeStyle = rot('#c9a64a', d); x.lineWidth = Math.max(2, s * 0.006);
    x.beginPath(); x.moveTo(cx, y + s * 0.02); x.lineTo(cx, y - s * 0.1); x.stroke();
    for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(cx, y - s * 0.015 - k * s * 0.018, s * 0.016 * (1 - k * 0.1), s * 0.005, 0, 0, TAU); x.stroke(); }
  }

  function ramoS(x, px, py, ang, len, wd, prof, alvo) {
    const ex = px + Math.cos(ang) * len, ey = py + Math.sin(ang) * len;
    x.strokeStyle = rot('#4a3030', d); x.lineCap = 'round'; x.lineWidth = Math.max(1, wd);
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo((px + ex) / 2 + rand(-1, 1) * len * 0.12, (py + ey) / 2 + rand(-1, 1) * len * 0.1, ex, ey); x.stroke();
    if (prof <= 0) { alvo.push([ex, ey, len]); return; }
    const n = prof > 3 ? 3 : 2;
    for (let i = 0; i < n; i++) ramoS(x, ex, ey, ang + (i - (n - 1) / 2) * rand(0.45, 0.85) + rand(-0.15, 0.15), len * rand(0.68, 0.8), wd * 0.68, prof - 1, alvo);
  }
  function sakura(x, cx, by, s, lean, prof = 6) {
    const alvo = [];
    ramoS(x, cx, by, -Math.PI / 2 + lean, s * 0.3, s * 0.045, prof, alvo);
    alvo.sort(() => Math.random() - 0.5);
    for (const [ex, ey, len] of alvo) {
      for (let k = 0; k < 11; k++) {
        const r = s * rand(0.014, 0.034), a = rand(TAU), dd = rand(0, 1) * (len * 1.4 + s * 0.02);
        x.fillStyle = rot(sorteia(ROSA), d, rand(0.78, 0.95)); x.beginPath(); x.arc(ex + Math.cos(a) * dd, ey + Math.sin(a) * dd * 0.8, r, 0, TAU); x.fill();
      }
    }
  }

  function barraca(x, cx, by, bw, tp) {
    const topo = by - bw * 0.98, post = Math.max(2, bw * 0.03);
    x.fillStyle = 'rgba(20,14,20,.3)'; x.beginPath(); x.ellipse(cx, by + 1, bw * 0.62, bw * 0.05, 0, 0, TAU); x.fill();
    const cg = x.createLinearGradient(0, by - bw * 0.36, 0, by);
    cg.addColorStop(0, rot('#a8764a', d)); cg.addColorStop(1, rot('#6a4630', d));
    x.fillStyle = cg; x.fillRect(cx - bw * 0.5, by - bw * 0.36, bw, bw * 0.36);
    x.strokeStyle = 'rgba(40,24,16,.4)'; x.lineWidth = 1;
    for (let k = 1; k < 5; k++) { const yy = by - bw * 0.36 + (bw * 0.36 * k) / 5; x.beginPath(); x.moveTo(cx - bw * 0.5, yy); x.lineTo(cx + bw * 0.5, yy); x.stroke(); }
    x.fillStyle = rot('#c89868', d); x.fillRect(cx - bw * 0.54, by - bw * 0.39, bw * 1.08, bw * 0.04);
    x.fillStyle = rot('#5a3a28', d); x.fillRect(cx - bw * 0.5, topo, post, by - topo); x.fillRect(cx + bw * 0.5 - post, topo, post, by - topo);
    // tampo cheio: panela, tigelas, cestos
    const ty = by - bw * 0.39;
    if (tp.tipo === 'ramen') {
      for (const k of [-0.18, 0.1]) {
        const bx = cx + k * bw;
        x.fillStyle = '#f4efe6'; x.beginPath(); x.ellipse(bx, ty - bw * 0.02, bw * 0.1, bw * 0.03, 0, 0, TAU); x.fill();
        x.beginPath(); x.moveTo(bx - bw * 0.1, ty - bw * 0.02); x.quadraticCurveTo(bx, ty + bw * 0.09, bx + bw * 0.1, ty - bw * 0.02); x.fill();
        x.fillStyle = rot('#c0392b', d); x.fillRect(bx - bw * 0.095, ty - bw * 0.02, bw * 0.19, bw * 0.012);
        x.fillStyle = '#f2c860'; x.beginPath(); x.ellipse(bx, ty - bw * 0.025, bw * 0.08, bw * 0.02, 0, 0, TAU); x.fill();
        x.fillStyle = '#fff6e0'; x.beginPath(); x.arc(bx + bw * 0.03, ty - bw * 0.03, bw * 0.017, 0, TAU); x.fill();
        vapor.push({ x: bx, y: ty - bw * 0.05, p: 10, pts: [] });
      }
      x.fillStyle = '#8a929c'; x.fillRect(cx + bw * 0.28, ty - bw * 0.14, bw * 0.17, bw * 0.14); x.fillStyle = '#a8b0ba'; x.beginPath(); x.ellipse(cx + bw * 0.365, ty - bw * 0.14, bw * 0.085, bw * 0.025, 0, 0, TAU); x.fill();
      vapor.push({ x: cx + bw * 0.365, y: ty - bw * 0.16, p: 10, pts: [] });
    } else if (tp.tipo === 'guioza') {
      for (let k = 0; k < 3; k++) {
        const sw = bw * 0.2, sy = ty - bw * 0.05 - k * bw * 0.06, bx = cx - bw * 0.2;
        x.fillStyle = rot('#c9a060', d); x.fillRect(bx - sw / 2, sy - bw * 0.05, sw, bw * 0.06);
        x.strokeStyle = '#7a5a30'; x.lineWidth = 1; x.strokeRect(bx - sw / 2, sy - bw * 0.05, sw, bw * 0.06);
      }
      vapor.push({ x: cx - bw * 0.2, y: ty - bw * 0.24, p: 10, pts: [] });
      x.fillStyle = '#f4efe6'; x.beginPath(); x.ellipse(cx + bw * 0.22, ty - bw * 0.02, bw * 0.15, bw * 0.035, 0, 0, TAU); x.fill();
      x.fillStyle = '#e8c870';
      for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(cx + bw * (0.12 + k * 0.05), ty - bw * 0.035, bw * 0.022, bw * 0.012, 0, 0, Math.PI); x.fill(); }
      vapor.push({ x: cx + bw * 0.22, y: ty - bw * 0.05, p: 10, pts: [] });
    } else if (tp.tipo === 'dango') {
      x.fillStyle = '#3a2a22'; x.fillRect(cx - bw * 0.3, ty - bw * 0.06, bw * 0.6, bw * 0.06);
      const C = ['#f6a8c0', '#f8f4ea', '#8fcf80'];
      for (let k = 0; k < 5; k++) {
        const sx = cx - bw * 0.24 + k * bw * 0.12;
        x.strokeStyle = '#a07a4a'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(sx, ty - bw * 0.06); x.lineTo(sx, ty - bw * 0.3); x.stroke();
        for (let q = 0; q < 3; q++) { x.fillStyle = C[q]; x.beginPath(); x.arc(sx, ty - bw * 0.12 - q * bw * 0.055, bw * 0.027, 0, TAU); x.fill(); }
      }
    } else {
      x.fillStyle = '#4a6a5a'; x.beginPath(); x.ellipse(cx - bw * 0.14, ty - bw * 0.07, bw * 0.09, bw * 0.075, 0, 0, TAU); x.fill();
      x.fillRect(cx - bw * 0.14 - 2, ty - bw * 0.16, 4, bw * 0.05);
      x.fillStyle = '#8a929c'; x.fillRect(cx + bw * 0.2, ty - bw * 0.12, bw * 0.15, bw * 0.12); x.fillStyle = '#a8b0ba'; x.beginPath(); x.ellipse(cx + bw * 0.275, ty - bw * 0.12, bw * 0.075, bw * 0.022, 0, 0, TAU); x.fill();
      vapor.push({ x: cx + bw * 0.275, y: ty - bw * 0.14, p: 10, pts: [] });
      x.fillStyle = '#f4efe6'; for (const k of [-0.02, 0.04]) { x.beginPath(); x.ellipse(cx + k * bw, ty - bw * 0.015, bw * 0.03, bw * 0.012, 0, 0, TAU); x.fill(); }
    }
    // toldo listrado com borda recortada e cortina (noren)
    const lw = bw * 1.24, n = 8, sw = lw / n, ty0 = topo - bw * 0.08, ty1 = topo + bw * 0.1;
    for (let i = 0; i < n; i++) {
      x.fillStyle = i % 2 ? '#f6efe0' : rot(tp.toldo, d);
      x.beginPath(); x.moveTo(cx - lw * 0.42 + (i * lw * 0.84) / n, ty0); x.lineTo(cx - lw * 0.42 + ((i + 1) * lw * 0.84) / n, ty0);
      x.lineTo(cx - lw / 2 + (i + 1) * sw, ty1); x.lineTo(cx - lw / 2 + i * sw, ty1); x.closePath(); x.fill();
      x.beginPath(); x.arc(cx - lw / 2 + (i + 0.5) * sw, ty1, sw / 2, 0, Math.PI); x.fill();
    }
    x.fillStyle = 'rgba(20,10,10,.22)'; x.fillRect(cx - lw / 2, ty1 - 1, lw, 3);
    const chars = [...tp.noren], nn = chars.length, tw = bw * 0.9, pw = tw / nn - 2, ny = ty1 + bw * 0.07, nh = bw * 0.3;
    chars.forEach((c, i) => {
      const nx = cx - tw / 2 + i * (tw / nn) + 1;
      x.fillStyle = rot('#243a66', d); x.fillRect(nx, ny, pw, nh);
      x.fillStyle = 'rgba(255,255,255,.14)'; x.fillRect(nx, ny, pw, 2);
      x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(nx + pw - 2, ny, 2, nh);
      txt(x, c, nx + pw / 2, ny + nh * 0.5, Math.min(pw * 0.86, bw * 0.2), '#f6efe0');
    });
    chochin(x, cx - bw * 0.58, ty1 + bw * 0.12, bw * 0.17, tp.lanterna, true, 10);
    chochin(x, cx + bw * 0.58, ty1 + bw * 0.12, bw * 0.17, tp.lanterna, true, 10);
    // banquinhos
    x.fillStyle = rot('#7a5236', d);
    for (const k of [-0.28, 0.28]) { x.beginPath(); x.ellipse(cx + k * bw, by + bw * 0.1, bw * 0.07, bw * 0.025, 0, 0, TAU); x.fill(); x.fillRect(cx + k * bw - 2, by + bw * 0.1, 4, bw * 0.06); }
  }

  function ponteArco(x, cx, yb, span, arco) {
    const L = cx - span / 2, R = cx + span / 2, esp = span * 0.05;
    const yy = (xx) => yb - arco * (1 - ((xx - cx) / (span / 2)) ** 2);
    x.fillStyle = 'rgba(20,30,50,.35)'; x.beginPath(); x.ellipse(cx, yb + span * 0.02, span * 0.5, span * 0.03, 0, 0, TAU); x.fill();
    x.fillStyle = rot('#6a4630', d); for (const px of [L + span * 0.06, R - span * 0.06]) x.fillRect(px - span * 0.012, yy(px), span * 0.024, span * 0.1);
    x.beginPath(); for (let xx = L; xx <= R; xx += 3) x.lineTo(xx, yy(xx));
    for (let xx = R; xx >= L; xx -= 3) x.lineTo(xx, yy(xx) + esp); x.closePath();
    const g = x.createLinearGradient(0, yb - arco, 0, yb + esp); g.addColorStop(0, rot('#d84a36', d)); g.addColorStop(1, rot('#8a2a22', d));
    x.fillStyle = g; x.fill();
    x.strokeStyle = 'rgba(40,10,8,.4)'; x.lineWidth = 1;
    for (let xx = L + 4; xx < R; xx += span * 0.03) { x.beginPath(); x.moveTo(xx, yy(xx)); x.lineTo(xx, yy(xx) + esp); x.stroke(); }
    const al = span * 0.075;
    x.strokeStyle = rot('#c0392b', d); x.lineWidth = Math.max(2, span * 0.011);
    for (const k of [1, 0.5]) { x.beginPath(); for (let xx = L; xx <= R; xx += 3) { const y2 = yy(xx) - al * k; xx === L ? x.moveTo(xx, y2) : x.lineTo(xx, y2); } x.stroke(); }
    x.lineWidth = Math.max(1.5, span * 0.007);
    for (let i = 0; i <= 10; i++) { const xx = L + (span * i) / 10; x.beginPath(); x.moveTo(xx, yy(xx)); x.lineTo(xx, yy(xx) - al); x.stroke(); }
    x.fillStyle = rot('#d9b04a', d); for (const xx of [L, R]) { x.beginPath(); x.arc(xx, yy(xx) - al - span * 0.012, span * 0.014, 0, TAU); x.fill(); }
  }

  function bake() {
    const u = U(), yh = h * 0.68, cx0 = w * 0.5;
    luzes = []; janelas = []; vapor = [];
    const hwF = u * 0.05, hwN = Math.min(u * 0.27, w * 0.17);
    const hw = (y) => hwF + (hwN - hwF) * Math.max(0, (y - yh) / (h - yh));
    canal = { yh, cx0, hw };
    const fundo = baked(w, h, (x) => {
      serra(x, w, h, h * 0.5, u * 0.14, 0.006, rot('#8fa6d0', d), 31);
      serra(x, w, h, h * 0.56, u * 0.1, 0.01, rot('#7a96b8', d), 32);
      const f = fbm(41), L = w * 0.4, R = w + 10, topo = h * 0.13, base = yh;
      const borda = (xx) => topo + f(xx * 0.02) * u * 0.05;
      x.beginPath(); x.moveTo(L - w * 0.1, base); x.lineTo(L, topo + u * 0.06);
      for (let xx = L; xx <= R; xx += 6) x.lineTo(xx, borda(xx));
      x.lineTo(R, base); x.closePath();
      const g = x.createLinearGradient(L, 0, w, 0);
      g.addColorStop(0, rot('#d79a62', d)); g.addColorStop(0.5, rot('#bb7e4c', d)); g.addColorStop(1, rot('#8f5c3a', d));
      x.fillStyle = g; x.fill();
      x.save(); x.clip();
      x.strokeStyle = 'rgba(70,40,25,.22)'; x.lineWidth = 1.4;
      for (let k = 0; k < 7; k++) {
        const yy = topo + u * 0.05 + k * u * 0.06; x.beginPath();
        for (let xx = L - 40; xx <= R; xx += 10) { const y2 = yy + Math.sin(xx * 0.02 + k * 2) * 3; xx === L - 40 ? x.moveTo(xx, y2) : x.lineTo(xx, y2); }
        x.stroke();
      }
      for (let k = 0; k < 28; k++) { const xx = rand(L, R); x.beginPath(); x.moveTo(xx, topo); x.lineTo(xx + rand(-14, 14), rand(topo + u * 0.1, base)); x.stroke(); }
      const br = x.createLinearGradient(0, base - u * 0.25, 0, base);
      br.addColorStop(0, 'rgba(250,215,190,0)'); br.addColorStop(1, 'rgba(250,215,190,.65)');
      x.fillStyle = br; x.fillRect(0, base - u * 0.25, w, u * 0.25);
      x.restore();
      for (let xx = L + 10; xx < R; xx += rand(10, 22)) {
        x.fillStyle = rot(Math.random() < 0.5 ? '#4e8f46' : '#3b7a3e', d); x.beginPath(); x.arc(xx, borda(xx) + 2, rand(0.012, 0.024) * u, Math.PI, 0); x.fill();
      }
      queda = { x: w * 0.74, y0: borda(w * 0.74) + 3, y1: base - u * 0.1 };
      const gw = x.createLinearGradient(0, queda.y0, 0, queda.y1);
      gw.addColorStop(0, 'rgba(245,250,255,.95)'); gw.addColorStop(1, 'rgba(225,238,248,.7)');
      x.fillStyle = gw; x.fillRect(queda.x - u * 0.018, queda.y0, u * 0.036, queda.y1 - queda.y0);
    });
    const vila = baked(w, h, (x) => {
      // fileira distante (neblina), pagode
      for (let cx = -10; cx < w + 20;) {
        const bw = u * rand(0.09, 0.12); predio(x, cx + bw / 2, yh + rand(-3, 3), bw, 2 + ((Math.random() * 2) | 0), false); cx += bw * rand(0.98, 1.15);
      }
      pagode(x, w * 0.3, yh - 2, u * 1.05);
      const hz = x.createLinearGradient(0, yh - u * 0.3, 0, yh + 4);
      hz.addColorStop(0, 'rgba(250,220,200,0)'); hz.addColorStop(1, 'rgba(250,220,200,.5)');
      x.fillStyle = hz; x.fillRect(0, yh - u * 0.3, w, u * 0.3 + 4);
      // chão de pedra
      const gg = x.createLinearGradient(0, yh, 0, h); gg.addColorStop(0, rot('#c8b698', d)); gg.addColorStop(1, rot('#8f7e68', d));
      x.fillStyle = gg; x.fillRect(0, yh, w, h - yh);
      x.strokeStyle = 'rgba(70,50,40,.16)'; x.lineWidth = 1;
      for (let k = 1; k < 14; k++) { const yy = yh + (h - yh) * Math.pow(k / 14, 1.7); x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); }
      for (let i = 0; i < 260; i++) { const yy = rand(yh, h), s = 1 + ((yy - yh) / (h - yh)) * 4; x.fillStyle = `rgba(${Math.random() < 0.5 ? '90,70,55' : '235,220,195'},${rand(0.08, 0.22)})`; x.fillRect(rand(w), yy, s * rand(1, 2.5), s * 0.5); }
      // canal em perspectiva
      const wg = x.createLinearGradient(0, yh, 0, h);
      wg.addColorStop(0, rot('#d9b8a6', d)); wg.addColorStop(0.3, rot('#6aa6b4', d)); wg.addColorStop(1, rot('#2f6f8c', d));
      x.fillStyle = wg; x.beginPath(); x.moveTo(cx0 - hw(yh), yh); x.lineTo(cx0 + hw(yh), yh); x.lineTo(cx0 + hw(h), h); x.lineTo(cx0 - hw(h), h); x.closePath(); x.fill();
      for (const lado of [-1, 1]) {
        const gm = x.createLinearGradient(0, yh, 0, h); gm.addColorStop(0, rot('#a29a90', d)); gm.addColorStop(1, rot('#6a625a', d));
        x.fillStyle = gm; x.beginPath(); x.moveTo(cx0 + lado * hw(yh), yh); x.lineTo(cx0 + lado * (hw(yh) + hwF * 0.5), yh); x.lineTo(cx0 + lado * (hw(h) + hwN * 0.16), h); x.lineTo(cx0 + lado * hw(h), h); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(40,30,28,.35)';
        for (let k = 1; k < 18; k++) { const yy = yh + (h - yh) * Math.pow(k / 18, 1.6), e = hw(yy); x.beginPath(); x.moveTo(cx0 + lado * e, yy); x.lineTo(cx0 + lado * (e + (hw(h) + hwN * 0.16 - hw(h)) * ((yy - yh) / (h - yh)) + hwF * 0.5 * (1 - (yy - yh) / (h - yh))), yy); x.stroke(); }
      }
      // prédios nas duas margens (segunda fileira e primeira)
      for (const [by, bs, pmin] of [[yh + (h - yh) * 0.07, 0.15, 3], [yh + (h - yh) * 0.21, 0.19, 3]]) {
        const lim = hw(by) + u * 0.035;
        for (const lado of [-1, 1]) {
          let cur = lado < 0 ? -u * 0.02 : w + u * 0.02;
          for (let i = 0; i < 12; i++) {
            const bw = u * bs * rand(0.9, 1.12), c = cur + lado * 0 + (lado < 0 ? bw / 2 : -bw / 2);
            if (Math.abs(c - cx0) - bw / 2 < lim) break;
            predio(x, c, by + rand(-2, 2), bw, pmin + ((Math.random() * 2) | 0), true);
            cur += (lado < 0 ? 1 : -1) * bw * rand(1.0, 1.1);
          }
        }
      }
      for (const lado of [-1, 1]) sakura(x, cx0 + lado * (hw(h * 0.8) + u * 0.2), h * 0.85, u * 0.17, -lado * 0.3, 5);
    });
    const meio = baked(w, h, (x) => {
      const yb = h * 0.8, hb = hw(yb);
      ponteArco(x, cx0, yb, hb * 2 + u * 0.1, u * 0.075);
      const pos = w > h * 1.1 ? [[0.14, 0], [0.3, 1], [0.7, 2], [0.86, 3]] : [[0.2, 0], [0.8, 1]];
      const bw = u * (w > h * 1.1 ? 0.17 : 0.19);
      for (const [px, ti] of pos) barraca(x, w * px, h * 0.965, bw, BARRACAS[ti]);
    });
    const frente = baked(w, h, (x) => {
      sakura(x, w * 0.0, h * 1.03, u * 0.6, 0.2, 5);
      sakura(x, w * 1.0, h * 1.03, u * 0.55, -0.2, 5);
    });
    const sp = [nuvemSprite(u * 0.9, u * 0.34, '255,246,238', '240,196,196', 3), nuvemSprite(u * 0.9, u * 0.34, '255,246,238', '240,196,196', 9)];
    nuvens = [
      { img: sp[0], x: w * 0.05, y: h * 0.03, k: 1.1, v: 4 }, { img: sp[1], x: w * 0.55, y: h * 0.06, k: 0.9, v: 3 },
      { img: sp[1], x: w * 0.3, y: h * 0.17, k: 0.65, v: 5 }, { img: sp[0], x: w * 0.82, y: h * 0.2, k: 0.7, v: 3 },
    ];
    camadas = { fundo, vila, meio, frente };
    petalas = Array.from({ length: 34 }, () => novaPetala(rand(w), rand(h)));
    flut = Array.from({ length: 16 }, () => ({ y: rand(yh, h), o: rand(-0.8, 0.8), v: rand(10, 24), a: rand(TAU), ph: rand(TAU) }));
    aves = Array.from({ length: 6 }, () => ({ x: rand(w), y: h * rand(0.1, 0.36), v: rand(26, 44), ph: rand(TAU), s: rand(4, 7) }));
  }
  const novaPetala = (x, y, extra = false) => ({ x, y, z: rand(0.4, 1), r: rand(2.4, 4.4), a: rand(TAU), va: rand(-3, 3), ph: rand(TAU), extra, vx: 0 });
  bake();

  const px = (p) => -par * p;
  return {
    resize(nw, nh) { w = nw; h = nh; bake(); },
    tap(x, y) { festa = 1; for (let i = 0; i < 26; i++) { const f = novaPetala(x + rand(-20, 20), y + rand(-20, 20), true); f.vx = rand(60, 200); petalas.push(f); } },
    step(dt, ptr) {
      ptrAtual = ptr;
      t += dt; festa = Math.max(0, festa - dt * 0.4);
      const tx = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (tx - par) * Math.min(1, dt * 2);
      const vento = 24 + (ptr.x > -1000 ? Math.max(-120, Math.min(120, ptr.vx * 0.03)) : 0) + festa * 130;
      for (const n of nuvens) { n.x += n.v * dt; if (n.x > w) n.x = -U() * 0.9 * n.k; }
      for (const f of petalas) {
        f.vx += (0 - f.vx) * dt * 0.6;
        f.x += (vento * (0.5 + f.z) + f.vx) * dt; f.y += (14 + Math.sin(t * 1.6 + f.ph) * 14) * dt; f.a += f.va * dt;
        if (ptr.x > -1000) { const dx = f.x - ptr.x, dy = f.y - ptr.y; if (dx * dx + dy * dy < 6000) { f.x += dx * dt * 3; f.y += dy * dt * 2; } }
        if (f.y > h + 8) { f.y = -8; f.x = rand(w); }
        if (f.x > w + 10) { if (f.extra) f.dead = true; else f.x = -10; }
      }
      petalas = petalas.filter((f) => !f.dead);
      for (const a of aves) { a.x += a.v * dt; a.y += Math.sin(t + a.ph) * 6 * dt; if (a.x > w + 20) a.x = -20; }
      for (const p of flut) { p.y += p.v * dt; if (p.y > h + 8) p.y = canal.yh; }
      for (const c of vapor) {
        if (Math.random() < dt * 3) c.pts.push({ x: c.x, y: c.y, r: 2, a: 0.5, vx: rand(-3, 6), vy: rand(-22, -12) });
        for (const p of c.pts) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 5; p.a -= dt * 0.35; }
        c.pts = c.pts.filter((p) => p.a > 0);
      }
    },
    draw(ctx) {
      const { fundo, vila, meio, frente } = camadas, u = U(), { yh, cx0, hw } = canal;
      const sg = ctx.createLinearGradient(0, 0, 0, h * 0.72);
      sg.addColorStop(0, rot('#5f86c8', d)); sg.addColorStop(0.5, rot('#a9c4e4', d)); sg.addColorStop(0.85, rot('#f4c9b0', d)); sg.addColorStop(1, rot('#f9dcc0', d));
      ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter'; luz(ctx, w * 0.2, h * 0.55, u * 0.7, '255,200,150', 0.3); ctx.globalCompositeOperation = 'source-over';
      for (const n of nuvens) ctx.drawImage(n.img, n.x + px(2), n.y, u * 0.9 * n.k, u * 0.34 * n.k);
      ctx.drawImage(fundo, px(3), 0, w, h);
      const qx = queda.x + px(3), len = queda.y1 - queda.y0;
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.6;
      for (let i = 0; i < 12; i++) {
        const xx = qx + (i / 11 - 0.5) * u * 0.03, o = (t * 0.55 + i * 0.37) % 1;
        ctx.beginPath(); ctx.moveTo(xx, queda.y0 + o * len * 0.8); ctx.lineTo(xx, queda.y0 + o * len * 0.8 + len * 0.18); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(40,50,70,.8)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      for (const a of aves) { const fl = Math.sin(t * 8 + a.ph), x = a.x + px(5); ctx.beginPath(); ctx.moveTo(x - a.s, a.y - a.s * 0.5 * fl); ctx.lineTo(x, a.y); ctx.lineTo(x + a.s, a.y - a.s * 0.5 * fl); ctx.stroke(); }
      ctx.drawImage(vila, px(6), 0, w, h);
      // brilhos da água e pétalas flutuando
      ctx.save(); ctx.translate(px(6), 0);
      ctx.beginPath(); ctx.moveTo(cx0 - hw(yh), yh); ctx.lineTo(cx0 + hw(yh), yh); ctx.lineTo(cx0 + hw(h), h); ctx.lineTo(cx0 - hw(h), h); ctx.closePath(); ctx.clip();
      ctx.fillStyle = 'rgba(255,240,215,.5)';
      for (let y = yh + 4; y < h; y += 7) {
        const k = (y - yh) / (h - yh), lw = 8 + k * 40, off = Math.sin(t * 1.2 + y * 0.8) * 10 * (0.3 + k);
        ctx.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(t * 1.9 + y * 1.3)); ctx.fillRect(cx0 + off - lw / 2 + Math.sin(y * 3.1) * hw(y) * 0.5, y, lw, 1 + k * 1.2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
      for (const l of luzes) {
        if (l.p !== 6 || l.y > h * 0.8) continue;
        for (let y = yh + 6; y < h; y += 9) { const k = (y - yh) / (h - yh), ox = (l.x - cx0) * (0.2 + k * 0.5); ctx.fillStyle = `rgba(255,170,90,${0.12 * Math.abs(Math.sin(t * 2 + y))})`; ctx.fillRect(cx0 + ox + Math.sin(t * 1.5 + y) * 3 - 3, y, 6 + k * 8, 1.4); }
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const p of flut) {
        const k = (p.y - yh) / (h - yh), x = cx0 + p.o * hw(p.y) * 0.9 + Math.sin(t * 0.8 + p.ph) * 8 * k;
        ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.a + t * 0.3); ctx.fillStyle = rot('#f7bfd0', d, 0.9);
        ctx.beginPath(); ctx.ellipse(0, 0, 1.5 + k * 4, 0.8 + k * 2.2, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
      // barco pequeno com lanterna
      const by = h * 0.9, bwid = u * 0.13, bx = cx0 + Math.sin(t * 0.4) * hw(by) * 0.35, bob = Math.sin(t * 1.6) * 1.5;
      ctx.fillStyle = rot('#6a4a34', d); ctx.beginPath(); ctx.moveTo(bx - bwid / 2, by + bob - bwid * 0.05);
      ctx.quadraticCurveTo(bx, by + bob + bwid * 0.2, bx + bwid / 2, by + bob - bwid * 0.05); ctx.lineTo(bx + bwid * 0.45, by + bob - bwid * 0.1); ctx.lineTo(bx - bwid * 0.45, by + bob - bwid * 0.1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = rot('#b5392f', d); ctx.beginPath(); ctx.moveTo(bx - bwid * 0.28, by + bob - bwid * 0.1); ctx.lineTo(bx - bwid * 0.2, by + bob - bwid * 0.3); ctx.lineTo(bx + bwid * 0.2, by + bob - bwid * 0.3); ctx.lineTo(bx + bwid * 0.28, by + bob - bwid * 0.1); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; luz(ctx, bx + bwid * 0.35, by + bob - bwid * 0.2, bwid * 0.5, '255,170,90', 0.55);
      ctx.restore(); ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(meio, px(10), 0, w, h);
      // luz das janelas, lanternas e vapor
      const near = (p, x, y) => p.x > -1000 && (p.x - x) ** 2 + (p.y - y) ** 2 < 4000;
      ctx.globalCompositeOperation = 'lighter';
      for (const j of janelas) {
        const a = 0.8 + Math.sin(t * 3 + j.ph) * 0.08 + festa * 0.15;
        luz(ctx, j.x + j.w / 2 + px(j.p), j.y + j.h / 2, j.w * 1.9, '255,170,80', 0.2 * a);
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const j of janelas) { ctx.fillStyle = `rgba(255,214,130,${0.82 + Math.sin(t * 3 + j.ph) * 0.08})`; ctx.fillRect(j.x + px(j.p), j.y, j.w, j.h); ctx.fillStyle = 'rgba(80,50,30,.7)'; ctx.fillRect(j.x + px(j.p) + j.w / 2 - 0.5, j.y, 1, j.h); ctx.fillRect(j.x + px(j.p), j.y + j.h / 2 - 0.5, j.w, 1); }
      ctx.globalCompositeOperation = 'lighter';
      for (const l of luzes) {
        const x = l.x + px(l.p), a = 0.55 + Math.sin(t * 2.2 + l.ph) * 0.1 + festa * 0.3 + (near(ptrAtual, x, l.y) ? 0.3 : 0);
        luz(ctx, x, l.y, l.r, '255,160,80', Math.min(1, a) * 0.5);
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const c of vapor) for (const p of c.pts) { ctx.fillStyle = `rgba(250,248,245,${p.a * 0.65})`; ctx.beginPath(); ctx.arc(p.x + px(c.p), p.y, p.r, 0, TAU); ctx.fill(); }
      ctx.drawImage(frente, px(14), 0, w, h);
      for (const f of petalas) {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a);
        ctx.fillStyle = rot('#f7bfd0', d, 0.55 + f.z * 0.4); ctx.beginPath(); ctx.ellipse(0, 0, f.r * (0.7 + f.z * 0.6), f.r * 0.5, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    },
  };
}
