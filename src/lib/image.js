// Prepara imagens enviadas pelo usuário para caber dentro do link: reduz o
// tamanho (pixels) e a qualidade até o texto ficar abaixo do limite.

const MAX_FILE = 8 * 1024 * 1024; // arquivo de entrada
export const STICKER_MAX_PX = 128; // maior lado de um adesivo guardado no link

const TIPOS = /^image\/(png|jpeg|webp|gif)$/;

export function checarArquivo(file) {
  if (!file || !TIPOS.test(file.type)) return 'Use uma imagem PNG, JPG, WebP ou GIF.';
  if (file.size > MAX_FILE) return 'A imagem é grande demais (máximo 8 MB).';
  return '';
}

// { bmp, w, h } ou { erro }
export async function lerImagem(file) {
  const erro = checarArquivo(file);
  if (erro) return { erro };
  try {
    let bmp = null;
    if (typeof createImageBitmap === 'function') bmp = await createImageBitmap(file).catch(() => null);
    if (!bmp) {
      const url = URL.createObjectURL(file);
      try {
        bmp = new Image();
        bmp.src = url;
        await bmp.decode();
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
    return w && h ? { bmp, w, h } : { erro: 'Não foi possível ler essa imagem.' };
  } catch {
    return { erro: 'Não foi possível ler essa imagem.' };
  }
}

// Reduz `origem` (imagem ou canvas) até o texto caber em maxChars. { dataUrl } ou { erro }
export function comprimir(origem, ow, oh, { sides, qualities, mime, maxChars }) {
  const canvas = document.createElement('canvas');
  const c = canvas.getContext('2d');
  for (const side of sides) {
    const k = Math.min(1, side / Math.max(ow, oh));
    canvas.width = Math.max(1, Math.round(ow * k));
    canvas.height = Math.max(1, Math.round(oh * k));
    if (mime === 'image/jpeg') { c.fillStyle = '#fff'; c.fillRect(0, 0, canvas.width, canvas.height); } // JPEG não tem transparência
    else c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(origem, 0, 0, canvas.width, canvas.height);
    for (const q of qualities) {
      const url = canvas.toDataURL(mime, q);
      if (url.length <= maxChars && /^data:image\/(webp|png|jpeg);base64,/.test(url)) return { dataUrl: url };
    }
  }
  return { erro: 'Mesmo reduzida, a imagem não cabe no link. Tente uma imagem mais simples.' };
}

// Recorte quadrado: (cx, cy) = centro (0 a 1 da imagem), zoom >= 1. Devolve um canvas.
export function recortar(bmp, w, h, cx, cy, zoom, saida = 256) {
  const lado = Math.min(w, h) / Math.max(1, zoom);
  const sx = Math.min(w - lado, Math.max(0, cx * w - lado / 2));
  const sy = Math.min(h - lado, Math.max(0, cy * h - lado / 2));
  const cv = document.createElement('canvas');
  const px = Math.min(saida, Math.round(lado));
  cv.width = cv.height = Math.max(1, px);
  cv.getContext('2d').drawImage(bmp, sx, sy, lado, lado, 0, 0, cv.width, cv.height);
  return cv;
}

const OPT_ADESIVO = { sides: [STICKER_MAX_PX, 96, 80, 64], qualities: [0.85, 0.7, 0.55], mime: 'image/webp', maxChars: 9000 };
export const comprimirAdesivo = (origem, w, h) => comprimir(origem, w, h, OPT_ADESIVO);

// Fundo: JPEG reduzido (o link fica longo; para imagem nítida use um endereço https)
export async function toBackground(file) {
  const img = await lerImagem(file);
  if (img.erro) return { erro: img.erro };
  return comprimir(img.bmp, img.w, img.h, { sides: [640, 520, 420, 340, 280], qualities: [0.6, 0.45, 0.32], mime: 'image/jpeg', maxChars: 14000 });
}
