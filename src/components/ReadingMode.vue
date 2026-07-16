<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import DecorLayer from './DecorLayer.vue';
import { t } from '../i18n/index.js';
import LetterContent from './LetterContent.vue';
import PaperMarks from './PaperMarks.vue';
import SaveImageDialog from './SaveImageDialog.vue';
import '../styles/reader.css';

// Modo leitura: o texto completo em tela cheia, com rolagem.
const props = defineProps({
  open: { type: Boolean, default: false },
  letter: { type: Object, required: true },
  visual: { type: Object, default: () => ({ decor: [], decorImgs: [] }) },
  cores: { type: Object, default: () => ({ fundo1: '#f9f7f2', fundo2: '#e7e2d6', papel: '#fffefa', texto: '#3f3b33' }) },
});
const emit = defineEmits(['close']);

const card = ref(null);
const closeBtn = ref(null);
const salvando = ref(false); // janela "Salvar como imagem" aberta

const onKey = (e) => {
  if (e.key !== 'Escape') return;
  if (salvando.value) salvando.value = false;
  else emit('close');
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
      salvando.value = false;
    }
  },
);

onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <div v-if="open" class="leitura" role="dialog" aria-modal="true" :aria-label="t('reading')" @click.self="emit('close')">
    <button class="leitura-salvar" type="button" :aria-label="t('saveTitle')" @click="salvando = true">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" /></svg>
      <span>{{ t('save') }}</span>
    </button>
    <button ref="closeBtn" class="leitura-fechar" type="button" :aria-label="t('closeReading')" @click="emit('close')">&#10005;</button>
    <article ref="card" class="leitura-card" tabindex="-1">
      <div class="leitura-folha">
        <PaperMarks :visual="visual" />
        <div class="leitura-texto"><LetterContent :letter="letter" /></div>
        <DecorLayer :itens="visual.decor" :imgs="visual.decorImgs" />
      </div>
    </article>
    <SaveImageDialog :open="salvando" :letter="letter" :visual="visual" :cores="cores" :alvo="card" @close="salvando = false" />
  </div>
</template>
