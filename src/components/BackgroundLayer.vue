<script setup>
import { computed, ref, toRef } from 'vue';
import { useScene } from '../composables/useScene.js';
import { hasScene } from '../lib/scenes/index.js';
import '../styles/background.css';

// Fundo da carta, independente do envelope: degradê (cores do fundo) + uma cena
// animada e interativa em canvas, ou a imagem escolhida pelo usuário.
const props = defineProps({
  tipo: { type: String, default: 'gradiente' }, // id de FUNDOS (options.js)
  imagem: { type: String, default: '' }, // endereço https ou data URL
  dark: { type: Boolean, default: false }, // fundo escuro? (escolhe cores das luzes)
});

const canvas = ref(null);
const animado = computed(() => hasScene(props.tipo));
const comImagem = computed(() => props.tipo === 'imagem' && props.imagem);
useScene(canvas, toRef(props, 'tipo'), toRef(props, 'dark'));
</script>

<template>
  <div class="bg" aria-hidden="true">
    <img v-if="comImagem" class="bg-img" :src="imagem" alt="" decoding="async" referrerpolicy="no-referrer" />
    <canvas ref="canvas" class="bg-canvas" :hidden="!animado"></canvas>
  </div>
</template>
