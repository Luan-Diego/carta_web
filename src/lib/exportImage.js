// Gera uma imagem PNG do que importa na leitura: o fundo e a folha com o texto,
// a marca d'água e as decorações. Desenha tudo em um <canvas> (sem bibliotecas),
// com as mesmas medidas do modo leitura (styles/reader.css).

const EMOJI_FONTS = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const CARD_MAX = 560;
const PAD = { t: 36, r: 30, b: 30, l: 30 };
const MAX_LADO = 4096; // maior lado da imagem, em pixels

function carregar(src) {
  return new Promise((ok, falha) => {
    const img = new Image();
    if (/^https:/.test(src)) img.crossOrigin = 'anonymous'; // sem isso o canvas ficaria "contaminado"
    img.onload = () => ok(img);
    img.onerror = () => falha(new Error('imagem'));
    img.src = src;
  });
}
const tentar = (src) => (src ? carregar(src).catch(() => null) : Promise.resolve(null));

// quebra o texto em linhas que cabem na largura (palavras; sem espaços, letra a letra: serve para chinês e japonês)
export function quebrar(ctx, texto, max) {
  const linhas = [];
  let atual = '';
  for (const tok of texto.replace(/\s+/g, ' ').trim().match(/\S+\s*/g) || []) {
    if (ctx.measureText((atual + tok).trimEnd()).width <= max) {
      atual += tok;
      continue;
    }
    if (atual) linhas.push(atual.trimEnd());
    atual = '';
    if (ctx.measureText(tok.trimEnd()).width <= max) {
      atual = tok;
      continue;
    }
    for (const ch of Array.from(tok)) {
      if (atual && ctx.measureText(atual + ch).width > max) {
        linhas.push(atual);
        atual = '';
      }
      atual += ch;
    }
  }
  if (atual) linhas.push(atual.trimEnd());
  return linhas;
}

function retArredondado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// cobre a área como object-fit: cover
function cobrir(ctx, img, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const k = Math.max(w / iw, h / ih);
  ctx.drawImage(img, (w - iw * k) / 2, (h - ih * k) / 2, iw * k, ih * k);
}

/**
 * @param {object} o
 * @param {{saudacao,mensagem,assinatura}} o.letter
 * @param {object} o.visual   configuração visual (marca d'água, textura, decorações, fundo)
 * @param {object} o.cores    cores da carta (fundo1, fundo2, papel, texto)
 * @param {number} o.largura  largura da tela, em px
 * @param {number} o.altura   altura da tela, em px
 * @param {string} o.fonte    font-family em uso na leitura
 * @param {HTMLCanvasElement|null} o.fundoCanvas  cena animada do fundo (o quadro atual)
 * @returns {Promise<Blob>}
 */
export async function gerarImagem({ letter, visual, cores, largura, altura, fonte, fundoCanvas = null, dpr = 2 }) {
  const fam = fonte || 'Georgia, serif';
  try {
    await document.fonts.load(`17px ${fam}`);
    await document.fonts.load(`700 21px ${fam}`);
  } catch {
    /* segue com a fonte que houver */
  }

  const [fundoImg, marcaImg, ...decorImgs] = await Promise.all([
    visual.fundo === 'imagem' ? tentar(visual.imagem) : null,
    tentar(visual.marcaImg),
    ...(visual.decorImgs || []).map((s) => tentar(s)),
  ]);

  const W = Math.max(280, Math.round(largura));
  const cw = Math.min(CARD_MAX, W - 32);
  const medida = document.createElement('canvas').getContext('2d');

  // ---- layout do texto (igual ao modo leitura)
  const util = cw - PAD.l - PAD.r;
  const blocos = [];
  let y = PAD.t;
  const LH = 1.7;
  if (letter.saudacao) {
    medida.font = `700 21px ${fam}`;
    const ls = quebrar(medida, letter.saudacao, util);
    blocos.push({ ls, y, fonte: `700 21px ${fam}`, lh: 21 * LH, alinhar: 'left' });
    y += ls.length * 21 * LH + 12;
  }
  letter.mensagem.forEach((t, i) => {
    medida.font = `17px ${fam}`;
    const ls = quebrar(medida, t, util);
    if (i) y += 17 * 0.9;
    blocos.push({ ls, y, fonte: `17px ${fam}`, lh: 17 * LH, alinhar: 'left' });
    y += ls.length * 17 * LH;
  });
  if (letter.assinatura) {
    medida.font = `italic 17px ${fam}`;
    const ls = quebrar(medida, letter.assinatura, util);
    y += 17 * 1.4;
    blocos.push({ ls, y, fonte: `italic 17px ${fam}`, lh: 17 * LH, alinhar: 'right' });
    y += ls.length * 17 * LH;
  }
  const ch = Math.max(120, y + PAD.b);
  const H = Math.max(Math.round(altura), Math.ceil(ch + 48));

  // ---- tamanho final do arquivo
  const esc = Math.min(dpr, MAX_LADO / Math.max(W, H));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * esc);
  canvas.height = Math.round(H * esc);
  const ctx = canvas.getContext('2d');
  ctx.scale(esc, esc);

  // ---- fundo
  ctx.save();
  ctx.translate(W / 2, H * 0.35);
  ctx.scale(1, H / W);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.82);
  g.addColorStop(0, cores.fundo1);
  g.addColorStop(1, cores.fundo2);
  ctx.fillStyle = g;
  ctx.fillRect(-W, -W, W * 2, W * 2);
  ctx.restore();
  if (fundoImg) cobrir(ctx, fundoImg, W, H);
  else if (fundoCanvas && fundoCanvas.width > 0) {
    try {
      cobrir(ctx, fundoCanvas, W, H);
    } catch {
      /* cena indisponível: fica o degradê */
    }
  }
  ctx.fillStyle = 'rgba(40,34,22,.35)'; // o escurecido do modo leitura
  ctx.fillRect(0, 0, W, H);

  // ---- folha
  const cx = (W - cw) / 2;
  const cy = (H - ch) / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(40,34,22,.3)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  retArredondado(ctx, cx, cy, cw, ch, 6);
  ctx.fillStyle = cores.papel;
  ctx.fill();
  ctx.restore();

  ctx.save();
  retArredondado(ctx, cx, cy, cw, ch, 6);
  ctx.clip();
  ctx.translate(cx, cy);

  // textura
  const tx = visual.papelTextura;
  if (tx) {
    ctx.strokeStyle = cores.texto;
    ctx.fillStyle = cores.texto;
    if (tx === 'pautado') {
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = cw * 0.0037;
      for (let yy = cw * 0.0926; yy < ch; yy += cw * 0.0963) {
        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(cw, yy);
        ctx.stroke();
      }
    } else if (tx === 'quadriculado') {
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = cw * 0.0037;
      const p = cw * 0.0667;
      for (let yy = p; yy < ch; yy += p) {
        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(cw, yy);
        ctx.stroke();
      }
      for (let xx = p; xx < cw; xx += p) {
        ctx.beginPath();
        ctx.moveTo(xx, 0);
        ctx.lineTo(xx, ch);
        ctx.stroke();
      }
    } else if (tx === 'pontilhado') {
      ctx.globalAlpha = 0.22;
      const p = cw * 0.052;
      for (let yy = p / 2; yy < ch; yy += p) for (let xx = p / 2; xx < cw; xx += p) {
        ctx.beginPath();
        ctx.arc(xx, yy, cw * 0.0025, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // marca d'água (atrás do texto)
  const op = (visual.marcaOp ?? 18) / 100;
  const mw = ((visual.marcaTam ?? 60) / 100) * cw;
  if (marcaImg) {
    const k = Math.min(mw / marcaImg.width, (ch * 0.9) / marcaImg.height);
    ctx.globalAlpha = op;
    ctx.drawImage(marcaImg, cw / 2 - (marcaImg.width * k) / 2, ch / 2 - (marcaImg.height * k) / 2, marcaImg.width * k, marcaImg.height * k);
    ctx.globalAlpha = 1;
  } else if (visual.marcaEmoji) {
    ctx.globalAlpha = op;
    ctx.font = `${mw * 0.8}px ${EMOJI_FONTS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(visual.marcaEmoji, cw / 2, ch / 2);
    ctx.globalAlpha = 1;
  }

  // texto
  ctx.fillStyle = cores.texto;
  ctx.textBaseline = 'middle';
  for (const b of blocos) {
    ctx.font = b.fonte;
    ctx.textAlign = b.alinhar;
    const x = b.alinhar === 'right' ? cw - PAD.r : PAD.l;
    b.ls.forEach((l, i) => ctx.fillText(l, x, b.y + b.lh * i + b.lh / 2));
  }

  // decorações (por cima)
  ctx.shadowColor = 'rgba(0,0,0,.22)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;
  for (const d of visual.decor || []) {
    ctx.save();
    ctx.translate((d.x / 100) * cw, (d.y / 100) * ch);
    ctx.rotate(((d.r || 0) * Math.PI) / 180);
    const lado = (d.s / 100) * cw;
    if (d.i !== undefined && decorImgs[d.i]) {
      const im = decorImgs[d.i];
      const k = Math.min(lado / im.width, lado / im.height);
      ctx.drawImage(im, (-im.width * k) / 2, (-im.height * k) / 2, im.width * k, im.height * k);
    } else if (d.e) {
      ctx.font = `${lado * 0.8}px ${EMOJI_FONTS}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.e, 0, 0);
    }
    ctx.restore();
  }
  ctx.restore();

  return new Promise((ok, falha) => canvas.toBlob((b) => (b ? ok(b) : falha(new Error('toBlob'))), 'image/png'));
}

// Salva a imagem: no celular abre o menu do aparelho ("Salvar imagem", Fotos...);
// no computador baixa o arquivo PNG. Devolve 'compartilhado', 'baixado' ou 'cancelado'.
export async function salvarImagem(blob, nome = 'carta.png') {
  const arquivo = new File([blob], nome, { type: 'image/png' });
  const toque = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  if (toque && navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo] });
      return 'compartilhado';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelado';
      /* sem suporte de fato: cai no download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'baixado';
}
