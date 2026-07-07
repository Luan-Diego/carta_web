import { DEFAULTS } from './defaults.js';
import { FONTES, FONTE_PROPRIA } from './options.js';

const VARS = {
  fundo1: '--bg-1',
  fundo2: '--bg-2',
  envelope: '--env-cover',
  papel: '--paper',
  texto: '--txt-color',
  lacre: '--heart-color',
};

// Variáveis CSS correspondentes às cores da configuração (use em :style)
export function themeVars(cfg) {
  const out = {};
  for (const [key, name] of Object.entries(VARS)) out[name] = cfg.cores[key];
  const fonte = cfg.visual?.fonte;
  if (fonte === 'propria') out['--font-carta'] = `'${FONTE_PROPRIA}', Georgia, serif`;
  else if (fonte && fonte !== 'padrao') out['--font-carta'] = FONTES.find((o) => o.id === fonte)?.familia;
  return out;
}

// Brilho (0 a 1) de uma cor #hex ou rgb(). Cor desconhecida conta como clara.
function luminance(color) {
  let r, g, b;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  } else {
    const m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(color);
    if (!m) return 1;
    [r, g, b] = [m[1], m[2], m[3]].map(Number);
  }
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// 'dark' ou 'light', conforme o fundo: ajusta cor da dica e dos efeitos para dar contraste
export function toneOf(cfg) {
  return (luminance(cfg.cores.fundo1) + luminance(cfg.cores.fundo2)) / 2 < 0.45 ? 'dark' : 'light';
}

// Página da carta: aplica o tema no documento inteiro, título e cor da barra do navegador
export function applyTheme(cfg) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(themeVars(cfg))) root.style.setProperty(name, value);
  document.title = cfg.titulo || DEFAULTS.titulo;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', cfg.cores.fundo1);
}
