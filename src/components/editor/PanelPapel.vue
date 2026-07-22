<script setup>
import { t } from '../../i18n/index.js';
import { computed, ref } from 'vue';
import DecorPicker from './DecorPicker.vue';
import StickerPicker from './StickerPicker.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { useMarkLibrary } from '../../composables/useImageLibrary.js';
import { ADESIVO_CATEGORIAS, MARCA_OP, MARCA_TAM, TEXTURAS } from '../../config/options.js';

const { form } = useLetterDraft();
const { items, remove } = useMarkLibrary();

const parte = ref('marca'); // 'marca' | 'decor'
const aba = ref('app'); // marca d'água: 'app' | 'meus'
const categoria = ref('textura'); // 'textura' (papel) ou uma categoria de emojis
const picker = ref(false);
const emojis = computed(() => ADESIVO_CATEGORIAS.find((c) => c.id === categoria.value));
const temMarca = computed(() => Boolean(form.marcaEmoji || form.marcaImg));

// a marca é um emoji OU uma imagem própria
function usarEmoji(e) {
  form.marcaEmoji = e;
  form.marcaImg = '';
}
function usarMeu(src) {
  form.marcaImg = src;
  form.marcaEmoji = '';
}
function tirar() {
  form.marcaEmoji = '';
  form.marcaImg = '';
}
function excluir(i) {
  if (form.marcaImg === i.src) tirar();
  remove(i.id);
}
</script>

<template>
  <div class="ed-panel">
    <div class="ed-seg" role="tablist">
      <button type="button" role="tab" :aria-selected="parte === 'marca'" :class="{ on: parte === 'marca' }" @click="parte = 'marca'">{{ t('Marca d\'água') }}</button>
      <button type="button" role="tab" :aria-selected="parte === 'decor'" :class="{ on: parte === 'decor' }" @click="parte = 'decor'">{{ t('Decorações') }}</button>
    </div>

    <template v-if="parte === 'marca'">
      <div class="ed-seg ed-seg-sm" role="tablist">
        <button type="button" role="tab" :aria-selected="aba === 'app'" :class="{ on: aba === 'app' }" @click="aba = 'app'">{{ t('Do app') }}</button>
        <button type="button" role="tab" :aria-selected="aba === 'meus'" :class="{ on: aba === 'meus' }" @click="aba = 'meus'">{{ t('Minhas marcas d\'água') }}</button>
      </div>

      <template v-if="aba === 'app'">
        <div class="ed-strip" role="tablist" :aria-label="t('Categorias de marcas d\'água')">
          <button type="button" role="tab" class="ed-cat" :class="{ on: categoria === 'textura' }" :aria-selected="categoria === 'textura'" :title="t('Texturas')" @click="categoria = 'textura'"><span>📄</span></button>
          <button v-for="c in ADESIVO_CATEGORIAS" :key="c.id" type="button" role="tab" class="ed-cat" :class="{ on: categoria === c.id }" :aria-selected="categoria === c.id" :title="t(c.nome)" @click="categoria = c.id">
            <span>{{ c.icone }}</span>
          </button>
        </div>

        <div v-if="categoria === 'textura'" class="ed-tiles ed-tiles-sm" :style="{ '--paper': form.cores.papel, '--txt-color': form.cores.texto }">
          <label v-for="o in TEXTURAS" :key="o.id || 'lisa'" class="ed-tile">
            <input v-model="form.papelTextura" type="radio" name="textura" :value="o.id" />
            <span class="ed-tile-body">
              <span class="pv pv-papel"><i v-if="o.id" class="pd-textura" :class="`tx-${o.id}`"></i></span>
              <span>{{ t(o.nome) }}</span>
            </span>
          </label>
        </div>
        <div v-else class="ed-stickers" role="radiogroup" :aria-label="t(emojis.nome)">
          <label v-for="e in emojis.itens" :key="e" class="ed-sticker">
            <input type="radio" name="marca-emoji" :aria-label="e" :checked="form.marcaEmoji === e && !form.marcaImg" @change="usarEmoji(e)" />
            <span>{{ e }}</span>
          </label>
        </div>
      </template>

      <template v-else>
        <ul class="ed-lib">
          <li><button type="button" class="ed-thumb ed-add" :aria-label="t('Adicionar marca d\'água')" @click="picker = true">＋</button></li>
          <li v-for="i in items" :key="i.id">
            <button type="button" class="ed-thumb ed-thumb-sticker" :class="{ on: form.marcaImg === i.src }" :aria-pressed="form.marcaImg === i.src ? 'true' : 'false'" :aria-label="t('Usar esta marca d\'água')" @click="usarMeu(i.src)"><img :src="i.src" alt="" /></button>
            <button type="button" class="ed-thumb-x" :aria-label="t('Excluir marca d\'água')" @click="excluir(i)">✕</button>
          </li>
        </ul>
        <p v-if="!items.length" class="ed-empty">{{ t('Você ainda não tem marcas d\'água. Toque no ＋ para adicionar uma imagem sua (de preferência PNG com fundo transparente); ela fica guardada aqui, separada dos outros itens.') }}</p>
      </template>

      <div v-if="temMarca" class="ed-group">
        <label class="ed-row">
          <span class="lbl">{{ t('Opacidade') }}</span>
          <input v-model.number="form.marcaOp" class="ed-range" type="range" :min="MARCA_OP.min" :max="MARCA_OP.max" step="1" :aria-label="t('Opacidade da marca d\'água')" />
          <span class="ed-val">{{ form.marcaOp }}%</span>
        </label>
        <label class="ed-row">
          <span class="lbl">{{ t('Tamanho') }}</span>
          <input v-model.number="form.marcaTam" class="ed-range" type="range" :min="MARCA_TAM.min" :max="MARCA_TAM.max" step="5" :aria-label="t('Tamanho da marca d\'água')" />
          <span class="ed-val">{{ form.marcaTam }}%</span>
        </label>
        <button type="button" class="ed-row ed-action" @click="tirar">{{ t('Tirar marca d\'água') }}</button>
      </div>
      <p class="ed-foot">{{ t('A marca d\'água fica atrás do texto, sem atrapalhar a leitura.') }}</p>

      <StickerPicker :open="picker" tipo="marca" @close="picker = false" @select="usarMeu" />
    </template>

    <template v-else>
      <DecorPicker alvo="papel" />
    </template>
  </div>
</template>
