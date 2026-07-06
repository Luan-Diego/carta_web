<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useSealLibrary, useStickerLibrary } from '../../composables/useImageLibrary.js';
import { STICKER_MAX_PX, comprimirAdesivo, lerImagem, recortar } from '../../lib/image.js';
import '../../styles/modal.css';

// Janela "Novo adesivo": escolhe um arquivo, informa o tamanho aceito e, se a
// imagem for maior, deixa escolher entre REDUZIR (imagem inteira) e CORTAR.
const props = defineProps({
  open: { type: Boolean, default: false },
  tipo: { type: String, default: 'adesivo' }, // 'adesivo' | 'lacre': decide a galeria e os textos
});
const emit = defineEmits(['close', 'select']);

const { add } = (props.tipo === 'lacre' ? useSealLibrary : useStickerLibrary)();
const NOME = props.tipo === 'lacre' ? { novo: 'Novo lacre', lista: 'meus lacres', o: 'O lacre' } : { novo: 'Novo adesivo', lista: 'meus adesivos', o: 'O adesivo' };
const PREVIA = 240;

const img = ref(null); // { bmp, w, h }
const modo = ref('reduzir'); // 'reduzir' | 'cortar'
const zoom = ref(1);
const cx = ref(0.5);
const cy = ref(0.5);
const erro = ref('');
const ocupado = ref(false);
const canvas = ref(null);
const dialog = ref(null);

const cabe = computed(() => img.value && Math.max(img.value.w, img.value.h) <= STICKER_MAX_PX);
const quadrada = computed(() => img.value && img.value.w === img.value.h);

function reiniciar() {
  img.value = null;
  modo.value = 'reduzir';
  zoom.value = 1;
  cx.value = cy.value = 0.5;
  erro.value = '';
  ocupado.value = false;
}

function fechar() {
  reiniciar();
  emit('close');
}

async function abrirArquivo(file) {
  erro.value = '';
  if (!file) return;
  const r = await lerImagem(file);
  if (r.erro) {
    erro.value = r.erro;
    return;
  }
  img.value = r;
  // imagem fora de proporção: o corte é o caminho natural; as demais, redução
  modo.value = 'reduzir';
  zoom.value = 1;
  cx.value = cy.value = 0.5;
  await nextTick();
  desenhar();
}

const onFile = (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  abrirArquivo(file);
};

function desenhar() {
  const el = canvas.value;
  if (!el || !img.value) return;
  const c = el.getContext('2d');
  c.clearRect(0, 0, PREVIA, PREVIA);
  const { bmp, w, h } = img.value;
  if (modo.value === 'cortar') {
    c.drawImage(recortar(bmp, w, h, cx.value, cy.value, zoom.value, PREVIA), 0, 0, PREVIA, PREVIA);
  } else {
    const k = PREVIA / Math.max(w, h);
    c.drawImage(bmp, (PREVIA - w * k) / 2, (PREVIA - h * k) / 2, w * k, h * k);
  }
}
watch([modo, zoom, cx, cy], () => nextTick(desenhar));
watch(
  () => canvas.value,
  () => nextTick(desenhar),
);

// arrastar a imagem no modo "cortar"
let arrasto = null;
function down(e) {
  if (modo.value !== 'cortar') return;
  arrasto = { x: e.clientX, y: e.clientY };
  e.currentTarget.setPointerCapture?.(e.pointerId);
}
function move(e) {
  if (!arrasto || !img.value) return;
  const { w, h } = img.value;
  const lado = Math.min(w, h) / zoom.value;
  cx.value = Math.min(1, Math.max(0, cx.value - ((e.clientX - arrasto.x) / PREVIA) * (lado / w)));
  cy.value = Math.min(1, Math.max(0, cy.value - ((e.clientY - arrasto.y) / PREVIA) * (lado / h)));
  arrasto = { x: e.clientX, y: e.clientY };
}
const up = () => { arrasto = null; };

function adicionar() {
  if (!img.value) return;
  ocupado.value = true;
  const { bmp, w, h } = img.value;
  let r;
  if (modo.value === 'cortar') {
    const cv = recortar(bmp, w, h, cx.value, cy.value, zoom.value, STICKER_MAX_PX * 2);
    r = comprimirAdesivo(cv, cv.width, cv.height);
  } else {
    r = comprimirAdesivo(bmp, w, h);
  }
  ocupado.value = false;
  if (r.erro) {
    erro.value = r.erro;
    return;
  }
  emit('select', add(r.dataUrl, 'arquivo').src);
  fechar();
}

watch(
  () => dialog.value,
  (el) => el?.focus(),
);
</script>

<template>
  <Teleport to=".ed">
    <Transition name="modal">
      <div v-if="open" class="ed-modal" @click.self="fechar" @keydown.esc.stop="fechar">
        <div ref="dialog" class="ed-dialog" role="dialog" aria-modal="true" :aria-label="NOME.novo" tabindex="-1">
          <header class="ed-dialog-head">
            <h2>{{ NOME.novo }}</h2>
            <button type="button" class="ed-done" @click="fechar">Cancelar</button>
          </header>

          <template v-if="!img">
            <label class="ed-drop" @dragover.prevent @drop.prevent="abrirArquivo($event.dataTransfer?.files?.[0])">
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="onFile" />
              <strong>Escolher uma imagem</strong>
              <small>ou arraste um arquivo até aqui</small>
            </label>
            <p class="ed-foot">
              {{ NOME.o }} é guardado em até {{ STICKER_MAX_PX }}×{{ STICKER_MAX_PX }} pixels, para caber no link. O ideal é um
              PNG quadrado com fundo transparente. Imagens maiores podem ser reduzidas ou cortadas aqui mesmo.
            </p>
          </template>

          <template v-else>
            <p class="ed-info">
              Sua imagem tem <strong>{{ img.w }}×{{ img.h }} px</strong>. O limite é de
              <strong>{{ STICKER_MAX_PX }}×{{ STICKER_MAX_PX }} px</strong>.
              <template v-if="cabe"> Ela já cabe, sem ajustes.</template>
            </p>

            <div v-if="!cabe" class="ed-seg" role="tablist">
              <button type="button" role="tab" :aria-selected="modo === 'reduzir'" :class="{ on: modo === 'reduzir' }" @click="modo = 'reduzir'">Reduzir</button>
              <button type="button" role="tab" :aria-selected="modo === 'cortar'" :class="{ on: modo === 'cortar' }" @click="modo = 'cortar'">Cortar</button>
            </div>
            <p v-if="!cabe" class="ed-foot">
              <template v-if="modo === 'reduzir'">Reduzir mantém a imagem inteira, só menor{{ quadrada ? '' : ' (continua com a mesma proporção)' }}.</template>
              <template v-else>Cortar usa só um pedaço quadrado: arraste a imagem e use o zoom para escolher a parte.</template>
            </p>

            <canvas ref="canvas" class="ed-crop" :class="{ mover: modo === 'cortar' }" :width="PREVIA" :height="PREVIA" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"></canvas>

            <div v-if="modo === 'cortar' && !cabe" class="ed-group">
              <label class="ed-row">
                <span class="lbl">Zoom</span>
                <input v-model.number="zoom" class="ed-range" type="range" min="1" max="4" step="0.05" aria-label="Zoom do corte" />
              </label>
            </div>

            <button type="button" class="ed-aqua" :disabled="ocupado" @click="adicionar">{{ ocupado ? 'Preparando…' : `Adicionar a ${NOME.lista}` }}</button>
            <button type="button" class="ed-glassbtn" @click="reiniciar">Escolher outra imagem</button>
          </template>
          <p v-if="erro" class="ed-error" role="alert">{{ erro }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
