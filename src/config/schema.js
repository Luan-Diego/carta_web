import { DEFAULTS, LIMITS } from './defaults.js';

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]+\)|hsla?\([\d\s.,%/a-z]+\))$/i;

export const safeColor = (v, fallback) =>
  typeof v === 'string' && COLOR_RE.test(v.trim()) ? v.trim() : fallback;

// Junta só as chaves conhecidas e do tipo certo. Seguro para dados vindos de um link.
export function merge(base, extra) {
  const out = {};
  for (const k of Object.keys(base)) {
    const b = base[k];
    const v = extra && typeof extra === 'object' ? extra[k] : undefined;
    if (Array.isArray(b)) out[k] = Array.isArray(v) && v.every((x) => typeof x === 'string') ? v : b;
    else if (b && typeof b === 'object') out[k] = merge(b, v);
    else out[k] = typeof v === typeof b ? v : b;
  }
  return out;
}

// Aplica limites de tamanho e valida as cores. Sempre devolve uma configuração segura.
export function sanitize(cfg) {
  const cores = {};
  for (const k of Object.keys(DEFAULTS.cores)) cores[k] = safeColor(cfg.cores[k], DEFAULTS.cores[k]);
  return {
    titulo: cfg.titulo.slice(0, LIMITS.titulo),
    carta: {
      saudacao: cfg.carta.saudacao.slice(0, LIMITS.saudacao),
      mensagem: cfg.carta.mensagem.slice(0, LIMITS.paragrafos).map((t) => t.slice(0, LIMITS.paragrafo)),
      assinatura: cfg.carta.assinatura.slice(0, LIMITS.assinatura),
    },
    cores,
    som: cfg.som !== false,
  };
}

// resolveConfig(siteConfig, doLink) → padrões < carta do site < link, já validado
export function resolveConfig(...layers) {
  return sanitize(layers.reduce((acc, layer) => merge(acc, layer), DEFAULTS));
}

export { LIMITS };
