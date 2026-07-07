<script setup>
import { computed, ref } from 'vue';
import ImagePicker from './ImagePicker.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { useImageLibrary } from '../../composables/useImageLibrary.js';
import { FUNDOS } from '../../config/options.js';

const { form, escolherFundo } = useLetterDraft();
const { items, remove } = useImageLibrary();
const picker = ref(false);
const aba = ref(form.fundo === 'imagem' ? 'meus' : 'app'); // 'app' | 'meus'

const doApp = FUNDOS.filter((o) => o.id !== 'imagem');
const atual = computed(() => FUNDOS.find((o) => o.id === form.fundo));
const gradienteDe = (o) => (o.cores ? { background: `linear-gradient(135deg, ${o.cores[0]}, ${o.cores[1]})` } : null);

// as cores do fundo foram mexidas em relação às sugeridas pela cena atual?
const coresMudaram = computed(() => {
  const c = atual.value?.cores;
  return Boolean(c) && (form.cores.fundo1 !== c[0] || form.cores.fundo2 !== c[1]);
});

const emUso = (src) => form.fundo === 'imagem' && form.imagem === src;
function usarImagem(src) {
  form.imagem = src;
  form.fundo = 'imagem';
}
function excluir(i) {
  if (form.imagem === i.src) {
    form.imagem = '';
    if (form.fundo === 'imagem') escolherFundo(FUNDOS.find((o) => o.id === 'gradiente'));
  }
  remove(i.id);
}
</script>

<template>
  <div class="ed-panel">
    <div class="ed-seg" role="tablist">
      <button type="button" role="tab" :aria-selected="aba === 'app'" :class="{ on: aba === 'app' }" @click="aba = 'app'">Do app</button>
      <button type="button" role="tab" :aria-selected="aba === 'meus'" :class="{ on: aba === 'meus' }" @click="aba = 'meus'">Minhas imagens</button>
    </div>

    <template v-if="aba === 'app'">
      <div class="ed-tiles">
        <label v-for="o in doApp" :key="o.id" class="ed-tile">
          <input type="radio" name="fundo" :value="o.id" :checked="form.fundo === o.id" @change="escolherFundo(o)" />
          <span class="ed-tile-body">
            <span class="pv pv-fundo" :style="gradienteDe(o)"><span class="pv-icone">{{ o.icone }}</span></span>
            <span>{{ o.nome }}</span>
          </span>
        </label>
      </div>

      <!-- cor da animação (matiz) para os fundos que aceitam -->
      <div v-if="atual?.cor" class="ed-group">
        <label class="ed-row">
          <span class="lbl">Cor da animação</span>
          <input
            class="ed-range ed-hue"
            type="range"
            min="0"
            max="359"
            :value="form.matiz < 0 ? 0 : form.matiz"
            aria-label="Cor da animação"
            @input="form.matiz = Number($event.target.value)"
          />
        </label>
        <button v-if="form.matiz >= 0" type="button" class="ed-row ed-action" @click="form.matiz = -1">Voltar às cores originais</button>
      </div>

      <!-- cores do fundo (não afetam a carta) -->
      <div v-if="form.fundo !== 'imagem'" class="ed-group">
        <label class="ed-row">
          <span class="lbl">Cor do centro</span>
          <span class="ed-chip" :style="{ background: form.cores.fundo1 }"><input v-model="form.cores.fundo1" type="color" aria-label="Cor do centro do fundo" /></span>
        </label>
        <label class="ed-row">
          <span class="lbl">Cor das bordas</span>
          <span class="ed-chip" :style="{ background: form.cores.fundo2 }"><input v-model="form.cores.fundo2" type="color" aria-label="Cor das bordas do fundo" /></span>
        </label>
        <button v-if="coresMudaram" type="button" class="ed-row ed-action" @click="escolherFundo(atual)">Voltar às cores deste fundo</button>
      </div>

      <p v-if="form.fundo !== 'imagem' && form.fundo !== 'gradiente'" class="ed-foot">
        {{ atual.nome }}: passe o mouse ou o dedo por cima e toque para interagir.
      </p>
    </template>

    <template v-else>
      <ul class="ed-lib">
        <li>
          <button type="button" class="ed-thumb ed-add" aria-label="Adicionar imagem (do computador ou por endereço)" @click="picker = true">＋</button>
        </li>
        <li v-for="i in items" :key="i.id">
          <button
            type="button"
            class="ed-thumb"
            :class="{ on: emUso(i.src) }"
            :style="{ backgroundImage: `url(${i.src})` }"
            :aria-pressed="emUso(i.src) ? 'true' : 'false'"
            aria-label="Usar esta imagem como fundo"
            @click="usarImagem(i.src)"
          ></button>
          <button type="button" class="ed-thumb-x" aria-label="Excluir imagem" @click="excluir(i)">✕</button>
        </li>
      </ul>
      <p v-if="!items.length" class="ed-empty">Você ainda não tem imagens. Toque no ＋ para escolher uma foto do computador ou colar o endereço (URL) de uma imagem; ela fica guardada aqui, separada dos fundos do app.</p>
      <p v-else class="ed-foot">Toque em uma imagem para usá-la como fundo. O ＋ adiciona outra, do computador ou por endereço.</p>
    </template>

    <ImagePicker :open="picker" :atual="form.imagem" @close="picker = false" @select="usarImagem" />
  </div>
</template>
