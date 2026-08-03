import { TAU, blend, density, rand, randInt, rotStr, tintDelta } from './util.js';

// Circuitos luminosos: trilhas de placa de circuito e pulsos de luz que correm
// por elas. Perto do ponteiro as trilhas acendem e disparam pulsos; toque: rajada.
const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const G = 28;

export default function circuits(w, h, dark, hue) {
  const d = tintDelta(hue, 172);
  let t = 0, auto = 0, cool = 0;
  let traces = [];
  let pulses = [];
  const flashes = [];
  const col = rotStr(dark ? [0, 255, 220] : [0, 120, 150], d);
  const col2 = rotStr(dark ? [255, 70, 210] : [170, 20, 130], d);

  function build() {
    const cols = Math.floor(w / G), rows = Math.floor(h / G);
    traces = [];
    const n = Math.round(30 * density(w, h));
    for (let i = 0; i < n; i++) {
      let gx = randInt(1, cols - 1), gy = randInt(1, rows - 1), d = randInt(0, 7);
      const pts = [[gx * G, gy * G]];
      const steps = randInt(5, 12);
      for (let s = 0; s < steps; s++) {
        if (Math.random() < 0.4) d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
        const len = randInt(1, 4);
        const nx = Math.min(cols, Math.max(0, gx + DIRS[d][0] * len));
        const ny = Math.min(rows, Math.max(0, gy + DIRS[d][1] * len));
        if (nx === gx && ny === gy) { d = (d + 4) % 8; continue; }
        gx = nx; gy = ny;
        pts.push([gx * G, gy * G]);
      }
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      traces.push({ pts, cum, total: cum[cum.length - 1], lit: 0 });
    }
    pulses = [];
  }
  build();

  const at = (tr, d) => {
    d = Math.max(0, Math.min(tr.total, d));
    let i = 1;
    while (i < tr.cum.length - 1 && tr.cum[i] < d) i++;
    const a = tr.pts[i - 1], b = tr.pts[i], seg = tr.cum[i] - tr.cum[i - 1] || 1;
    const k = (d - tr.cum[i - 1]) / seg;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  const launch = (tr, alt = Math.random() < 0.25) => {
    if (tr && tr.total > 0 && pulses.length < 40) pulses.push({ tr, d: 0, sp: rand(170, 320), len: rand(50, 90), alt });
  };
  const distTo = (tr, x, y) => {
    let m = 1e9;
    for (const p of tr.pts) m = Math.min(m, Math.hypot(p[0] - x, p[1] - y));
    return m;
  };
  const nearest = (x, y, r) => {
    let best = null, bd = r;
    for (const tr of traces) { const d = distTo(tr, x, y); if (d < bd) { bd = d; best = tr; } }
    return best;
  };

  return {
    resize(nw, nh) { w = nw; h = nh; build(); },
    tap(x, y) {
      flashes.push({ x, y, age: 0 });
      for (let i = 0; i < 6; i++) launch(nearest(x, y, 260) || traces[randInt(0, traces.length - 1)], i % 3 === 0);
    },
    step(dt, ptr) {
      t += dt; auto -= dt; cool -= dt;
      if (auto <= 0 && pulses.length < 16 && traces.length) { launch(traces[randInt(0, traces.length - 1)]); auto = rand(0.15, 0.4); }
      const inside = ptr.x > -1000;
      for (const tr of traces) {
        const target = inside && distTo(tr, ptr.x, ptr.y) < 120 ? 1 : 0;
        tr.lit += (target - tr.lit) * Math.min(1, dt * 6);
      }
      if (inside && Math.hypot(ptr.vx, ptr.vy) > 80 && cool <= 0) { launch(nearest(ptr.x, ptr.y, 140)); cool = 0.09; }
      for (const p of pulses) {
        p.d += p.sp * dt;
        if (p.d >= p.tr.total + p.len && !p.done) {
          p.done = true;
          const e = p.tr.pts[p.tr.pts.length - 1];
          flashes.push({ x: e[0], y: e[1], age: 0 });
        }
      }
      pulses = pulses.filter((p) => !p.done);
      for (const f of flashes) f.age += dt;
      while (flashes.length && flashes[0].age > 0.9) flashes.shift();
    },
    draw(ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const tr of traces) {
        ctx.strokeStyle = `rgba(${col},${0.13 + tr.lit * 0.4})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        tr.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.stroke();
        for (const p of [tr.pts[0], tr.pts[tr.pts.length - 1]]) {
          ctx.strokeStyle = `rgba(${col},${0.25 + tr.lit * 0.5})`;
          ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, TAU); ctx.stroke();
        }
      }
      blend(ctx, dark);
      for (const p of pulses) {
        const c = p.alt ? col2 : col;
        const STEPS = 8;
        for (let k = 0; k < STEPS; k++) {
          const d0 = p.d - (k * p.len) / STEPS, d1 = p.d - ((k + 1) * p.len) / STEPS;
          if (d0 < 0 || d1 > p.tr.total) continue;
          const a = at(p.tr, d0), b = at(p.tr, d1);
          ctx.strokeStyle = `rgba(${c},${(1 - k / STEPS) * 0.9})`;
          ctx.lineWidth = 2.6 * (1 - k / STEPS) + 0.6;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        if (p.d <= p.tr.total) {
          const [x, y] = at(p.tr, p.d);
          const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
          g.addColorStop(0, `rgba(${c},.9)`); g.addColorStop(1, `rgba(${c},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill();
        }
      }
      for (const f of flashes) {
        const k = f.age / 0.9;
        ctx.strokeStyle = `rgba(${col},${0.8 * (1 - k)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(f.x, f.y, 4 + k * 38, 0, TAU); ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
