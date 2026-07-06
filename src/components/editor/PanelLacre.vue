<script setup>
import { computed, ref } from 'vue';
import SealMark from '../SealMark.vue';
import StickerPicker from './StickerPicker.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { useSealLibrary } from '../../composables/useImageLibrary.js';
import { ADESIVO_CATEGORIAS, LACRE_SIZE, LACRES } from '../../config/options.js';
import { LIMITS } from '../../config/schema.js';

const { form } = useLetterDraft();
const { items, remove } = useSealLibrary();

const aba = ref('app'); // 'app' | 'meus'
const categoria = ref('formas'); // 'formas' (desenhos do app) ou uma categoria de emojis
const picker = ref(false);
const emojis = computed(() => ADESIVO_CATEGORIAS.find((c) => c.id === categoria.value));

// escolher um tipo de lacre limpa os outros dois
function usarForma(id) {
  form.lacre = id;
  form.lacreEmoji = '';
  form.lacreImg = '';
}
function usarEmoji(e) {
  form.lacreEmoji = e;
  form.lacreImg = '';
}
function usarMeu(src) {
  form.lacreImg = src;
  form.lacreEmoji = '';
}
function excluir(i) {
  if (form.lacreImg === i.src) form.lacreImg = '';
  remove(i.id);
}
const formaAtiva = (id) => form.lacre === id && !form.lacreEmoji && !form.lacreImg;
</script>

<template>
  <!-- os desenhos usam a cor de lacre escolhida -->
  <div class="ed-panel" :style="{ '--heart-color': form.cores.lacre }">
    <div class="ed-seg" role="tablist">
      <button type="button" role="tab" :aria-selected="aba === 'app'" :class="{ on: aba === 'app' }" @click="aba = 'app'">Do app</button>
      <button type="button" role="tab" :aria-selected="aba === 'meus'" :class="{ on: aba === 'meus' }" @click="aba = 'meus'">Meus lacres</button>
    </div>

    <template v-if="aba === 'app'">
      <div class="ed-strip" role="tablist" aria-label="Categorias de lacres">
        <button type="button" role="tab" class="ed-cat" :class="{ on: categoria === 'formas' }" :aria-selected="categoria === 'formas'" title="Desenhos" @click="categoria = 'formas'">
          <span>💟</span>
        </button>
        <button v-for="c in ADESIVO_CATEGORIAS" :key="c.id" type="button" role="tab" class="ed-cat" :class="{ on: categoria === c.id }" :aria-selected="categoria === c.id" :title="c.nome" @click="categoria = c.id">
          <span>{{ c.icone }}</span>
        </button>
      </div>

      <div v-if="categoria === 'formas'" class="ed-tiles">
        <label v-for="o in LACRES" :key="o.id" class="ed-tile">
          <input type="radio" name="lacre" :value="o.id" :checked="formaAtiva(o.id)" @change="usarForma(o.id)" />
          <span class="ed-tile-body">
            <span class="pv pv-lacre">
              <SealMark :forma="o.id" :inicial="o.id === 'inicial' ? form.inicial || 'A' : ''" />
            </span>
            <span>{{ o.nome }}</span>
          </span>
        </label>
      </div>
      <template v-else>
        <h3 class="ed-sub">{{ emojis.nome }}</h3>
        <div class="ed-stickers" role="radiogroup" :aria-label="emojis.nome">
          <label v-for="e in emojis.itens" :key="e" class="ed-sticker">
            <input type="radio" name="lacre-emoji" :aria-label="e" :checked="form.lacreEmoji === e && !form.lacreImg" @change="usarEmoji(e)" />
            <span>{{ e }}</span>
          </label>
        </div>
      </template>

      <div v-if="categoria === 'formas' && form.lacre === 'inicial' && !form.lacreEmoji && !form.lacreImg" class="ed-group">
        <label class="ed-row">
          <span class="lbl">Letra(s)</span>
          <input v-model="form.inicial" type="text" :maxlength="LIMITS.inicial" placeholder="M" />
        </label>
      </div>
    </template>

    <template v-else>
      <ul class="ed-lib">
        <li>
          <button type="button" class="ed-thumb ed-add" aria-label="Adicionar lacre" @click="picker = true">＋</button>
        </li>
        <li v-for="i in items" :key="i.id">
          <button type="button" class="ed-thumb ed-thumb-sticker" :class="{ on: form.lacreImg === i.src }" :aria-pressed="form.lacreImg === i.src ? 'true' : 'false'" aria-label="Usar este lacre" @click="usarMeu(i.src)">
            <img :src="i.src" alt="" />
          </button>
          <button type="button" class="ed-thumb-x" aria-label="Excluir lacre" @click="excluir(i)">✕</button>
        </li>
      </ul>
      <p v-if="!items.length" class="ed-empty">Você ainda não tem lacres. Toque no ＋ para adicionar um PNG seu; ele fica guardado aqui, separado dos lacres do app.</p>
    </template>

    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">Tamanho</span>
        <input v-model.number="form.lacreTam" class="ed-range" type="range" :min="LACRE_SIZE.min" :max="LACRE_SIZE.max" step="5" aria-label="Tamanho do lacre" />
        <span class="ed-val">{{ form.lacreTam }}%</span>
      </label>
    </div>

    <StickerPicker :open="picker" tipo="lacre" @close="picker = false" @select="usarMeu" />
  </div>
</template>
