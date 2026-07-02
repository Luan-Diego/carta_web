// Ajudas comuns às cenas animadas de fundo (canvas 2D, sem bibliotecas).

export const TAU = Math.PI * 2;
export const rand = (a, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// Telas menores desenham menos elementos (0,45 a 1,3 em relação a 1280x720)
export const density = (w, h) => clamp((w * h) / (1280 * 720), 0.45, 1.3);

// Em fundo escuro as luzes se somam; em fundo claro, ficam por cima com cor própria
export const blend = (ctx, dark) => {
  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
};

// O ponteiro está perto de (x, y)? Devolve a direção de afastamento e a força (0 a 1)
export function near(ptr, x, y, radius) {
  const dx = x - ptr.x;
  const dy = y - ptr.y;
  const d2 = dx * dx + dy * dy;
  if (d2 > radius * radius) return null;
  const d = Math.sqrt(d2) || 1;
  return { dx: dx / d, dy: dy / d, k: 1 - d / radius };
}

// Brilho suave (círculo com degradê radial)
export function glow(ctx, x, y, r, rgb, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

// Formas em torno de (0, 0), com tamanho s
export function heartPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.5, -s * 1.05, 0, -s * 0.4);
  ctx.bezierCurveTo(s * 0.5, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35);
  ctx.closePath();
}

export function petalPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.7, s * 0.6, 0, s);
  ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.95, -s * 0.55, 0, -s);
  ctx.closePath();
}

export function starPath(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}
