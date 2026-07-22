<script setup>
import { t } from '../../i18n/index.js';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { LIMITS } from '../../config/schema.js';

const { form, link, linkError, copied, copy, linkCurto, curtoErro, curtoOcupado, curtoDias, gerarCurto, restaurar } = useLetterDraft();

async function copiarCurto() {
  try {
    await navigator.clipboard.writeText(linkCurto.value);
  } catch {
    /* sem permissão: o campo já está selecionável */
  }
}
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
          :placeholder="t('Gerando…')"
          :aria-label="t('Link da carta')"
          @focus="$event.target.select()"
        />
      </div>
    </div>
    <p v-if="linkError" class="ed-error" role="alert">{{ t(linkError) }}</p>

    <button type="button" class="ed-aqua" :disabled="!link" @click="copy">
      {{ t(copied ? 'Copiado ✓' : 'Copiar link') }}
    </button>
    <a v-if="link" class="ed-glassbtn" :href="link" target="_blank" rel="noopener">{{ t('Abrir carta') }}</a>
    <p v-if="link" class="ed-foot">
      {{ t('{n} caracteres. Quem abrir só vê a carta e não pode alterá-la. O rascunho fica salvo neste navegador.', { n: link.length }) }}
    </p>

    <h3 class="ed-sub">{{ t('Link curto') }}</h3>
    <p class="ed-foot">{{ t('Guarda a carta no servidor e gera um link pequeno, bom para enviar em apps de conversa.') }}</p>
    <div class="ed-seg ed-seg-sm" role="radiogroup" :aria-label="t('Validade do link curto')">
      <button v-for="d in [1, 7, 30]" :key="d" type="button" role="radio" :aria-checked="curtoDias === d" :class="{ on: curtoDias === d }" @click="curtoDias = d">
        {{ d }} {{ t(d === 1 ? 'dia' : 'dias') }}{{ d === 7 ? ' ★' : '' }}
      </button>
    </div>
    <p class="ed-foot">{{ t('Depois desse prazo a carta é apagada sozinha. Até 5 imagens próprias por carta.') }}</p>
    <button v-if="!linkCurto" type="button" class="ed-glassbtn" :disabled="curtoOcupado" @click="gerarCurto">{{ t(curtoOcupado ? 'Salvando…' : 'Gerar link curto') }}</button>
    <template v-else>
      <div class="ed-group">
        <div class="ed-row">
          <input class="ed-linkfield" type="text" readonly :value="linkCurto" :aria-label="t('Link curto da carta')" @focus="$event.target.select()" />
        </div>
      </div>
      <button type="button" class="ed-aqua" @click="copiarCurto">{{ t('Copiar link curto') }}</button>
    </template>
    <p v-if="curtoErro" class="ed-error" role="alert">{{ t(curtoErro) }}</p>

    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">{{ t('Título da aba') }}</span>
        <input v-model="form.titulo" type="text" :maxlength="LIMITS.titulo" />
      </label>
      <label class="ed-row">
        <span class="lbl">{{ t('Som ao abrir') }}</span>
        <span class="ed-switch">
          <input v-model="form.som" type="checkbox" role="switch" />
          <span></span>
        </span>
      </label>
      <button type="button" class="ed-row ed-danger" @click="restaurar">{{ t('Restaurar padrão') }}</button>
    </div>
  </div>
</template>
