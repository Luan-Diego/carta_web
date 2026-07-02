<script setup>
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { LIMITS } from '../../config/schema.js';

const { form, totalChars } = useLetterDraft();
</script>

<template>
  <div class="ed-panel">
    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">Saudação</span>
        <input v-model="form.saudacao" type="text" :maxlength="LIMITS.saudacao" placeholder="Querido(a)," />
      </label>
    </div>

    <div class="ed-group">
      <textarea v-model="form.mensagem" class="ed-area" rows="6" aria-label="Mensagem" placeholder="Escreva sua mensagem…"></textarea>
    </div>
    <p class="ed-foot">
      Linha em branco = novo parágrafo · {{ totalChars }} caracteres. No papel cabem cerca de 400; o texto completo
      aparece ao tocar na carta aberta.
    </p>

    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">Assinatura</span>
        <input v-model="form.assinatura" type="text" :maxlength="LIMITS.assinatura" placeholder="Opcional" />
      </label>
    </div>
  </div>
</template>
