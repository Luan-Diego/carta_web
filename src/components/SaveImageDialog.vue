<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { gerarImagem, salvarImagem } from '../lib/exportImage.js';
import { t } from '../i18n/index.js';
import '../styles/save.css';

// "Salvar como imagem": gera um PNG do fundo + folha, mostra a prévia e salva
// (menu do aparelho no celular, download no computador).
const props = defineProps({
  open: { type: Boolean, default: false },
  letter: { type: Object, required: true },
  visual: { type: Object, required: true },
  cores: { type: Object, required: true },
  alvo: { type: Object, default: null }, // elemento dentro do .player (para achar o fundo e a fonte)
});
const emit = defineEmits(['close']);

const url = ref('');
const blob = ref(null);
const erro = ref(false);
const ocupado = ref(false);
const salvo = ref('');

function limpar() {
  if (url.value) URL.revokeObjectURL(url.value);
  url.value = '';
  blob.value = null;
}

watch(
  () => props.open,
  async (aberto) => {
    if (!aberto) return limpar();
    erro.value = false;
    salvo.value = '';
    ocupado.value = true;
    try {
      const player = props.alvo?.closest('.player');
      const b = await gerarImagem({
        letter: props.letter,
        visual: props.visual,
        cores: props.cores,
        largura: player?.clientWidth || window.innerWidth,
        altura: player?.clientHeight || window.innerHeight,
        fonte: props.alvo ? getComputedStyle(props.alvo).fontFamily : '',
        fundoCanvas: player?.querySelector('.bg-canvas:not([hidden])') || null,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      blob.value = b;
      url.value = URL.createObjectURL(b);
    } catch {
      erro.value = true;
    } finally {
      ocupado.value = false;
    }
  },
  { immediate: true },
);

async function salvar() {
  if (!blob.value) return;
  salvo.value = await salvarImagem(blob.value);
}
onBeforeUnmount(limpar);
</script>

<template>
  <div v-if="open" class="sv" role="dialog" aria-modal="true" :aria-label="t('saveTitle')" @click.self="emit('close')">
    <div class="sv-box">
      <h2 class="sv-titulo">{{ t('saveTitle') }}</h2>
      <div class="sv-prev">
        <img v-if="url" :src="url" alt="" />
        <p v-else-if="erro" class="sv-msg" role="alert">{{ t('saveError') }}</p>
        <p v-else class="sv-msg" role="status">{{ t('saveMaking') }}</p>
      </div>
      <p class="sv-dica">{{ t('saveHint') }}</p>
      <div class="sv-acoes">
        <button type="button" class="sv-btn sv-sec" @click="emit('close')">{{ t('saveClose') }}</button>
        <button type="button" class="sv-btn sv-main" :disabled="!blob || ocupado" @click="salvar">{{ t('saveDo') }}</button>
      </div>
    </div>
  </div>
</template>
