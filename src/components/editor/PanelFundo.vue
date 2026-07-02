<script setup>
import { computed, ref } from 'vue';
import ImagePicker from './ImagePicker.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { FUNDOS } from '../../config/options.js';

const { form, escolherFundo } = useLetterDraft();
const picker = ref(false);

const atual = computed(() => FUNDOS.find((o) => o.id === form.fundo));
const gradienteDe = (o) => (o.cores ? { background: `linear-gradient(135deg, ${o.cores[0]}, ${o.cores[1]})` } : null);

// as cores do fundo foram mexidas em relação às sugeridas pela cena atual?
const coresMudaram = computed(() => {
  const c = atual.value?.cores;
  return Boolean(c) && (form.cores.fundo1 !== c[0] || form.cores.fundo2 !== c[1]);
});

function usarImagem(src) {
  form.imagem = src;
  form.fundo = 'imagem';
}
</script>

<template>
  <div class="ed-panel">
    <div class="ed-tiles">
      <template v-for="o in FUNDOS" :key="o.id">
        <!-- "Minha imagem" abre a janela de imagens -->
        <button v-if="o.id === 'imagem'" type="button" class="ed-tile ed-tile-btn" :class="{ on: form.fundo === 'imagem' }" :aria-pressed="form.fundo === 'imagem' ? 'true' : 'false'" @click="picker = true">
          <span class="ed-tile-body">
            <span class="pv pv-fundo" :style="form.imagem ? { backgroundImage: `url(${form.imagem})` } : null">
              <span class="pv-icone">{{ o.icone }}</span>
            </span>
            <span>{{ o.nome }}</span>
          </span>
        </button>
        <label v-else class="ed-tile">
          <input type="radio" name="fundo" :value="o.id" :checked="form.fundo === o.id" @change="escolherFundo(o)" />
          <span class="ed-tile-body">
            <span class="pv pv-fundo" :style="gradienteDe(o)"><span class="pv-icone">{{ o.icone }}</span></span>
            <span>{{ o.nome }}</span>
          </span>
        </label>
      </template>
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
    <div v-else class="ed-group">
      <button type="button" class="ed-row ed-action" @click="picker = true">Trocar imagem</button>
    </div>

    <p v-if="form.fundo !== 'imagem' && form.fundo !== 'gradiente'" class="ed-foot">
      {{ atual.nome }}: passe o mouse ou o dedo por cima e toque para interagir.
    </p>

    <ImagePicker :open="picker" :atual="form.imagem" @close="picker = false" @select="usarImagem" />
  </div>
</template>
