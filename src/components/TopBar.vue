<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from '../i18n/index.js';
import '../styles/topbar.css';

// Canto superior direito: "Criar a minha carta" (só para quem recebe) e o idioma.
defineProps({ criar: { type: Boolean, default: false } });
const { t, locale, setLocale, idiomas } = useI18n();

const aberto = ref(false);
const raiz = ref(null);
const escolher = (code) => {
  setLocale(code);
  aberto.value = false;
};
const fora = (e) => {
  if (aberto.value && !raiz.value?.contains(e.target)) aberto.value = false;
};
const tecla = (e) => {
  if (e.key === 'Escape') aberto.value = false;
};
onMounted(() => {
  document.addEventListener('pointerdown', fora);
  document.addEventListener('keydown', tecla);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', fora);
  document.removeEventListener('keydown', tecla);
});
</script>

<template>
  <div ref="raiz" class="topbar" @pointerdown.stop>
    <a v-if="criar" class="tb-pill tb-criar" href="criar/">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      <span>{{ t('create') }}</span>
    </a>

    <div class="tb-lang">
      <button type="button" class="tb-pill tb-btn" :aria-label="t('language')" :title="t('language')" aria-haspopup="listbox" :aria-expanded="aberto ? 'true' : 'false'" @click="aberto = !aberto">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.200 6.100-3.800 8.500M12 3.5C9.400 5.900 8.200 8.800 8.200 12s1.200 6.100 3.800 8.500" /></svg>
        <span class="tb-code">{{ locale.toUpperCase() }}</span>
      </button>
      <Transition name="tb-menu">
        <ul v-if="aberto" class="tb-menu" role="listbox" :aria-label="t('language')">
          <li v-for="i in idiomas" :key="i.code" role="option" :aria-selected="i.code === locale ? 'true' : 'false'">
            <button type="button" :lang="i.code" :class="{ on: i.code === locale }" @click="escolher(i.code)">{{ i.nome }}</button>
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>
