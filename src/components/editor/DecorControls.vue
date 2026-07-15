<script setup>
import { computed } from 'vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { DECOR_TAM } from '../../config/options.js';

// Ajustes da decoração selecionada na folha: tamanho, giro e remover.
const props = defineProps({ alvo: { type: String, default: 'papel' } });
const { form, decorSel, removeDecor } = useLetterDraft();
const lista = computed(() => (props.alvo === 'env' ? form.envDecor : form.decor));
const atual = computed(() => lista.value[decorSel.value]);
</script>

<template>
  <div v-if="atual" class="ed-group">
    <label class="ed-row">
      <span class="lbl">Tamanho</span>
      <input v-model.number="atual.s" class="ed-range" type="range" :min="DECOR_TAM.min" :max="DECOR_TAM.max" step="1" aria-label="Tamanho da decoração" />
    </label>
    <label class="ed-row">
      <span class="lbl">Giro</span>
      <input v-model.number="atual.r" class="ed-range" type="range" min="-180" max="180" step="5" aria-label="Giro da decoração" />
    </label>
    <button type="button" class="ed-row ed-action" @click="removeDecor(alvo, decorSel)">Tirar esta decoração</button>
  </div>
  <p v-else class="ed-foot">
    {{ lista.length ? 'Arraste as decorações na folha, em cima. Toque numa para mudar o tamanho e o giro.' : 'Toque numa decoração: ela aparece na folha, em cima, e você a arrasta para o lugar.' }}
  </p>
</template>
