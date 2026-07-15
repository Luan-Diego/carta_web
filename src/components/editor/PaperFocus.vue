<script setup>
import PlaceBoard from './PlaceBoard.vue';

// Camada do editor que traz a folha (ou a frente do envelope) para a frente,
// em plano e grande, enquanto a aba Papel ou Capa está aberta.
defineProps({
  open: { type: Boolean, default: false },
  alvo: { type: String, default: 'papel' },
});
</script>

<template>
  <Transition name="foco">
    <div v-if="open" class="ed-foco">
      <PlaceBoard :key="alvo" :alvo="alvo" />
    </div>
  </Transition>
</template>
