// Prepara imagens enviadas pelo usuário para caber dentro do link: reduz o
// tamanho (pixels) e a qualidade até o texto ficar abaixo do limite.

const MAX_FILE = 8 * 1024 * 1024; // arquivo de entrada

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* tenta pelo <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Devolve { dataUrl } ou { erro } (mensagem para mostrar ao usuário)
export async function shrinkImage(file, { sides, qualities, mime, maxChars }) {
  if (!file || !/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return { erro: 'Use uma imagem PNG, JPG, WebP ou GIF.' };
  if (file.size > MAX_FILE) return { erro: 'A imagem é grande demais (máximo 8 MB).' };
  let bmp;
  try {
    bmp = await loadBitmap(file);
  } catch {
    return { erro: 'Não foi possível ler essa imagem.' };
  }
  const bw = bmp.width || bmp.naturalWidth, bh = bmp.height || bmp.naturalHeight;
  if (!bw || !bh) return { erro: 'Não foi possível ler essa imagem.' };
  const canvas = document.createElement('canvas');
  const c = canvas.getContext('2d');
  for (const side of sides) {
    const k = Math.min(1, side / Math.max(bw, bh));
    canvas.width = Math.max(1, Math.round(bw * k));
    canvas.height = Math.max(1, Math.round(bh * k));
    if (mime === 'image/jpeg') { c.fillStyle = '#fff'; c.fillRect(0, 0, canvas.width, canvas.height); } // JPEG não tem transparência
    else c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    for (const q of qualities) {
      const url = canvas.toDataURL(mime, q);
      if (url.length <= maxChars && /^data:image\/(webp|png|jpeg);base64,/.test(url)) return { dataUrl: url };
    }
  }
  bmp.close?.();
  return { erro: 'Mesmo reduzida, a imagem não cabe no link. Tente uma imagem mais simples.' };
}

// Adesivo: pequeno, com transparência (WebP/PNG)
export const toSticker = (file) =>
  shrinkImage(file, { sides: [128, 96, 80, 64], qualities: [0.85, 0.7, 0.55], mime: 'image/webp', maxChars: 9000 });

// Fundo: JPEG reduzido (o link fica longo; para imagem nítida use um endereço https)
export const toBackground = (file) =>
  shrinkImage(file, { sides: [640, 520, 420, 340, 280], qualities: [0.6, 0.45, 0.32], mime: 'image/jpeg', maxChars: 14000 });
