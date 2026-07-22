<script setup>
import { t } from '../../i18n/index.js';
import { computed } from 'vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { PALETAS } from '../../config/options.js';

// Cores só da carta: o fundo tem as suas próprias na aba Fundo.
const { form, paletaAtual, aplicarPaleta, padrao, restaurarCarta } = useLetterDraft();

const CAMPOS_COR = [
  ['envelope', 'Envelope'],
  ['papel', 'Papel'],
  ['texto', 'Texto'],
  ['lacre', 'Lacre'],
];

// cores de quando esta aba foi aberta (para "Desfazer")
const antes = CAMPOS_COR.map(([k]) => form.cores[k]);
const mudou = computed(() => CAMPOS_COR.some(([k], i) => form.cores[k] !== antes[i]));
const noPadrao = computed(() => CAMPOS_COR.every(([k]) => form.cores[k].toLowerCase() === padrao[k].toLowerCase()));
const desfazer = () => CAMPOS_COR.forEach(([k], i) => (form.cores[k] = antes[i]));
</script>

<template>
  <div class="ed-panel">
    <div class="ed-presets" role="group" :aria-label="t('Paletas prontas da carta')">
      <button
        v-for="p in PALETAS"
        :key="p.id"
        type="button"
        class="ed-preset"
        :class="{ on: paletaAtual === p.id }"
        :aria-pressed="paletaAtual === p.id ? 'true' : 'false'"
        @click="aplicarPaleta(p)"
      >
        <span class="ed-preset-pv" :style="{ background: p.cores.papel }">
          <i :style="{ background: p.cores.envelope }"><b :style="{ background: p.cores.lacre }"></b></i>
        </span>
        <span>{{ t(p.nome) }}</span>
      </button>
    </div>

    <div class="ed-swatches ed-swatches-4">
      <label v-for="[chave, nome] in CAMPOS_COR" :key="chave" class="ed-swatch">
        <span class="ed-dot" :style="{ background: form.cores[chave] }">
          <input v-model="form.cores[chave]" type="color" :aria-label="t(nome)" />
        </span>
        <span>{{ t(nome) }}</span>
      </label>
    </div>

    <div class="ed-group">
      <button type="button" class="ed-row ed-action" :disabled="!mudou" @click="desfazer">{{ t('Desfazer alterações') }}</button>
      <button type="button" class="ed-row ed-action" :disabled="noPadrao" @click="restaurarCarta">{{ t('Voltar ao padrão') }}</button>
    </div>
    <p class="ed-foot">{{ t('Estas cores mudam só a carta e o envelope. O fundo é escolhido na aba Fundo.') }}</p>
  </div>
</template>
