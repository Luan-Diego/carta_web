<script setup>
import { ref } from 'vue';
import DecorPicker from './DecorPicker.vue';
import StickerPicker from './StickerPicker.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { ESTAMPAS, POSTAIS } from '../../config/options.js';
import { LIMITS } from '../../config/schema.js';
import { usePatternLibrary } from '../../composables/useImageLibrary.js';

const { form } = useLetterDraft();
const { items, remove } = usePatternLibrary();
const picker = ref(false);

// a estampa é do app OU uma imagem própria
const usarApp = (id) => {
  form.estampa = id;
  form.estampaImg = '';
};
const usarMeu = (src) => {
  form.estampaImg = src;
  form.estampa = '';
};
function excluir(i) {
  if (form.estampaImg === i.src) form.estampaImg = '';
  remove(i.id);
}
</script>

<template>
  <!-- as miniaturas de estampa usam as cores atuais do envelope e do lacre -->
  <div class="ed-panel" :style="{ '--env-cover': form.cores.envelope, '--heart-color': form.cores.lacre }">
    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">Dedicatória</span>
        <input v-model="form.para" type="text" :maxlength="LIMITS.para" placeholder="Para Maria" />
      </label>
    </div>

    <h3 class="ed-sub">Estampa</h3>
    <div class="ed-tiles ed-tiles-sm">
      <label v-for="o in ESTAMPAS" :key="o.id || 'lisa'" class="ed-tile">
        <input type="radio" name="estampa" :value="o.id" :checked="form.estampa === o.id && !form.estampaImg" @change="usarApp(o.id)" />
        <span class="ed-tile-body">
          <span class="pv pv-est"><i v-if="o.id" class="f-estampa" :class="`est-${o.id}`"></i></span>
          <span>{{ o.nome }}</span>
        </span>
      </label>
    </div>

    <h3 class="ed-sub">Minhas estampas</h3>
    <ul class="ed-lib">
      <li><button type="button" class="ed-thumb ed-add" aria-label="Adicionar estampa" @click="picker = true">＋</button></li>
      <li v-for="i in items" :key="i.id">
        <button type="button" class="ed-thumb ed-thumb-sticker" :class="{ on: form.estampaImg === i.src }" :aria-pressed="form.estampaImg === i.src ? 'true' : 'false'" aria-label="Usar esta estampa" @click="usarMeu(i.src)"><img :src="i.src" alt="" /></button>
        <button type="button" class="ed-thumb-x" aria-label="Excluir estampa" @click="excluir(i)">✕</button>
      </li>
    </ul>
    <p v-if="!items.length" class="ed-empty">Toque no ＋ para criar uma estampa com uma imagem sua; ela se repete na frente do envelope.</p>

    <h3 class="ed-sub">Selo postal</h3>
    <div class="ed-strip" role="radiogroup" aria-label="Selo postal">
      <label class="ed-sticker">
        <input v-model="form.postal" type="radio" name="postal" value="" aria-label="Sem selo" />
        <span>✕</span>
      </label>
      <label v-for="e in POSTAIS" :key="e" class="ed-sticker">
        <input v-model="form.postal" type="radio" name="postal" :value="e" :aria-label="e" />
        <span>{{ e }}</span>
      </label>
    </div>

    <h3 class="ed-sub">Adesivos soltos no envelope</h3>
    <DecorPicker alvo="env" />
    <p class="ed-foot">O adesivo único fica na aba Adesivo; aqui você pode colar vários e arrastar para onde quiser.</p>
    <StickerPicker :open="picker" tipo="estampa" @close="picker = false" @select="usarMeu" />
  </div>
</template>
