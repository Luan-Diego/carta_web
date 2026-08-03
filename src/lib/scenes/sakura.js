import { TAU, rand, rotStr } from './util.js';

// Cerejeiras desenhadas uma vez num canvas fora da tela: troncos ramificados e
// nuvens de flores pálidas, desfocados. A cena as mostra com pouca opacidade.
export function sakura(w, h, delta) {
  const mk = () => {
    const el = document.createElement('canvas');
    el.width = Math.max(1, Math.round(w));
    el.height = Math.max(1, Math.round(h));
    return el;
  };
  const cru = mk(); // desenho nítido; o desfoque é aplicado uma vez só, no final
  const c = cru.getContext('2d');
  const flor = rotStr([247, 182, 200], delta);
  const flor2 = rotStr([252, 215, 226], delta);
  const tronco = rotStr([96, 66, 70], delta * 0.2);

  function flores(x, y, r) {
    for (let i = 0; i < 10; i++) {
      c.fillStyle = `rgba(${i % 3 ? flor : flor2},.5)`;
      c.beginPath(); c.arc(x + rand(-r, r), y + rand(-r * 0.8, r * 0.8), rand(4, 9), 0, TAU); c.fill();
    }
  }

  function galho(x, y, ang, len, largura, nivel) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    c.strokeStyle = `rgba(${tronco},.85)`;
    c.lineWidth = Math.max(1, largura);
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo((x + x2) / 2 + rand(-len, len) * 0.18, (y + y2) / 2 + rand(-len, len) * 0.18, x2, y2);
    c.stroke();
    if (nivel <= 1) flores(x2, y2, 16 + nivel * 8);
    if (nivel <= 0) return;
    const filhos = nivel > 3 ? 2 : Math.random() < 0.5 ? 2 : 3;
    for (let i = 0; i < filhos; i++) {
      galho(x2, y2, ang + (i - (filhos - 1) / 2) * 0.62 + rand(-0.25, 0.25), len * rand(0.68, 0.82), largura * 0.68, nivel - 1);
    }
  }

  const u = Math.min(w, h * 1.4);
  galho(w * 0.07, h + 6, -Math.PI / 2 - 0.15, h * 0.2, u * 0.026, 6);
  galho(w * 0.94, h + 6, -Math.PI / 2 + 0.2, h * 0.19, u * 0.024, 6);
  c.globalAlpha = 0.55; // árvore mais distante, mais apagada ainda
  galho(w * 0.52, h * 0.85, -Math.PI / 2 + 0.05, h * 0.09, u * 0.012, 5);
  const cv = mk();
  const f = cv.getContext('2d');
  if ('filter' in f) f.filter = 'blur(1.6px)'; // Safari antigo ignora: fica só mais nítido
  f.drawImage(cru, 0, 0);
  return cv;
}
