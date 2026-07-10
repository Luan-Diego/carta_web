<script setup>
import { t } from '../i18n/index.js';
import '../styles/ui.css';

defineProps({
  auto: { type: Boolean, default: false },
  soundOn: { type: Boolean, default: true },
});
defineEmits(['toggle-auto', 'reset', 'toggle-sound', 'zoom-in', 'zoom-out']);
</script>

<template>
  <nav class="toolbar" :aria-label="t('controls')">
    <button
      class="tool btn-auto"
      type="button"
      :aria-pressed="auto ? 'true' : 'false'"
      :aria-label="auto ? t('autoOff') : t('autoOn')"
      :title="auto ? t('autoOff') : t('autoOn')"
      @click="$emit('toggle-auto')"
    >
      <svg viewBox="0 0 24 24">
        <g class="i-rot"><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v5h-5" /></g>
        <rect class="i-stop" x="7.5" y="7.5" width="9" height="9" rx="1.8" />
      </svg>
    </button>

    <button class="tool btn-zoom" type="button" :aria-label="t('zoomOut')" :title="t('zoomOut')" @click="$emit('zoom-out')">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20M8.5 11h5" /></svg>
    </button>
    <button class="tool btn-zoom" type="button" :aria-label="t('zoomIn')" :title="t('zoomIn')" @click="$emit('zoom-in')">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20M8.5 11h5M11 8.5v5" /></svg>
    </button>

    <button
      class="tool btn-reset"
      type="button"
      :aria-label="t('reset')"
      :title="t('reset')"
      @click="$emit('reset')"
    >
      <svg viewBox="0 0 24 24">
        <rect x="5" y="7" width="14" height="10" rx="1.5" />
        <path d="M5 8.5l7 5 7-5" />
      </svg>
    </button>

    <button
      class="tool btn-sound"
      type="button"
      :aria-pressed="soundOn ? 'true' : 'false'"
      :aria-label="t('sound')"
      :title="t('sound')"
      @click="$emit('toggle-sound')"
    >
      <svg viewBox="0 0 24 24">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
        <g class="waves"><path d="M15.5 9.2a4 4 0 0 1 0 5.6" /><path d="M18 6.8a7.5 7.5 0 0 1 0 10.4" /></g>
        <path class="slash" d="M16 9.5l5 5M21 9.5l-5 5" />
      </svg>
    </button>
  </nav>
</template>
