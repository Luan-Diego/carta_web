import { DEFAULTS, LIMITS } from './defaults.js';
import { ADESIVOS, ESTAMPAS, FUNDO_ANTIGO, FUNDOS, LACRES, LACRE_SIZE, STICKER_SIZE } from './options.js';

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

const DATA_RE = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/;
const URL_RE = /^https:\/\/[^\s"'<>()\\]+$/;

// Imagem do usuário: data URL de png/webp/jpeg (sem SVG) ou endereço https simples
export function safeImage(v, { data = true, url = true } = {}) {
  if (typeof v !== 'string') return '';
  if (data && v.length <= LIMITS.dataUrl && DATA_RE.test(v)) return v;
  if (url && v.length <= LIMITS.url && URL_RE.test(v)) return v;
  return '';
}

// Só aceita valores das listas de options.js; o resto volta ao padrão
function sanitizeVisual(v) {
  const inicial = Array.from(v.inicial.trim()).slice(0, LIMITS.inicial).join('');
  const lacre = LACRES.some((o) => o.id === v.lacre) ? v.lacre : DEFAULTS.visual.lacre;
  const fundoId = FUNDO_ANTIGO[v.fundo] || v.fundo;
  const tam = Number.isFinite(v.adesivoTam) ? v.adesivoTam : STICKER_SIZE.padrao;
  const lt = Number.isFinite(v.lacreTam) ? v.lacreTam : LACRE_SIZE.padrao;
  return {
    fundo: FUNDOS.some((o) => o.id === fundoId) ? fundoId : DEFAULTS.visual.fundo,
    matiz: Number.isFinite(v.matiz) && v.matiz >= 0 && v.matiz < 360 ? Math.round(v.matiz) : -1,
    imagem: safeImage(v.imagem),
    lacre: lacre === 'inicial' && !inicial ? DEFAULTS.visual.lacre : lacre, // inicial sem letra: coração
    inicial,
    lacreEmoji: ADESIVOS.includes(v.lacreEmoji) ? v.lacreEmoji : '',
    lacreImg: safeImage(v.lacreImg, { url: false }),
    lacreTam: Math.min(LACRE_SIZE.max, Math.max(LACRE_SIZE.min, Math.round(lt))),
    para: v.para.slice(0, LIMITS.para),
    adesivo: ADESIVOS.includes(v.adesivo) ? v.adesivo : '',
    adesivoImg: safeImage(v.adesivoImg, { url: false }),
    estampa: ESTAMPAS.some((o) => o.id === v.estampa) ? v.estampa : '',
    postal: ADESIVOS.includes(v.postal) ? v.postal : '',
    adesivoTam: Math.min(STICKER_SIZE.max, Math.max(STICKER_SIZE.min, Math.round(tam))),
  };
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
    visual: sanitizeVisual(cfg.visual),
  };
}

// resolveConfig(siteConfig, doLink) → padrões < carta do site < link, já validado
export function resolveConfig(...layers) {
  return sanitize(layers.reduce((acc, layer) => merge(acc, layer), DEFAULTS));
}

export { LIMITS };
