<script setup>
// Texto da carta. Usa interpolação do Vue ({{ }}), que escapa o conteúdo:
// o texto nunca é interpretado como HTML.
defineProps({
  letter: { type: Object, required: true }, // { saudacao, mensagem[], assinatura }
});
</script>

<template>
  <strong v-if="letter.saudacao">{{ letter.saudacao }}</strong>
  <p v-for="(texto, i) in letter.mensagem" :key="i">{{ texto }}</p>
  <p v-if="letter.assinatura" class="assinatura">{{ letter.assinatura }}</p>
</template>
