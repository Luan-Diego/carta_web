<script setup>
import { computed } from 'vue';
import '../styles/background.css';

// Camada decorativa atrás do envelope (estrelas, pétalas, brilhos).
// Só CSS: nada de canvas, e sem sorteio, então a cena é igual a cada visita.
const props = defineProps({
  tipo: { type: String, default: 'gradiente' }, // gradiente = sem camada
});

const QUANTIDADE = { petalas: 16, brilhos: 18 };

const itens = computed(() =>
  Array.from({ length: QUANTIDADE[props.tipo] || 0 }, (_, i) => ({
    key: i,
    style: {
      '--x': `${(i * 37 + 11) % 100}%`,
      '--y': `${(i * 53 + 7) % 100}%`,
      '--d': `-${((i * 3.1) % 14).toFixed(1)}s`, // atraso negativo: já começa "no meio"
      '--t': `${9 + ((i * 7) % 6)}s`,
      '--s': `${10 + ((i * 5) % 11)}px`,
      '--r': `${(i * 47) % 360}deg`,
    },
  })),
);
</script>

<template>
  <div v-if="tipo !== 'gradiente'" class="fx" :class="`fx-${tipo}`" aria-hidden="true">
    <span v-for="item in itens" :key="item.key" :style="item.style"></span>
  </div>
</template>
