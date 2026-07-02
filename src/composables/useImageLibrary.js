import { ref } from 'vue';
import { safeImage } from '../config/schema.js';

// "Minhas imagens": fundos que o usuário já adicionou (endereços e fotos já
// reduzidas). Ficam salvas só neste navegador (localStorage).
const KEY = 'carta:imagens';
const MAX = 24;

function load() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list)
      ? list.filter((i) => i && typeof i.id === 'string' && safeImage(i.src)).slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

const items = ref(load());

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.value));
  } catch {
    /* sem espaço ou sem armazenamento: a lista vale só nesta aba */
  }
}

export function useImageLibrary() {
  return {
    items,
    // adiciona no começo (sem repetir) e devolve o item
    add(src, tipo) {
      const found = items.value.find((i) => i.src === src);
      if (found) return found;
      const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), src, tipo };
      items.value = [item, ...items.value].slice(0, MAX);
      save();
      return item;
    },
    remove(id) {
      items.value = items.value.filter((i) => i.id !== id);
      save();
    },
  };
}
