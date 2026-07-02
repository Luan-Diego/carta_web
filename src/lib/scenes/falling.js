import { TAU, density, glow, heartPath, near, petalPath, pick, rand, starPath } from './util.js';

// Itens que caem com balanço: pétalas, corações e estrelas. Fogem do dedo/mouse
// (que também sopra vento ao passar rápido). Toque: explosão de itens.
function falling({ base, colors, size, shape, speed }) {
  return (w, h) => {
    const total = () => Math.round(base * density(w, h));
    let list = [];
    let t = 0;
    const make = (x = rand(w), y = rand(-h, h)) => ({
      x, y, vx: 0, bx: 0, by: 0,
      s: rand(size[0], size[1]),
      vy: rand(speed[0], speed[1]),
      sway: rand(18, 48),
      ph: rand(TAU),
      rot: rand(TAU),
      vr: rand(-1.4, 1.4),
      color: pick(colors),
      ttl: 0,
    });
    const fill = () => {
      const perm = list.filter((p) => !p.ttl);
      while (perm.length < total()) perm.push(make());
      list = perm.slice(0, total()).concat(list.filter((p) => p.ttl));
    };
    fill();

    return {
      resize(nw, nh) { w = nw; h = nh; fill(); },
      tap(x, y) {
        for (let i = 0; i < 14; i++) {
          const a = rand(TAU), v = rand(80, 260);
          const p = make(x, y);
          p.bx = Math.cos(a) * v; p.by = Math.sin(a) * v - 60; p.ttl = 6;
          list.push(p);
        }
      },
      step(dt, ptr) {
        t += dt;
        const decay = Math.exp(-1.8 * dt);
        for (const p of list) {
          p.x += (p.vx + p.bx + Math.sin(t * 1.1 + p.ph) * p.sway) * dt;
          p.y += (p.vy + p.by) * dt;
          p.rot += p.vr * dt;
          p.bx *= decay; p.by *= decay;
          p.vx *= Math.exp(-1.2 * dt);
          const n = near(ptr, p.x, p.y, 150);
          if (n) {
            p.x += n.dx * n.k * 240 * dt;
            p.y += n.dy * n.k * 160 * dt;
            p.vx += ptr.vx * n.k * 0.9 * dt;
          }
          if (p.ttl) p.ttl -= dt;
          if (p.y > h + 40) {
            if (p.ttl) p.ttl = 0.0001;
            else { p.y = -30; p.x = rand(w); }
          }
        }
        list = list.filter((p) => !p.ttl || p.ttl > 0);
      },
      draw(ctx) {
        for (const p of list) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(shape === 'petal' ? Math.cos(t * 1.4 + p.ph) * 0.5 + 0.6 : 1, 1);
          if (shape === 'star') {
            ctx.rotate(-p.rot * 0.5);
            glow(ctx, 0, 0, p.s * 2.6, '255,235,160', 0.45);
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.95;
          if (shape === 'petal') petalPath(ctx, p.s);
          else if (shape === 'heart') heartPath(ctx, p.s);
          else starPath(ctx, p.s);
          ctx.fill();
          ctx.restore();
        }
      },
    };
  };
}

export const petalas = falling({
  base: 36, size: [9, 17], speed: [55, 110], shape: 'petal',
  colors: ['#f29bb4', '#f6b3c5', '#ee86a5', '#f9c4d2', '#f08fab'],
});
export const coracoes = falling({
  base: 32, size: [9, 19], speed: [60, 120], shape: 'heart',
  colors: ['#ff6b8b', '#ff8fa6', '#e83e66', '#ffb3c4', '#f25c7e'],
});
export const estrelas = falling({
  base: 36, size: [5, 11], speed: [70, 140], shape: 'star',
  colors: ['#fff3b0', '#ffffff', '#ffd86b', '#cfeaff'],
});
