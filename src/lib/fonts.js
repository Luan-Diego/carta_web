import { FONTE_PROPRIA } from '../config/options.js';

// Carrega a fonte escolhida só quando ela é usada. As fontes do app vêm do pacote
// @fontsource: o Vite as copia para o site, então não dependem de quem vê a carta.
const CARREGADORES = {
  playfair: () => import('@fontsource/playfair-display/400.css'),
  lora: () => import('@fontsource/lora/400.css'),
  cormorant: () => import('@fontsource/cormorant-garamond/400.css'),
  merriweather: () => import('@fontsource/merriweather/400.css'),
  dancing: () => import('@fontsource/dancing-script/400.css'),
  greatvibes: () => import('@fontsource/great-vibes/400.css'),
  satisfy: () => import('@fontsource/satisfy/400.css'),
  caveat: () => import('@fontsource/caveat/400.css'),
  patrick: () => import('@fontsource/patrick-hand/400.css'),
  quicksand: () => import('@fontsource/quicksand/400.css'),
};

const feitas = new Map();
let propria = null; // { arq, face }

async function carregarPropria(arq) {
  if (propria?.arq === arq) return;
  const face = new FontFace(FONTE_PROPRIA, `url(${arq})`);
  await face.load(); // lança se o arquivo não for uma fonte válida
  if (propria) document.fonts.delete(propria.face);
  document.fonts.add(face);
  propria = { arq, face };
}

// Resolve quando a fonte está pronta (ou falhou: a carta cai na fonte padrão)
export function carregarFonte(fonte, arq = '') {
  if (fonte === 'propria') return arq ? carregarPropria(arq).catch(() => {}) : Promise.resolve();
  const load = CARREGADORES[fonte];
  if (!load) return Promise.resolve();
  if (!feitas.has(fonte)) feitas.set(fonte, load().catch(() => feitas.delete(fonte)));
  return feitas.get(fonte);
}

// Lê um arquivo de fonte como data URL com o tipo certo; testa se o navegador a aceita
const TIPOS = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };
export async function lerFonte(file, max) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!TIPOS[ext]) return { erro: 'Use um arquivo .woff2, .woff, .ttf ou .otf.' };
  if (file.size > max) return { erro: `A fonte é grande demais (máximo ${Math.round(max / 1024)} KB).` };
  const bytes = new Uint8Array(await file.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const src = `data:${TIPOS[ext]};base64,${btoa(bin)}`;
  try {
    await new FontFace('teste', `url(${src})`).load();
  } catch {
    return { erro: 'Não consegui abrir esse arquivo como fonte.' };
  }
  return { src };
}
