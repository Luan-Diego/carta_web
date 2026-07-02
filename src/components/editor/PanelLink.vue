<script setup>
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { LIMITS } from '../../config/schema.js';

const { form, link, linkError, copied, copy, restaurar } = useLetterDraft();
</script>

<template>
  <div class="ed-panel">
    <div class="ed-group">
      <div class="ed-row">
        <input
          class="ed-linkfield"
          type="text"
          readonly
          :value="link"
          placeholder="Gerando…"
          aria-label="Link da carta"
          @focus="$event.target.select()"
        />
      </div>
    </div>
    <p v-if="linkError" class="ed-error" role="alert">{{ linkError }}</p>

    <button type="button" class="ed-aqua" :disabled="!link" @click="copy">
      {{ copied ? 'Copiado ✓' : 'Copiar link' }}
    </button>
    <a v-if="link" class="ed-glassbtn" :href="link" target="_blank" rel="noopener">Abrir carta</a>
    <p v-if="link" class="ed-foot">
      {{ link.length }} caracteres. Quem abrir só vê a carta e não pode alterá-la. O rascunho fica salvo neste navegador.
    </p>

    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">Título da aba</span>
        <input v-model="form.titulo" type="text" :maxlength="LIMITS.titulo" />
      </label>
      <label class="ed-row">
        <span class="lbl">Som ao abrir</span>
        <span class="ed-switch">
          <input v-model="form.som" type="checkbox" role="switch" />
          <span></span>
        </span>
      </label>
      <button type="button" class="ed-row ed-danger" @click="restaurar">Restaurar padrão</button>
    </div>
  </div>
</template>
