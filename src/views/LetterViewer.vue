<script setup>
import LetterPlayer from '../components/LetterPlayer.vue';

// Página da carta: só leitura. Quem recebe o link apenas abre e interage.
defineProps({
  config: { type: Object, required: true },
});
</script>

<template>
  <div class="viewer">
    <LetterPlayer :config="config" />
  </div>
</template>
