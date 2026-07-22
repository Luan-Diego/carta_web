<script setup>
import { t } from '../../i18n/index.js';
import '../../styles/dock.css';

// Folha de vidro (como as folhas do iOS): abre sobre a dock com os controles de uma opção.
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
});
defineEmits(['close']);
</script>

<template>
  <div class="ed-sheet-wrap" :class="{ open }">
    <!-- fechada: "inert" tira o conteúdo do foco e dos leitores de tela -->
    <div class="ed-sheet-clip" :inert="open ? undefined : ''">
      <section class="ed-sheet" role="region" :aria-label="title">
        <header class="ed-sheet-head">
          <button class="ed-grab" type="button" :aria-label="t('Fechar')" @click="$emit('close')"><span></span></button>
          <h2>{{ title }}</h2>
          <button class="ed-done" type="button" @click="$emit('close')">{{ t('OK') }}</button>
        </header>
        <div class="ed-sheet-body"><slot /></div>
      </section>
    </div>
  </div>
</template>
