// Cenas animadas de fundo. Cada uma é carregada só quando usada (o código de
// uma cena não pesa na página das outras). Contrato de uma cena:
//   create(w, h, dark, hue) → { resize(w, h), step(dt, ptr), draw(ctx), tap(x, y), destroy?() }
// hue = matiz (0-359) escolhido pelo usuário para a cena, ou -1 para as cores originais.
// ptr = { x, y, vx, vy } em px (x = -9999 quando o ponteiro está fora).
const LOADERS = {
  particulas: () => import('./particles.js').then((m) => m.default),
  nebulosa: () => import('./nebula.js').then((m) => m.default),
  aurora: () => import('./aurora.js').then((m) => m.default),
  estrelado: () => import('./sky.js').then((m) => m.default),
  agua: () => import('./agua.js').then((m) => m.default),
  ondas: () => import('./waves.js').then((m) => m.default),
  chuva: () => import('./rain.js').then((m) => m.default),
  jardim: () => import('./garden.js').then((m) => m.default),
  fogo: () => import('./fire.js').then((m) => m.default),
  circuitos: () => import('./circuits.js').then((m) => m.default),
  petalas: () => import('./falling.js').then((m) => m.petalas),
  coracoes: () => import('./falling.js').then((m) => m.coracoes),
  estrelas: () => import('./falling.js').then((m) => m.estrelas),
};

export const hasScene = (id) => id in LOADERS;

export async function createScene(id, w, h, dark, hue = -1) {
  const create = await LOADERS[id]();
  return create(w, h, dark, hue);
}
