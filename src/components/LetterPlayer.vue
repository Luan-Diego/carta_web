<script setup>
import { computed, ref } from 'vue';
import BackgroundLayer from './BackgroundLayer.vue';
import ControlBar from './ControlBar.vue';
import EnvelopeScene from './EnvelopeScene.vue';
import ReadingMode from './ReadingMode.vue';
import { useEnvelope } from '../composables/useEnvelope.js';
import { useSound } from '../composables/useSound.js';
import { themeVars, toneOf } from '../config/theme.js';
import '../styles/player.css';

// A carta completa: cena 3D + dica + barra de controles + modo leitura.
// Ocupa 100% do elemento pai, então serve para a página inteira e para a
// pré-visualização do editor.
const props = defineProps({
  config: { type: Object, required: true }, // configuração já validada (resolveConfig)
  compact: { type: Boolean, default: false }, // sem a dica de texto (pré-visualização do editor)
});

const sound = useSound();
const soundOn = sound.enabled;
const { isOpen, busy, toggle, closeWhenReady } = useEnvelope();

const scene = ref(null);
const auto = ref(false);
const reading = ref(false);

const hint = computed(() =>
  isOpen.value
    ? 'Toque na carta para ler · arraste para girar'
    : 'Toque no envelope para abrir · arraste para girar',
);

// toque no envelope: abre/fecha; toque no papel já aberto: modo leitura
function onTap({ onPaper }) {
  if (isOpen.value && onPaper && !busy()) openReader();
  else toggle();
}

function openReader() {
  sound.unlock();
  reading.value = true;
  sound.ui();
}

function closeReader() {
  reading.value = false;
  scene.value?.focus();
  sound.ui();
}

const onReadKey = () => {
  if (isOpen.value) openReader();
};

function toggleAuto() {
  sound.unlock();
  auto.value = !auto.value;
  sound.ui();
}

function onReset() {
  sound.unlock();
  if (auto.value) auto.value = false;
  scene.value?.resetView();
  if (isOpen.value) closeWhenReady();
  else sound.ui();
}

function toggleSound() {
  sound.unlock();
  sound.toggle();
  sound.ui();
}
</script>

<template>
  <div class="player" :style="themeVars(props.config)" :data-tone="toneOf(props.config)">
    <BackgroundLayer
      :tipo="config.visual.fundo"
      :imagem="config.visual.imagem"
      :dark="toneOf(props.config) === 'dark'"
    />
    <EnvelopeScene
      ref="scene"
      v-model:auto="auto"
      :letter="config.carta"
      :visual="config.visual"
      :open="isOpen"
      @tap="onTap"
      @toggle="toggle"
      @read="onReadKey"
    />

    <p v-if="!compact" class="hint" aria-live="polite">{{ hint }}</p>

    <ControlBar
      :auto="auto"
      :sound-on="soundOn"
      @toggle-auto="toggleAuto"
      @reset="onReset"
      @toggle-sound="toggleSound"
    />

    <ReadingMode :open="reading" :letter="config.carta" @close="closeReader" />
  </div>
</template>
