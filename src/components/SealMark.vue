<script setup>
// Lacre do envelope. A cor vem do CSS (--heart-color); o texto da inicial é
// interpolado pelo Vue, então nunca é interpretado como HTML.
defineProps({
  forma: { type: String, default: 'coracao' }, // coracao | estrela | flor | inicial
  inicial: { type: String, default: '' },
});
</script>

<template>
  <svg viewBox="0 0 24 24">
    <path
      v-if="forma === 'coracao'"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
    <path
      v-else-if="forma === 'estrela'"
      d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5 6 20.9l1.3-6.7-5-4.7 6.8-.8z"
    />
    <g v-else-if="forma === 'flor'">
      <circle
        v-for="n in 5"
        :key="n"
        cx="12"
        cy="6.2"
        r="4.2"
        :transform="`rotate(${(n - 1) * 72} 12 12)`"
      />
      <circle class="selo-miolo" cx="12" cy="12" r="3.2" />
    </g>
    <g v-else>
      <circle cx="12" cy="12" r="10" />
      <text class="selo-texto" x="12" y="12" text-anchor="middle" dominant-baseline="central">
        {{ inicial.toUpperCase() }}
      </text>
    </g>
  </svg>
</template>
