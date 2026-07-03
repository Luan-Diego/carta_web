import { TAU, clamp, pick, rand } from './util.js';

// Jardim ilustrado: céu com sol e nuvens, colinas, arbustos de folhas, hastes altas
// com margaridas, tulipas e flores, joaninhas, borboletas e grama na frente.
// As hastes e a grama se curvam longe do ponteiro; tocar solta pólen e chama uma borboleta.
const sprite = (sz, fn) => {
  const c = document.createElement('canvas');
  c.width = c.height = sz * 2;
  const x = c.getContext('2d');
  x.scale(2, 2); x.translate(sz / 2, sz / 2);
  fn(x, sz);
  return c;
};

function leaf(x, len, wid, c1, c2) {
  const g = x.createLinearGradient(0, 0, 0, -len);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  x.fillStyle = g;
  x.beginPath(); x.moveTo(0, 0);
  x.quadraticCurveTo(wid, -len * 0.5, 0, -len);
  x.quadraticCurveTo(-wid, -len * 0.5, 0, 0);
  x.fill();
  x.strokeStyle = 'rgba(30,90,40,.45)'; x.lineWidth = 0.8;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -len * 0.92); x.stroke();
}

function petals(x, n, dist, rx, ry, c1, c2, edge) {
  for (let i = 0; i < n; i++) {
    x.save(); x.rotate((i / n) * TAU); x.translate(dist, 0);
    const g = x.createLinearGradient(-rx, 0, rx, 0);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    x.fillStyle = g; x.strokeStyle = edge; x.lineWidth = 0.7;
    x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fill(); x.stroke();
    x.restore();
  }
}
function miolo(x, r) {
  const g = x.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
  g.addColorStop(0, '#fff3a0'); g.addColorStop(1, '#f0a818');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
}
function tulipa(x, s, c1, c2) {
  const R = s * 0.42;
  const g = x.createLinearGradient(0, -R, 0, R);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  x.fillStyle = g; x.strokeStyle = 'rgba(120,20,20,.35)'; x.lineWidth = 0.8;
  x.beginPath(); x.moveTo(0, R * 0.9);
  x.bezierCurveTo(-R * 0.95, R * 0.55, -R * 0.85, -R * 0.4, -R * 0.55, -R * 0.95);
  x.lineTo(-R * 0.2, -R * 0.35); x.lineTo(0, -R); x.lineTo(R * 0.2, -R * 0.35); x.lineTo(R * 0.55, -R * 0.95);
  x.bezierCurveTo(R * 0.85, -R * 0.4, R * 0.95, R * 0.55, 0, R * 0.9);
  x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-R * 0.2, -R * 0.35); x.quadraticCurveTo(0, R * 0.5, 0, R * 0.9); x.moveTo(R * 0.2, -R * 0.35); x.quadraticCurveTo(0, R * 0.5, 0, R * 0.9); x.stroke();
}

const TIPOS = {
  margarida: (x, s) => { petals(x, 16, s * 0.27, s * 0.2, s * 0.07, '#ffffff', '#f1f4f8', 'rgba(150,170,195,.7)'); miolo(x, s * 0.12); },
  rosa: (x, s) => { petals(x, 8, s * 0.26, s * 0.17, s * 0.15, '#ff9cc2', '#e5588f', 'rgba(170,50,100,.4)'); miolo(x, s * 0.1); },
  azul: (x, s) => { petals(x, 6, s * 0.25, s * 0.18, s * 0.15, '#9bd0ff', '#4a95e2', 'rgba(40,90,170,.4)'); miolo(x, s * 0.1); },
  tulipaR: (x, s) => tulipa(x, s, '#ff6a5a', '#d4233a'),
  tulipaA: (x, s) => tulipa(x, s, '#ffd36b', '#f09a1c'),
  broto: (x, s) => { x.fillStyle = '#7cc15a'; x.beginPath(); x.ellipse(0, 0, s * 0.1, s * 0.15, 0, 0, TAU); x.fill(); },
};
const PESOS = ['margarida', 'margarida', 'margarida', 'margarida', 'rosa', 'azul', 'tulipaR', 'tulipaA', 'tulipaA', 'broto'];

export default function garden(w, h, dark) {
  let t = 0, spr = {}, folha = null, arbusto = null, terra = null;
  let flores = [], capim = [], nuvens = [], borbs = [], polen = [];
  let alvo = null;

  function build() {
    for (const k of Object.keys(TIPOS)) spr[k] = sprite(64, TIPOS[k]);
    folha = sprite(44, (x, s) => { x.translate(0, s * 0.45); leaf(x, s * 0.9, s * 0.3, '#2f8a3c', '#8fd06a'); });
    arbusto = sprite(120, (x, s) => {
      x.translate(0, s * 0.42);
      for (let i = 0; i < 34; i++) {
        const a = -Math.PI / 2 + rand(-1.35, 1.35), L = s * rand(0.35, 0.6);
        x.save(); x.translate(rand(-s * 0.12, s * 0.12), 0); x.rotate(a + Math.PI / 2);
        const k = i / 34;
        leaf(x, L, L * 0.34, `rgb(${40 + k * 30},${100 + k * 50},${45 + k * 20})`, `rgb(${90 + k * 40},${170 + k * 30},${80 + k * 20})`);
        x.restore();
      }
    });
    // paisagem (colinas, campo, arbustos) pré-desenhada
    terra = document.createElement('canvas'); terra.width = Math.ceil(w); terra.height = Math.ceil(h);
    const c = terra.getContext('2d');
    const colina = (y0, amp, f, ph, cor) => {
      c.fillStyle = cor; c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) c.lineTo(x, h * y0 + Math.sin(x / w * f + ph) * h * amp);
      c.lineTo(w, h); c.fill();
    };
    colina(0.5, 0.035, 5, 1, dark ? '#243650' : '#a8c3d0');
    colina(0.55, 0.03, 4, 3, dark ? '#1f4a47' : '#86b39a');
    const g = c.createLinearGradient(0, h * 0.58, 0, h);
    g.addColorStop(0, dark ? '#1d4a2a' : '#97d172'); g.addColorStop(1, dark ? '#0f2f1c' : '#4f9f43');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) c.lineTo(x, h * 0.6 + Math.sin(x / w * 3 + 0.5) * h * 0.02);
    c.lineTo(w, h); c.fill();
    for (let i = 0; i < 24; i++) { c.fillStyle = `rgba(255,255,255,${rand(0.03, 0.07)})`; c.beginPath(); c.ellipse(rand(w), rand(h * 0.65, h), rand(40, 120), rand(5, 12), 0, 0, TAU); c.fill(); }
    const nb = Math.round(clamp(w / 150, 3, 9));
    for (let i = 0; i < nb; i++) {
      const s = rand(60, 105) * clamp(w / 900, 0.7, 1.2), x = (i + rand(0.2, 0.8)) / nb * w, y = h * rand(0.64, 0.74);
      c.fillStyle = 'rgba(30,70,30,.18)'; c.beginPath(); c.ellipse(x, y + s * 0.02, s * 0.5, s * 0.07, 0, 0, TAU); c.fill();
      c.drawImage(arbusto, x - s * 0.7, y - s * 0.95, s * 1.4, s * 1.4);
    }

    // hastes com flores (de trás para frente)
    const n = Math.round(clamp(w / 70, 6, 22));
    flores = Array.from({ length: n }, () => {
      const y0 = h * rand(0.7, 0.98), z = (y0 - h * 0.7) / (h * 0.28);
      const tipo = pick(PESOS);
      return {
        x: rand(0.03, 0.97) * w, y0, z, tipo, ph: rand(TAU), b: 0,
        H: h * rand(0.22, 0.5) * (0.55 + 0.6 * z), hs: (tipo === 'broto' ? 22 : rand(48, 70)) * (0.6 + 0.6 * z),
        folhas: [0.3, 0.48, 0.66].map((u, i) => ({ u: u + rand(-0.04, 0.04), lado: i % 2 ? 1 : -1, len: rand(26, 40) * (0.6 + 0.6 * z) })),
        joaninha: Math.random() < 0.25 ? Math.floor(rand(3)) : -1,
      };
    }).sort((a, b) => a.y0 - b.y0);
    capim = Array.from({ length: Math.round(w / 5) }, () => ({ x: rand(w), L: rand(0.05, 0.14) * h, ph: rand(TAU), v: rand(0, 1), b: 0 }));
    nuvens = Array.from({ length: 4 }, (_, i) => ({ x: rand(w), y: h * (0.08 + i * 0.09), s: rand(0.7, 1.2) * clamp(w / 800, 0.6, 1.2), v: rand(5, 12) }));
    if (!borbs.length) for (let i = 0; i < 4; i++) borbs.push(nova());
  }
  const nova = (x = rand(w), y = rand(h * 0.2, h * 0.6)) => ({ x, y, vx: rand(-30, 30), vy: rand(-20, 20), ph: rand(TAU), c: pick([['#ff9a4a', '#ffd27a'], ['#ff7aa8', '#ffc2d8'], ['#6ab0ff', '#bfe0ff']]), s: rand(0.8, 1.2), tx: rand(w), ty: rand(h * 0.15, h * 0.65), tt: 0 });
  build();

  const pt = (f, u, topX, topY) => { // ponto na haste (curva quadrática)
    const cx = f.x + (topX - f.x) * 0.2, cy = f.y0 - f.H * 0.55, v = 1 - u;
    return [v * v * f.x + 2 * v * u * cx + u * u * topX, v * v * f.y0 + 2 * v * u * cy + u * u * topY];
  };

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x, y) {
      for (let i = 0; i < 16; i++) polen.push({ x, y, vx: rand(-60, 60), vy: -rand(20, 90), age: 0 });
      if (borbs.length < 8) borbs.push(nova(x, y));
    },
    step(dt, ptr) {
      t += dt; alvo = ptr.x > -1000 ? ptr : null;
      for (const f of flores) {
        const tx = f.x + Math.sin(t * 1.1 + f.ph) * 6 * (0.6 + f.z);
        let push = 0;
        if (alvo) { const dx = tx - alvo.x, dy = f.y0 - f.H - alvo.y, d = Math.hypot(dx, dy); if (d < 170) push = Math.sign(dx || 1) * (1 - d / 170) * 42; }
        f.b += (Math.sin(t * 1.1 + f.ph) * 6 * (0.6 + f.z) + push - f.b) * Math.min(1, dt * 6);
      }
      for (const g of capim) {
        let push = 0;
        if (alvo && alvo.y > h * 0.8) { const dx = g.x - alvo.x; if (Math.abs(dx) < 80) push = Math.sign(dx || 1) * (1 - Math.abs(dx) / 80) * 22; }
        g.b += (Math.sin(t * 1.6 + g.ph) * 5 + push - g.b) * Math.min(1, dt * 7);
      }
      for (const c of nuvens) { c.x += c.v * dt; if (c.x > w + 150) c.x = -150; }
      for (const b of borbs) {
        b.ph += dt * 14; b.tt -= dt;
        if (b.tt <= 0) { b.tx = rand(w); b.ty = rand(h * 0.15, h * 0.65); b.tt = rand(2, 4); }
        let tx = b.tx, ty = b.ty;
        if (alvo && Math.hypot(alvo.x - b.x, alvo.y - b.y) < 260) { tx = alvo.x + 20; ty = alvo.y - 10; }
        b.vx += ((tx - b.x) * 0.6 + Math.sin(t * 3 + b.ph * 0.1) * 40 - b.vx) * dt * 1.5;
        b.vy += ((ty - b.y) * 0.6 + Math.cos(t * 2.4 + b.ph * 0.1) * 40 - b.vy) * dt * 1.5;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
      for (const p of polen) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt; }
      while (polen.length && polen[0].age > 1.4) polen.shift();
    },
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, h * 0.62);
      if (dark) { g.addColorStop(0, '#0b1a3a'); g.addColorStop(1, '#2a3f6b'); } else { g.addColorStop(0, '#86c8ee'); g.addColorStop(1, '#e2f4fb'); }
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      // sol com raios
      const sx = w * 0.84, sy = h * 0.15, sr = Math.min(w, h) * 0.07;
      const gl = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5);
      gl.addColorStop(0, dark ? 'rgba(220,230,255,.5)' : 'rgba(255,240,170,.8)'); gl.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = gl; ctx.fillRect(sx - sr * 5, sy - sr * 5, sr * 10, sr * 10);
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.05);
      ctx.fillStyle = dark ? 'rgba(220,230,255,.3)' : 'rgba(255,225,110,.55)';
      for (let i = 0; i < 16; i++) { ctx.rotate(TAU / 16); ctx.beginPath(); ctx.moveTo(sr * 1.2, -sr * 0.12); ctx.lineTo(sr * (i % 2 ? 2.2 : 2.9), 0); ctx.lineTo(sr * 1.2, sr * 0.12); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = dark ? '#e8eeff' : '#ffe680'; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();

      // nuvens chatas
      for (const c of nuvens) {
        ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.s, c.s);
        ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.beginPath();
        ctx.arc(-40, 8, 24, 0, TAU); ctx.arc(-10, -6, 32, 0, TAU); ctx.arc(30, 0, 28, 0, TAU); ctx.arc(55, 12, 20, 0, TAU); ctx.rect(-60, 8, 130, 24); ctx.fill();
        ctx.fillStyle = 'rgba(150,175,205,.35)'; ctx.beginPath(); ctx.ellipse(5, 26, 62, 6, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
      ctx.drawImage(terra, 0, 0, w, h);

      // hastes e flores
      for (const f of flores) {
        const topX = f.x + f.b, topY = f.y0 - f.H, sc = 0.6 + 0.6 * f.z;
        ctx.strokeStyle = '#3f9a3f'; ctx.lineWidth = 2.2 * sc; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(f.x, f.y0); ctx.quadraticCurveTo(f.x + (topX - f.x) * 0.2, f.y0 - f.H * 0.55, topX, topY); ctx.stroke();
        f.folhas.forEach((l, i) => {
          const [x, y] = pt(f, l.u, topX, topY);
          ctx.save(); ctx.translate(x, y); ctx.rotate(l.lado * 1.05 + f.b * 0.004 + Math.sin(t * 1.3 + f.ph + i) * 0.05);
          ctx.drawImage(folha, -l.len * 0.5, -l.len * 0.95, l.len, l.len); ctx.restore();
          if (f.joaninha === i) { ctx.save(); ctx.translate(x, y); ctx.rotate(l.lado * 1.05); const ly = -l.len * 0.62; ctx.fillStyle = '#d8281f'; ctx.beginPath(); ctx.arc(0, ly, 3.2 * sc, 0, TAU); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, ly - 2.6 * sc, 1.5 * sc, 0, TAU); ctx.arc(-1, ly, 0.7 * sc, 0, TAU); ctx.arc(1, ly + 1, 0.7 * sc, 0, TAU); ctx.fill(); ctx.restore(); }
        });
        ctx.save(); ctx.translate(topX, topY); ctx.rotate(f.b * 0.01 + Math.sin(t + f.ph) * 0.04);
        ctx.drawImage(spr[f.tipo], -f.hs / 2, -f.hs / 2, f.hs, f.hs); ctx.restore();
      }

      // borboletas
      for (const b of borbs) {
        const fl = 0.25 + 0.75 * Math.abs(Math.sin(b.ph)), s = 11 * b.s;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(clamp(b.vx / 160, -0.5, 0.5));
        for (const lado of [-1, 1]) {
          ctx.save(); ctx.scale(lado * fl, 1);
          ctx.fillStyle = b.c[0]; ctx.beginPath(); ctx.ellipse(s * 0.7, -s * 0.5, s * 0.8, s * 0.55, -0.5, 0, TAU); ctx.fill();
          ctx.fillStyle = b.c[1]; ctx.beginPath(); ctx.ellipse(s * 0.55, s * 0.5, s * 0.55, s * 0.4, 0.5, 0, TAU); ctx.fill();
          ctx.restore();
        }
        ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(0, s * 0.7); ctx.stroke();
        ctx.restore();
      }
      for (const p of polen) { ctx.fillStyle = `rgba(255,230,120,${1 - p.age / 1.4})`; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, TAU); ctx.fill(); }

      // grama da frente
      for (const gr of capim) {
        const y = h + 2, tx = gr.x + gr.b, ty = y - gr.L * (0.6 + gr.v * 0.6);
        ctx.fillStyle = `hsl(${100 + gr.v * 25},${55 + gr.v * 15}%,${30 + gr.v * 16}%)`;
        ctx.beginPath(); ctx.moveTo(gr.x - 2.2, y); ctx.quadraticCurveTo(gr.x + gr.b * 0.3, y - gr.L * 0.55, tx, ty); ctx.quadraticCurveTo(gr.x + gr.b * 0.3 + 1, y - gr.L * 0.5, gr.x + 2.2, y); ctx.fill();
      }
      if (dark) { ctx.fillStyle = 'rgba(5,10,40,.38)'; ctx.fillRect(0, 0, w, h); }
    },
  };
}
