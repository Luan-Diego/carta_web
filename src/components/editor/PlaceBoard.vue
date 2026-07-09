<script setup>
import { computed, ref, watch } from 'vue';
import DecorLayer from '../DecorLayer.vue';
import LetterContent from '../LetterContent.vue';
import PaperMarks from '../PaperMarks.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { themeVars } from '../../config/theme.js';
import { DECOR_TAM } from '../../config/options.js';
import '../../styles/place.css';

// Mesa de posicionamento: mostra o papel (ou a frente do envelope) em plano,
// para arrastar as decorações com o dedo ou o mouse. Toque num item para ajustar.
const props = defineProps({ alvo: { type: String, default: 'papel' } }); // 'papel' | 'env'
const { form, config, removeDecor } = useLetterDraft();

const env = computed(() => props.alvo === 'env');
const itens = computed(() => (env.value ? form.envDecor : form.decor));
const sel = ref(-1);
const board = ref(null);
let arrasto = null;

// borda de cima do "V" do envelope (em %): acima dela fica a aba
const vMin = (x) => 56.5 * (1 - Math.abs(x - 50) / 50);
const limitar = (v) => Math.min(100, Math.max(0, Math.round(v * 10) / 10));

function down(e, n) {
  const r = board.value.getBoundingClientRect();
  const d = itens.value[n];
  sel.value = n;
  arrasto = { n, dx: d.x - ((e.clientX - r.left) / r.width) * 100, dy: d.y - ((e.clientY - r.top) / r.height) * 100 };
  e.currentTarget.setPointerCapture?.(e.pointerId);
}
function move(e) {
  if (!arrasto) return;
  const r = board.value.getBoundingClientRect();
  const d = itens.value[arrasto.n];
  if (!d) return;
  d.x = limitar(((e.clientX - r.left) / r.width) * 100 + arrasto.dx);
  const y = limitar(((e.clientY - r.top) / r.height) * 100 + arrasto.dy);
  d.y = env.value ? Math.max(y, Math.round(vMin(d.x) * 10) / 10 + 4) : y;
}
const up = () => {
  arrasto = null;
};
const tirar = () => {
  removeDecor(props.alvo, sel.value);
  sel.value = -1;
};

// item novo: já fica selecionado
watch(
  () => itens.value.length,
  (n, antes) => {
    if (n > antes) sel.value = n - 1;
    else if (sel.value >= n) sel.value = -1;
  },
);
const atual = computed(() => itens.value[sel.value]);
</script>

<template>
  <div class="pl-main" :class="{ 'pl-col': env }" :style="themeVars(config)">
    <div
      ref="board"
      class="pl-board"
      :class="{ 'pl-env': env }"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
      @pointerdown.self="sel = -1"
    >
      <template v-if="env">
        <i v-if="form.estampaImg" class="pl-fundo f-estampa f-estampa-img" :style="{ '--est-img': `url(${form.estampaImg})` }"></i>
        <i v-else-if="form.estampa" class="pl-fundo f-estampa" :class="`est-${form.estampa}`"></i>
        <i class="pl-aba"></i>
      </template>
      <template v-else>
        <PaperMarks :visual="form" />
        <div class="pl-texto"><LetterContent :letter="config.carta" /></div>
      </template>
      <DecorLayer editavel :itens="itens" :imgs="form.decorImgs" :sel="sel" @down="down" />
    </div>

    <div class="pl-ctl">
      <template v-if="atual">
        <label class="ed-row">
          <span class="lbl">Tamanho</span>
          <input v-model.number="atual.s" class="ed-range" type="range" :min="DECOR_TAM.min" :max="DECOR_TAM.max" step="1" aria-label="Tamanho da decoração" />
        </label>
        <label class="ed-row">
          <span class="lbl">Giro</span>
          <input v-model.number="atual.r" class="ed-range" type="range" min="-180" max="180" step="5" aria-label="Giro da decoração" />
        </label>
        <button type="button" class="ed-row ed-action" @click="tirar">Tirar esta decoração</button>
      </template>
      <p v-else class="pl-dica">
        {{ itens.length ? 'Arraste as decorações para onde quiser. Toque numa para mudar o tamanho e o giro.' : 'Escolha uma decoração abaixo: ela aparece aqui e você a arrasta para o lugar.' }}
      </p>
    </div>
  </div>
</template>
