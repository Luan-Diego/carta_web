import { TAU, clamp, hexToRgb, rotRgb, tintDelta } from './util.js';

// Ajudas das cenas de paisagem (Paris, Japão, Gramado, Pássaros, Cidade, Rio):
// camadas "assadas" em canvas separados (desenhadas uma vez e só copiadas a cada quadro),
// ruído suave para montanhas e nuvens, e cores que acompanham o matiz escolhido.

export const dpr = () => Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);

// Desenha em um canvas transparente do tamanho da cena (nítido em telas 2x) e devolve esse canvas
export function baked(w, h, fn) {
  const k = dpr();
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * k));
  c.height = Math.max(1, Math.round(h * k));
  const x = c.getContext('2d');
  x.scale(k, k);
  fn(x, w, h);
  return c;
}

// Ruído de valor 1D, suave e sempre igual para a mesma semente
export function ruido(seed = 1) {
  const r = (i) => {
    const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const sm = (t) => t * t * (3 - 2 * t);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    return r(i) + (r(i + 1) - r(i)) * sm(f);
  };
}
export function fbm(seed = 1) {
  const n = ruido(seed);
  return (x) => 0.55 * n(x) + 0.28 * n(x * 2.1 + 7) + 0.17 * n(x * 4.3 + 13);
}

// Degradê vertical de topo a base. paradas: [[0, '#hex'], [1, 'rgba()']]
export function ceu(ctx, w, h, paradas) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [p, c] of paradas) g.addColorStop(p, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Cordilheira: preenche de uma linha irregular até o fim da tela
export function serra(ctx, w, h, base, amp, freq, fill, seed) {
  const f = fbm(seed);
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w + 4; x += 4) ctx.lineTo(x, base - f(x * freq) * amp);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// Cor '#rrggbb' girada pelo matiz escolhido (d = graus), já como 'rgba(...)'
export const rot = (hex, d, a = 1) => {
  const [r, g, b] = rotRgb(hexToRgb(hex), d);
  return `rgba(${r},${g},${b},${a})`;
};
// Matiz de referência da cena -> deslocamento
export const delta = (hue, ref) => tintDelta(hue, ref);

// Nuvem pintada: vários círculos de degradê radial; rgb = 'r,g,b' (parte de baixo mais escura)
export function nuvemSprite(w, h, rgb, rgbSombra, seed = 1) {
  const n = ruido(seed);
  return baked(w, h, (x) => {
    const puffs = 16;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < puffs; i++) {
        const t = i / (puffs - 1);
        const cx = w * (0.16 + 0.68 * t);
        const alt = Math.sin(t * Math.PI) * 0.5 + 0.18 + n(i * 1.7) * 0.2;
        const r = h * (0.1 + alt * 0.26);
        const cy = h * 0.62 - alt * h * 0.34 + (pass ? -r * 0.12 : r * 0.1);
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        const c = pass ? rgb : rgbSombra;
        g.addColorStop(0, `rgba(${c},${pass ? 0.55 : 0.5})`);
        g.addColorStop(1, `rgba(${c},0)`);
        x.fillStyle = g;
        x.beginPath();
        x.arc(cx, cy, r, 0, TAU);
        x.fill();
      }
    }
  });
}

// Brilho aditivo (luz) em (x, y)
export function luz(ctx, x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

// Parede de ondas de luz sobre a água: faixas horizontais curtas e cintilantes
export function brilhosAgua(ctx, x0, x1, y0, y1, t, rgb, alpha, passo = 7) {
  ctx.fillStyle = `rgba(${rgb},${alpha})`;
  for (let y = y0; y < y1; y += passo) {
    const k = (y - y0) / (y1 - y0);
    const larg = 10 + k * 46;
    const off = Math.sin(t * 1.3 + y * 0.9) * 8 * (0.3 + k);
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.1 + y * 1.7));
    ctx.globalAlpha = a;
    ctx.fillRect((x0 + x1) / 2 + off - larg / 2, y, larg, 1.4 + k * 1.2);
  }
  ctx.globalAlpha = 1;
}

export const escala = (w, h) => clamp(Math.min(w / 700, h / 600), 0.55, 1.6);
