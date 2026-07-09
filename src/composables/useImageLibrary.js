import { ref } from 'vue';
import { safeImage } from '../config/schema.js';

// Galerias do usuário, guardadas só neste navegador (localStorage):
// "Minhas imagens" (fundos) e "Meus adesivos". As imagens já vêm reduzidas.
function criarGaleria(chave, max, opcoes) {
  const carregar = () => {
    try {
      const lista = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(lista) ? lista.filter((i) => i && typeof i.id === 'string' && safeImage(i.src, opcoes)).slice(0, max) : [];
    } catch {
      return [];
    }
  };
  const items = ref(carregar());
  const salvar = () => {
    try {
      localStorage.setItem(chave, JSON.stringify(items.value));
    } catch {
      /* sem espaço ou sem armazenamento: a lista vale só nesta aba */
    }
  };
  return () => ({
    items,
    // adiciona no começo (sem repetir) e devolve o item
    add(src, tipo) {
      const achada = items.value.find((i) => i.src === src);
      if (achada) return achada;
      const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), src, tipo };
      items.value = [item, ...items.value].slice(0, max);
      salvar();
      return item;
    },
    remove(id) {
      items.value = items.value.filter((i) => i.id !== id);
      salvar();
    },
  });
}

export const useImageLibrary = criarGaleria('carta:imagens', 24, {});
export const useSealLibrary = criarGaleria('carta:lacres', 40, { url: false });
export const useStickerLibrary = criarGaleria('carta:adesivos', 40, { url: false });
export const useMarkLibrary = criarGaleria('carta:marcas', 24, { url: false });
export const usePatternLibrary = criarGaleria('carta:estampas', 24, { url: false });
