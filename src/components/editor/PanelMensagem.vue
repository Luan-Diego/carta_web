<script setup>
import { t } from '../../i18n/index.js';
import { onMounted, ref } from 'vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { FONTES, FONTE_ARQ_MAX, FONTE_PROPRIA } from '../../config/options.js';
import { LIMITS } from '../../config/schema.js';
import { carregarFonte, lerFonte } from '../../lib/fonts.js';

const { form, totalChars } = useLetterDraft();
const erroFonte = ref('');

// as amostras mostram cada fonte; carregam ao abrir o painel
onMounted(() => FONTES.forEach((o) => carregarFonte(o.id)));

async function enviarFonte(e) {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  erroFonte.value = '';
  const r = await lerFonte(file, FONTE_ARQ_MAX);
  if (r.erro) {
    erroFonte.value = r.erro;
    return;
  }
  await carregarFonte('propria', r.src);
  form.fonteArq = r.src;
  form.fonte = 'propria';
}
</script>

<template>
  <div class="ed-panel">
    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">{{ t('Saudação') }}</span>
        <input v-model="form.saudacao" type="text" :maxlength="LIMITS.saudacao" :placeholder="t('Querido(a),')" />
      </label>
    </div>

    <div class="ed-group">
      <textarea v-model="form.mensagem" class="ed-area" rows="6" :aria-label="t('Mensagem')" :placeholder="t('Escreva sua mensagem…')"></textarea>
    </div>
    <p class="ed-foot">
      {{ t('Linha em branco = novo parágrafo · {n} caracteres. No papel cabem cerca de 400; o texto completo aparece ao tocar na carta aberta.', { n: totalChars }) }}
    </p>

    <h3 class="ed-sub">{{ t('Fonte') }}</h3>
    <div class="ed-tiles ed-tiles-sm">
      <label v-for="o in FONTES" :key="o.id" class="ed-tile">
        <input v-model="form.fonte" type="radio" name="fonte" :value="o.id" />
        <span class="ed-tile-body">
          <span class="ed-font-amostra" :style="o.familia ? { fontFamily: o.familia } : null">{{ t('Aa') }}</span>
          <span>{{ t(o.nome) }}</span>
        </span>
      </label>
      <label class="ed-tile ed-tile-btn" :class="{ on: form.fonte === 'propria' }">
        <input type="file" accept=".woff2,.woff,.ttf,.otf" :aria-label="t('Importar fonte')" @change="enviarFonte" />
        <span class="ed-tile-body">
          <span class="ed-font-amostra" :style="form.fonteArq ? { fontFamily: `'${FONTE_PROPRIA}'` } : null">{{ form.fonteArq ? 'Aa' : '＋' }}</span>
          <span>{{ t('Minha fonte') }}</span>
        </span>
      </label>
    </div>
    <p v-if="erroFonte" class="ed-error" role="alert">{{ t(erroFonte) }}</p>
    <p class="ed-foot">
      {{ t('As fontes do app vão embutidas no site e aparecem igual para quem recebe. Uma fonte importada (até {n} KB) viaja junto da carta, mas só cabe no link curto, e vale só para fontes que você pode compartilhar.', { n: Math.round(FONTE_ARQ_MAX / 1024) }) }}
    </p>

    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">{{ t('Assinatura') }}</span>
        <input v-model="form.assinatura" type="text" :maxlength="LIMITS.assinatura" :placeholder="t('Opcional')" />
      </label>
    </div>
  </div>
</template>
