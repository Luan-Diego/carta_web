<script setup>
import '../styles/decor.css';
// Textura e marca d'água do papel. Fica ATRÁS do texto e é só decoração.
defineProps({
  visual: { type: Object, required: true }, // { papelTextura, marcaEmoji, marcaImg, marcaOp, marcaTam }
});
</script>

<template>
  <div v-if="visual.papelTextura || visual.marcaEmoji || visual.marcaImg" class="pd-camada pd-marcas" aria-hidden="true">
    <i v-if="visual.papelTextura" class="pd-textura" :class="`tx-${visual.papelTextura}`"></i>
    <img v-if="visual.marcaImg" class="pd-marca" :src="visual.marcaImg" :style="{ '--op': visual.marcaOp / 100, '--w': visual.marcaTam }" alt="" draggable="false" />
    <span v-else-if="visual.marcaEmoji" class="pd-marca pd-marca-emoji" :style="{ '--op': visual.marcaOp / 100, '--w': visual.marcaTam }">{{ visual.marcaEmoji }}</span>
  </div>
</template>
