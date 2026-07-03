import { TAU, clamp, rand, rotRgb, tintDelta } from './util.js';

// Nebulosa em anel (inspirada em nebulosas planetárias): um anel de filamentos
// vermelho → dourado → branco → verde → azul, com raios para fora e estrelas com
// pontas de brilho. Pré-desenhada uma vez; o ponteiro move as camadas (paralaxe)
// e acende um brilho. Toque: onda de choque.
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export default function nebula(w, h, dark, hue) {
  const d = tintDelta(hue, 200);
  const cor = (c, a) => { const [r, g, b] = rotRgb(c, d); return `rgba(${r},${g},${b},${a})`; };
  let lastPtr = null, t = 0, px = 0, py = 0, ring = null, haze = null, stars = [], S = 600;
  const ondas = [];
  const RX = () => S * 0.3, RY = () => S * 0.3 * 0.78;

  function stroke(c, x0, y0, ang, len, color, wd) {
    c.strokeStyle = color; c.lineWidth = wd;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len); c.stroke();
  }

  function build() {
    S = Math.round(clamp(Math.max(w, h) * 0.75, 400, 720));
    ring = document.createElement('canvas'); ring.width = ring.height = S;
    haze = document.createElement('canvas'); haze.width = haze.height = S;
    const c = ring.getContext('2d'), hz = haze.getContext('2d');
    const rx = RX(), ry = RY(), m = S / 2;
    c.globalCompositeOperation = hz.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';

    // névoa: miolo azul-esverdeado e halo violeta
    const g1 = hz.createRadialGradient(m, m, 0, m, m, rx * 0.95);
    g1.addColorStop(0, cor([40, 110, 210], 0.55)); g1.addColorStop(0.7, cor([30, 150, 170], 0.4)); g1.addColorStop(1, cor([30, 150, 150], 0));
    hz.save(); hz.translate(m, m); hz.scale(1, 0.78); hz.translate(-m, -m); hz.fillStyle = g1; hz.fillRect(0, 0, S, S); hz.restore();
    const g2 = hz.createRadialGradient(m, m, rx * 0.9, m, m, S * 0.5);
    g2.addColorStop(0, cor([120, 50, 110], 0.28)); g2.addColorStop(0.5, cor([50, 40, 120], 0.2)); g2.addColorStop(1, cor([20, 20, 70], 0));
    hz.fillStyle = g2; hz.fillRect(0, 0, S, S);
    for (let i = 0; i < 90; i++) { // manchas de gás no miolo
      const a = rand(TAU), r = Math.sqrt(Math.random()) * rx * 0.7, x = m + Math.cos(a) * r, y = m + Math.sin(a) * r * 0.78, rr = rand(3, 11);
      const g = hz.createRadialGradient(x, y, 0, x, y, rr);
      const cc = Math.random() < 0.5 ? [200, 190, 90] : [80, 200, 170];
      g.addColorStop(0, cor(cc, 0.16)); g.addColorStop(1, cor(cc, 0));
      hz.fillStyle = g; hz.beginPath(); hz.arc(x, y, rr, 0, TAU); hz.fill();
    }

    // raios externos (vermelhos), do anel para fora
    for (let i = 0; i < 2600; i++) {
      const a = rand(TAU), r0 = 1.05 + Math.abs(gauss()) * 0.12;
      const x = m + Math.cos(a) * rx * r0, y = m + Math.sin(a) * ry * r0;
      stroke(c, x, y, a, rand(10, 0.14 * S), cor([230, 70, 80], rand(0.04, 0.12)), rand(0.6, 1.4));
    }
    // filamentos do anel: a cor depende da distância ao anel
    for (let i = 0; i < 16000; i++) {
      const a = rand(TAU), k = gauss() * 0.27 + 0.02 * Math.sin(a * 5); // dentro (-) … fora (+)
      const nodo = 0.55 + 0.45 * Math.sin(a * 7 + 1) * Math.sin(a * 3 + k * 9); // trechos mais densos
      const x = m + Math.cos(a) * rx * (1 + k), y = m + Math.sin(a) * ry * (1 + k);
      let rgb, al;
      if (k < -0.12) { rgb = [70, 190, 190]; al = 0.14; }
      else if (k < -0.04) { rgb = [220, 190, 90]; al = 0.2; }
      else if (k < 0.04) { rgb = [255, 240, 225]; al = 0.26; }
      else if (k < 0.1) { rgb = [255, 150, 110]; al = 0.2; }
      else { rgb = [235, 70, 90]; al = 0.16; }
      stroke(c, x, y, a + rand(-0.4, 0.4), rand(3, 11), cor(rgb, al * rand(0.5, 1.2) * nodo), rand(0.6, 1.6));
    }
    for (let i = 0; i < 300; i++) { // pontos dourados
      const a = rand(TAU), k = rand(-0.1, 0.1);
      c.fillStyle = cor([255, 210, 120], rand(0.2, 0.6));
      c.beginPath(); c.arc(m + Math.cos(a) * rx * (1 + k), m + Math.sin(a) * ry * (1 + k), rand(0.5, 1.6), 0, TAU); c.fill();
    }

    const n = Math.round(clamp((w * h) / 5000, 70, 260));
    stars = Array.from({ length: n }, (_, i) => ({ x: rand(w), y: rand(h), r: rand(0.4, 1.4), ph: rand(TAU), l: rand(0.3, 1), big: i < 6 }));
    stars[0].x = w * 0.88; stars[0].y = h * 0.08; // estrela principal, canto superior
  }
  build();

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x, y) { ondas.push({ x, y, age: 0 }); },
    step(dt, ptr) {
      t += dt;
      const on = ptr.x > -1000;
      px += ((on ? ptr.x / w - 0.5 : 0) - px) * Math.min(1, dt * 2);
      py += ((on ? ptr.y / h - 0.5 : 0) - py) * Math.min(1, dt * 2);
      for (const n of ondas) n.age += dt;
      while (ondas.length && ondas[0].age > 1.4) ondas.shift();
      lastPtr = ptr;
    },
    draw(ctx) {
      if (!dark) { ctx.fillStyle = 'rgba(10,14,40,.9)'; ctx.fillRect(0, 0, w, h); }
      const sc = Math.min((w * 0.31) / RX(), (h * 0.4) / RY()) * (1 + Math.sin(t * 0.4) * 0.012);
      const comp = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter';
      const draw = (img, par, rot) => {
        ctx.save();
        ctx.translate(w / 2 - px * w * par, h / 2 - py * h * par);
        ctx.rotate(rot); ctx.scale(sc, sc);
        ctx.drawImage(img, -S / 2, -S / 2);
        ctx.restore();
      };
      draw(haze, 0.03, -0.06 + Math.sin(t * 0.05) * 0.02);
      draw(ring, 0.06, -0.06 + Math.sin(t * 0.07) * 0.015);

      const p = lastPtr;
      if (p && p.x > -1000) { // brilho que acompanha o ponteiro
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 120);
        g.addColorStop(0, 'rgba(120,200,255,.22)'); g.addColorStop(1, 'rgba(120,200,255,0)');
        ctx.fillStyle = g; ctx.fillRect(p.x - 120, p.y - 120, 240, 240);
      }
      for (const s of stars) {
        const a = (0.4 + 0.6 * Math.abs(Math.sin(t * 1.2 + s.ph))) * s.l;
        const x = s.x - px * 30 * s.l, y = s.y - py * 30 * s.l;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
        if (s.big) { // pontas de brilho
          const L = 14 + s.r * 14;
          ctx.strokeStyle = `rgba(190,215,255,${a * 0.7})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
        }
      }
      for (const n of ondas) {
        const k = n.age / 1.4, r = k * Math.max(w, h) * 0.5;
        const g = ctx.createRadialGradient(n.x, n.y, r * 0.7, n.x, n.y, r);
        g.addColorStop(0, 'rgba(200,170,255,0)'); g.addColorStop(0.85, `rgba(210,190,255,${0.35 * (1 - k)})`); g.addColorStop(1, 'rgba(200,170,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = comp;
    },
  };
}
