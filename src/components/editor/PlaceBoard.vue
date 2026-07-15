<script setup>
import { computed, ref } from 'vue';
import DecorLayer from '../DecorLayer.vue';
import LetterContent from '../LetterContent.vue';
import PaperMarks from '../PaperMarks.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { themeVars } from '../../config/theme.js';
import '../../styles/place.css';

// A superfície em plano (papel ou frente do envelope), grande, bem em cima da carta
// que se está editando. As decorações são arrastadas direto nela, com o dedo ou o mouse.
const props = defineProps({ alvo: { type: String, default: 'papel' } }); // 'papel' | 'env'
const { form, config, decorSel } = useLetterDraft();

const env = computed(() => props.alvo === 'env');
const itens = computed(() => (env.value ? form.envDecor : form.decor));
const board = ref(null);
let arrasto = null;

// borda de cima do "V" do envelope (em %): acima dela fica a aba
const vMin = (x) => 56.5 * (1 - Math.abs(x - 50) / 50);
const limitar = (v) => Math.min(100, Math.max(0, Math.round(v * 10) / 10));

function down(e, n) {
  const r = board.value.getBoundingClientRect();
  const d = itens.value[n];
  decorSel.value = n;
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
</script>

<template>
  <div class="pl-area">
    <div
      ref="board"
      class="pl-board"
      :class="{ 'pl-env': env }"
      :style="themeVars(config)"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
      @pointerdown.self="decorSel = -1"
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
      <DecorLayer editavel :itens="itens" :imgs="form.decorImgs" :sel="decorSel" @down="down" />
    </div>
  </div>
</template>
