import { onBeforeUnmount, ref } from 'vue';
import { useSound } from './useSound.js';

const OPEN_MS = 2400; // duração da animação ao abrir
const CLOSE_MS = 1900; // duração da animação ao fechar

// Estado aberto/fechado do envelope + som correspondente.
export function useEnvelope() {
  const sound = useSound();
  const isOpen = ref(false);
  let busyUntil = 0;
  let timer = 0;

  const busy = () => performance.now() < busyUntil;

  function toggle() {
    const now = performance.now();
    if (now < busyUntil) {
      sound.ui(); // animação em andamento
      return;
    }
    isOpen.value = !isOpen.value;
    busyUntil = now + (isOpen.value ? OPEN_MS : CLOSE_MS);
    if (isOpen.value) sound.open();
    else sound.close();
  }

  // Guarda a carta no envelope (espera a animação atual terminar, se houver)
  function closeWhenReady() {
    if (!isOpen.value) return;
    const wait = busyUntil - performance.now();
    if (wait > 0) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isOpen.value) toggle();
      }, wait + 30);
    } else {
      toggle();
    }
  }

  onBeforeUnmount(() => clearTimeout(timer));

  return { isOpen, busy, toggle, closeWhenReady };
}
