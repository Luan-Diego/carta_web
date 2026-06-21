import { DEFAULTS } from './defaults.js';

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
  return out;
}

// Página da carta: aplica o tema no documento inteiro, título e cor da barra do navegador
export function applyTheme(cfg) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(themeVars(cfg))) root.style.setProperty(name, value);
  document.title = cfg.titulo || DEFAULTS.titulo;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', cfg.cores.fundo1);
}
