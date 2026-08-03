import { TAU, clamp, rand, rotRgb, tintDelta } from './util.js';

// Nebulosa cósmica: nuvens de gás pré-desenhadas em baixa resolução (leve), que
// derivam devagar e acompanham o ponteiro (paralaxe), com estrelas ao fundo.
// Toque: onda de choque luminosa.
export default function nebula(w, h, dark, hue) {
  const d = tintDelta(hue, 265);
  let t = 0, par = 0, off = null, stars = [];
  const novas = [];

  function build() {
    const sc = 0.25;
    const ow = Math.max(64, Math.round(w * sc * 1.3));
    const oh = Math.max(64, Math.round(h * sc * 1.3));
    off = document.createElement('canvas');
    off.width = ow; off.height = oh;
    const c = off.getContext('2d');
    c.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    const cols = [[130, 70, 255], [255, 80, 170], [50, 150, 255], [255, 170, 70], [90, 230, 210]].map((c) => rotRgb(c, d));
    const a = dark ? 0.34 : 0.17;
    for (let i = 0; i < 11; i++) {
      const [r, g, b] = cols[i % cols.length];
      const x = rand(ow), y = rand(oh), rad = rand(0.16, 0.42) * Math.max(ow, oh);
      const gr = c.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      gr.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.4})`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      c.fillStyle = gr;
      c.fillRect(0, 0, ow, oh);
    }
    for (let i = 0; i < 400; i++) { // poeira cósmica
      const [r, g, b] = cols[i % cols.length];
      c.fillStyle = `rgba(${r},${g},${b},${rand(0.02, 0.06)})`;
      c.beginPath(); c.arc(rand(ow), rand(oh), rand(0.5, 2.5), 0, TAU); c.fill();
    }
    const n = Math.round(clamp((w * h) / 6500, 60, 220));
    stars = Array.from({ length: n }, () => ({ x: rand(w), y: rand(h), r: rand(0.4, 1.5), ph: rand(TAU), l: rand(0.2, 1) }));
  }
  build();

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x, y) { novas.push({ x, y, age: 0 }); },
    step(dt, ptr) {
      t += dt;
      const target = ptr.x > -1000 ? ptr.x / w - 0.5 : 0;
      par += (target - par) * Math.min(1, dt * 2);
      for (const n of novas) n.age += dt;
      while (novas.length && novas[0].age > 1.4) novas.shift();
    },
    draw(ctx) {
      const W = w * 1.3, H = h * 1.3;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(Math.sin(t * 0.03) * 0.04);
      ctx.drawImage(off, -W / 2 + Math.sin(t * 0.05) * w * 0.04 - par * w * 0.06, -H / 2 + Math.cos(t * 0.04) * h * 0.03, W, H);
      ctx.restore();
      const rgb = dark ? '255,255,255' : '70,60,140';
      for (const s of stars) {
        const a = (0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + s.ph))) * s.l;
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.beginPath(); ctx.arc(s.x - par * 40 * s.l, s.y, s.r, 0, TAU); ctx.fill();
      }
      for (const n of novas) {
        const k = n.age / 1.4, r = k * Math.max(w, h) * 0.5;
        const g = ctx.createRadialGradient(n.x, n.y, r * 0.7, n.x, n.y, r);
        g.addColorStop(0, 'rgba(200,170,255,0)');
        g.addColorStop(0.85, `rgba(210,190,255,${0.35 * (1 - k)})`);
        g.addColorStop(1, 'rgba(200,170,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU); ctx.fill();
      }
    },
  };
}
