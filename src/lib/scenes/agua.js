import { createCaustics } from './caustics.js';

// Água cristalina: reflexos de luz de uma piscina. O ponteiro cria ondulações e
// uma lente de luz; tocar solta uma onda maior.
export default function agua(w, h, dark, hue) {
  const cs = createCaustics(w, h, dark, hue);
  let cool = 0;
  return {
    resize(nw, nh) { w = nw; h = nh; cs?.resize(nw, nh); },
    tap(x, y) { cs?.ripple(x, y); },
    step(dt, ptr) {
      cool -= dt;
      if (ptr.x > -1000 && Math.hypot(ptr.vx, ptr.vy) > 140 && cool <= 0) { cs?.ripple(ptr.x, ptr.y); cool = 0.14; }
      cs?.step(dt, ptr);
    },
    draw(ctx) {
      if (cs) { ctx.drawImage(cs.render(), 0, 0, w, h); return; }
      const g = ctx.createLinearGradient(0, 0, 0, h); // sem WebGL: só o degradê
      g.addColorStop(0, '#28b6dc'); g.addColorStop(1, '#0a6aaa');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    },
    destroy() { cs?.destroy(); },
  };
}
