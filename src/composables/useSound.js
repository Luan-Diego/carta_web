import { ref } from 'vue';
import { createSound } from '../lib/sound.js';

// Um único motor de áudio para o site inteiro; só o estado "ligado" é reativo.
const engine = createSound();
const enabled = ref(engine.isEnabled());

export function useSound() {
  return {
    enabled,
    unlock: engine.unlock,
    ui: engine.ui,
    open: engine.open,
    close: engine.close,
    speed: engine.speed,
    applyDefault(v) {
      engine.applyDefault(v);
      enabled.value = engine.isEnabled();
    },
    toggle() {
      engine.setEnabled(!engine.isEnabled());
      enabled.value = engine.isEnabled();
    },
  };
}
