import { onBeforeUnmount, onMounted, ref } from 'vue';

// Escala do envelope conforme o tamanho do elemento (tela inteira ou pré-visualização).
export function useFit(el) {
  const fit = ref(1);
  let observer = null;

  function update() {
    const node = el.value;
    if (!node) return;
    const s = Math.min(node.clientWidth / 380, node.clientHeight / 600, 1.4);
    fit.value = Math.max(0.55, Number(s.toFixed(3)));
  }

  onMounted(() => {
    update();
    if (typeof ResizeObserver !== 'undefined' && el.value) {
      observer = new ResizeObserver(update);
      observer.observe(el.value);
    }
  });
  onBeforeUnmount(() => observer?.disconnect());

  return fit;
}
