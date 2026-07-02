<script setup>
// Lacre do envelope. A cor vem do CSS (--heart-color); o texto da inicial é
// interpolado pelo Vue, então nunca é interpretado como HTML.
defineProps({
  forma: { type: String, default: 'coracao' }, // um id de LACRES (options.js)
  inicial: { type: String, default: '' },
});

// formas feitas de um único caminho (viewBox 24x24)
const CAMINHOS = {
  coracao: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  estrela: 'M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5 6 20.9l1.3-6.7-5-4.7 6.8-.8z',
  lua: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  diamante: 'M7 3h10l4 6-9 12L3 9z',
  borboleta: 'M12 12C9.5 6 4.5 4.5 3.5 8s2.5 6 8.5 4zM12 12c2.5-6 7.5-7.5 8.5-4s-2.5 6-8.5 4zM12 12c-4.5 1-6.5 4-5 6.5s4.5-.5 5-6.5zM12 12c4.5 1 6.5 4 5 6.5s-4.5-.5-5-6.5z',
  raio: 'M13.5 2L4.5 14h6.5l-1 8 9.5-12.5H12.5z',
  musica: 'M19 3v12.5a3.2 3.2 0 1 1-2-2.9V7.2L10 8.6v9.9a3.2 3.2 0 1 1-2-2.9V5.2z',
  coroa: 'M3 18h18l1.5-11-5.5 4.5L12 4l-5 7.5L1.5 7z',
  gota: 'M12 2.5C12 2.5 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5z',
  folha: 'M20 4C9 4 4 9 4 15c0 1.5.5 3 1.5 4C7 14 11 11 16 9c-4 3-7 6-8 11 8 1 12-6 12-16z',
  escudo: 'M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z',
  nuvem: 'M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4.25 4.25 0 0 1 .5 8.5z',
  chama: 'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.2 1.5 1 2.5 2 2.5C11 8 11 5 12 2z',
};
</script>

<template>
  <svg viewBox="0 0 24 24">
    <path v-if="CAMINHOS[forma]" :d="CAMINHOS[forma]" />
    <g v-else-if="forma === 'flor'">
      <circle v-for="n in 5" :key="n" cx="12" cy="6.2" r="4.2" :transform="`rotate(${(n - 1) * 72} 12 12)`" />
      <circle class="selo-miolo" cx="12" cy="12" r="3.2" />
    </g>
    <g v-else-if="forma === 'trevo'">
      <circle cx="8.8" cy="8.8" r="3.8" />
      <circle cx="15.2" cy="8.8" r="3.8" />
      <circle cx="8.8" cy="15.2" r="3.8" />
      <circle cx="15.2" cy="15.2" r="3.8" />
      <circle class="selo-miolo" cx="12" cy="12" r="2" />
    </g>
    <g v-else-if="forma === 'sol'">
      <circle cx="12" cy="12" r="5" />
      <rect v-for="n in 8" :key="n" x="11" y="1.5" width="2" height="4.5" rx="1" :transform="`rotate(${(n - 1) * 45} 12 12)`" />
    </g>
    <g v-else-if="forma === 'floco'">
      <rect v-for="n in 3" :key="n" x="11" y="1.5" width="2" height="21" rx="1" :transform="`rotate(${(n - 1) * 60} 12 12)`" />
      <circle class="selo-miolo" cx="12" cy="12" r="3" />
    </g>
    <g v-else-if="forma === 'laco'">
      <path d="M12 12L3 6v12zM12 12l9-6v12z" />
      <circle class="selo-miolo" cx="12" cy="12" r="2.6" />
    </g>
    <g v-else-if="forma === 'patinha'">
      <ellipse cx="12" cy="15.5" rx="5.2" ry="4.2" />
      <circle cx="5.8" cy="10.5" r="2.1" />
      <circle cx="9.4" cy="6.4" r="2.3" />
      <circle cx="14.6" cy="6.4" r="2.3" />
      <circle cx="18.2" cy="10.5" r="2.1" />
    </g>
    <g v-else>
      <circle cx="12" cy="12" r="10" />
      <text class="selo-texto" x="12" y="12" text-anchor="middle" dominant-baseline="central">
        {{ inicial.toUpperCase() }}
      </text>
    </g>
  </svg>
</template>
