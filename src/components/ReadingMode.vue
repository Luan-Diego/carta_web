<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import LetterContent from './LetterContent.vue';
import '../styles/reader.css';

// Modo leitura: o texto completo em tela cheia, com rolagem.
const props = defineProps({
  open: { type: Boolean, default: false },
  letter: { type: Object, required: true },
});
const emit = defineEmits(['close']);

const card = ref(null);
const closeBtn = ref(null);

const onKey = (e) => {
  if (e.key === 'Escape') emit('close');
};

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      await nextTick();
      if (card.value) card.value.scrollTop = 0;
      closeBtn.value?.focus();
    } else {
      document.removeEventListener('keydown', onKey);
    }
  },
);

onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <div v-if="open" class="leitura" role="dialog" aria-modal="true" aria-label="Leitura da carta" @click.self="emit('close')">
    <button ref="closeBtn" class="leitura-fechar" type="button" aria-label="Fechar leitura" @click="emit('close')">&#10005;</button>
    <article ref="card" class="leitura-card" tabindex="-1">
      <LetterContent :letter="letter" />
    </article>
  </div>
</template>
