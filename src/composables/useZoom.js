import { onBeforeUnmount, onMounted, ref } from 'vue';

export const ZOOM = { min: 0.6, max: 2.4, passo: 1.25 };
const clamp = (v) => Math.min(ZOOM.max, Math.max(ZOOM.min, v));

// Zoom do envelope: roda do mouse, gesto de pinça (dois dedos), teclas + − 0 e
// botões. Não usa reatividade além do valor `zoom`, que vira a variável CSS --zoom.
export function useZoom(el) {
  const zoom = ref(1);
  const dedos = new Map(); // pointerId → { x, y }
  let base = null; // { dist, zoom } enquanto há pinça
  let fimPinca = 0;

  const set = (z) => (zoom.value = Number(clamp(z).toFixed(3)));
  const por = (k) => set(zoom.value * k);

  const onWheel = (e) => {
    e.preventDefault();
    por(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
  };

  const dist = () => {
    const [a, b] = [...dedos.values()];
    return Math.hypot(a.x - b.x, a.y - b.y) || 1;
  };
  const onDown = (e) => {
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dedos.size === 2) base = { dist: dist(), zoom: zoom.value };
  };
  const onMove = (e) => {
    if (!dedos.has(e.pointerId)) return;
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dedos.size === 2 && base) set(base.zoom * (dist() / base.dist));
  };
  const onUp = (e) => {
    if (dedos.size >= 2) fimPinca = performance.now();
    dedos.delete(e.pointerId);
    if (dedos.size < 2) base = null;
  };

  onMounted(() => {
    const n = el.value;
    if (!n) return;
    n.addEventListener('wheel', onWheel, { passive: false });
    n.addEventListener('pointerdown', onDown, true);
    n.addEventListener('pointermove', onMove, true);
    n.addEventListener('pointerup', onUp, true);
    n.addEventListener('pointercancel', onUp, true);
  });
  onBeforeUnmount(() => {
    const n = el.value;
    if (!n) return;
    n.removeEventListener('wheel', onWheel);
    n.removeEventListener('pointerdown', onDown, true);
    n.removeEventListener('pointermove', onMove, true);
    n.removeEventListener('pointerup', onUp, true);
    n.removeEventListener('pointercancel', onUp, true);
  });

  return {
    zoom,
    zoomIn: () => por(ZOOM.passo),
    zoomOut: () => por(1 / ZOOM.passo),
    resetZoom: () => set(1),
    pinching: () => dedos.size >= 2, // há dois dedos na tela
    recentPinch: () => dedos.size >= 2 || performance.now() - fimPinca < 350, // evita um "toque" ao soltar a pinça
  };
}
