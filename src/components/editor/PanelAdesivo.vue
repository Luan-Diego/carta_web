<script setup>
import { computed, ref } from 'vue';
import StickerPicker from './StickerPicker.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { useStickerLibrary } from '../../composables/useImageLibrary.js';
import { ADESIVO_CATEGORIAS, STICKER_SIZE } from '../../config/options.js';

const { form } = useLetterDraft();
const { items, remove } = useStickerLibrary();

const aba = ref('app'); // 'app' | 'meus'
const categoria = ref(ADESIVO_CATEGORIAS[0].id);
const picker = ref(false);
const atual = computed(() => ADESIVO_CATEGORIAS.find((c) => c.id === categoria.value));
const temAdesivo = computed(() => Boolean(form.adesivoImg || form.adesivo));

// escolher um do app troca o adesivo próprio e vice-versa
function usarEmoji(e) {
  form.adesivo = e;
  form.adesivoImg = '';
}
function usarMeu(src) {
  form.adesivoImg = src;
  form.adesivo = '';
}
function limpar() {
  form.adesivo = '';
  form.adesivoImg = '';
}
function excluir(i) {
  if (form.adesivoImg === i.src) limpar();
  remove(i.id);
}
</script>

<template>
  <div class="ed-panel">
    <div class="ed-seg" role="tablist">
      <button type="button" role="tab" :aria-selected="aba === 'app'" :class="{ on: aba === 'app' }" @click="aba = 'app'">Do app</button>
      <button type="button" role="tab" :aria-selected="aba === 'meus'" :class="{ on: aba === 'meus' }" @click="aba = 'meus'">Meus adesivos</button>
    </div>

    <template v-if="aba === 'app'">
      <div class="ed-strip" role="tablist" aria-label="Categorias de adesivos">
        <button
          v-for="c in ADESIVO_CATEGORIAS"
          :key="c.id"
          type="button"
          role="tab"
          class="ed-cat"
          :class="{ on: categoria === c.id }"
          :aria-selected="categoria === c.id"
          :title="c.nome"
          @click="categoria = c.id"
        >
          <span>{{ c.icone }}</span>
        </button>
      </div>
      <h3 class="ed-sub">{{ atual.nome }}</h3>
      <div class="ed-stickers" role="radiogroup" :aria-label="atual.nome">
        <label v-for="e in atual.itens" :key="e" class="ed-sticker">
          <input type="radio" name="adesivo" :aria-label="e" :checked="form.adesivo === e && !form.adesivoImg" @change="usarEmoji(e)" />
          <span>{{ e }}</span>
        </label>
      </div>
    </template>

    <template v-else>
      <ul class="ed-lib">
        <li>
          <button type="button" class="ed-thumb ed-add" aria-label="Adicionar adesivo" @click="picker = true">＋</button>
        </li>
        <li v-for="i in items" :key="i.id">
          <button
            type="button"
            class="ed-thumb ed-thumb-sticker"
            :class="{ on: form.adesivoImg === i.src }"
            :aria-pressed="form.adesivoImg === i.src ? 'true' : 'false'"
            aria-label="Usar este adesivo"
            @click="usarMeu(i.src)"
          >
            <img :src="i.src" alt="" />
          </button>
          <button type="button" class="ed-thumb-x" aria-label="Excluir adesivo" @click="excluir(i)">✕</button>
        </li>
      </ul>
      <p v-if="!items.length" class="ed-empty">Você ainda não tem adesivos. Toque no ＋ para adicionar um PNG seu; ele fica guardado aqui, separado dos adesivos do app.</p>
    </template>

    <div v-if="temAdesivo" class="ed-group">
      <label class="ed-row">
        <span class="lbl">Tamanho</span>
        <input v-model.number="form.adesivoTam" class="ed-range" type="range" :min="STICKER_SIZE.min" :max="STICKER_SIZE.max" step="5" aria-label="Tamanho do adesivo" />
        <span class="ed-val">{{ form.adesivoTam }}%</span>
      </label>
      <button type="button" class="ed-row ed-action" @click="limpar">Tirar adesivo do envelope</button>
    </div>

    <StickerPicker :open="picker" @close="picker = false" @select="usarMeu" />
  </div>
</template>
