<script setup>
import { onMounted, ref } from 'vue';
import DecorLayer from './DecorLayer.vue';
import LetterContent from './LetterContent.vue';
import PaperMarks from './PaperMarks.vue';
import SealMark from './SealMark.vue';
import { t } from '../i18n/index.js';
import { useFit } from '../composables/useFit.js';
import { useOrbit } from '../composables/useOrbit.js';
import { useSound } from '../composables/useSound.js';
import { useZoom } from '../composables/useZoom.js';
import '../styles/scene.css';
import '../styles/envelope.css';

defineProps({
  letter: { type: Object, required: true }, // { saudacao, mensagem[], assinatura }
  open: { type: Boolean, default: false },
  visual: { type: Object, required: true }, // { lacre, inicial, lacreEmoji, lacreImg, lacreTam, para, adesivo, adesivoImg, adesivoTam, estampa, postal }
});
const auto = defineModel('auto', { type: Boolean, default: false }); // giro automático
const emit = defineEmits(['tap', 'toggle', 'read']);

const sound = useSound();
const stage = ref(null);
const orbitEl = ref(null);
const shadowEl = ref(null);

const fit = useFit(stage);
const { zoom, zoomIn, zoomOut, resetZoom, pinching, recentPinch } = useZoom(stage);
const { dragging, onPointerDown, onPointerMove, onPointerEnd, nudge, resetView, intro } = useOrbit({
  orbitEl,
  shadowEl,
  auto,
  onPress: sound.unlock,
  onSpeed: sound.speed,
  onTap: (info) => emit('tap', info),
  canTap: () => !recentPinch(),
});

// durante a pinça (dois dedos) o envelope não gira
const mover = (e) => {
  if (!pinching()) onPointerMove(e);
};

function onKeydown(e) {
  sound.unlock();
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      emit('toggle');
      break;
    case 'ArrowLeft':
      e.preventDefault();
      nudge(0, -20);
      break;
    case 'ArrowRight':
      e.preventDefault();
      nudge(0, 20);
      break;
    case 'ArrowUp':
      e.preventDefault();
      nudge(12, 0);
      break;
    case 'ArrowDown':
      e.preventDefault();
      nudge(-12, 0);
      break;
    case 'Home':
      e.preventDefault();
      resetView();
      resetZoom();
      break;
    case '+':
    case '=':
      e.preventDefault();
      zoomIn();
      break;
    case '-':
    case '_':
      e.preventDefault();
      zoomOut();
      break;
    case '0':
      e.preventDefault();
      resetZoom();
      break;
    case 'l':
    case 'L':
      emit('read');
      break;
  }
}

onMounted(intro);

defineExpose({
  resetView: () => {
    resetView();
    resetZoom();
  },
  zoomIn,
  zoomOut,
  focus: () => stage.value?.focus({ preventScroll: true }),
});
</script>

<template>
  <div
    ref="stage"
    class="stage"
    :class="{ 'is-open': open, 'is-auto': auto, 'is-dragging': dragging }"
    :style="{ '--fit': fit, '--zoom': zoom }"
    tabindex="0"
    role="button"
    :aria-pressed="open ? 'true' : 'false'"
    :aria-label="t('stage')"
    @pointerdown="onPointerDown"
    @pointermove="mover"
    @pointerup="onPointerEnd"
    @pointercancel="onPointerEnd"
    @keydown="onKeydown"
  >
    <!-- sombra no "chão" (fica fora do 3D) -->
    <div ref="shadowEl" class="shadow" aria-hidden="true"><i></i></div>

    <div class="fit">
      <div class="lift">
        <div class="float">
          <div ref="orbitEl" class="orbit">
            <div class="envelope">
              <!-- verso e interior do envelope -->
              <div class="face back-in"></div>
              <div class="face back-out"></div>

              <!-- espessura (bordas laterais e inferior) -->
              <div class="edge edge-l"></div>
              <div class="edge edge-r"></div>
              <div class="edge edge-b"></div>

              <!-- carta -->
              <div class="carta">
                <div class="sheet">
                  <div class="paper front">
                    <PaperMarks :visual="visual" />
                    <div class="texto"><LetterContent :letter="letter" /></div>
                    <DecorLayer :itens="visual.decor" :imgs="visual.decorImgs" />
                  </div>
                  <div class="paper rear"></div>
                </div>
              </div>

              <!-- frente (bolso) do envelope -->
              <div class="face front-pocket">
                <i class="f-left"></i>
                <i class="f-right"></i>
                <i class="f-bottom"></i>
                <i v-if="visual.estampaImg" class="f-estampa f-estampa-img" :style="{ '--est-img': `url(${visual.estampaImg})` }" aria-hidden="true"></i>
                <i v-else-if="visual.estampa" class="f-estampa" :class="`est-${visual.estampa}`" aria-hidden="true"></i>
                <div v-if="visual.postal" class="selo-postal" aria-hidden="true">{{ visual.postal }}</div>
                <div v-if="visual.para" class="dedicatoria" :class="{ 'com-postal': visual.postal }">{{ visual.para }}</div>
                <img
                  v-if="visual.adesivoImg"
                  class="adesivo adesivo-img"
                  :src="visual.adesivoImg"
                  :style="{ '--ad-size': visual.adesivoTam / 100 }"
                  alt=""
                  draggable="false"
                />
                <div
                  v-else-if="visual.adesivo"
                  class="adesivo"
                  :style="{ '--ad-size': visual.adesivoTam / 100 }"
                  aria-hidden="true"
                >
                  {{ visual.adesivo }}
                </div>
                <DecorLayer :itens="visual.envDecor" :imgs="visual.decorImgs" />
              </div>

              <!-- aba + lacre em coração -->
              <div class="flap">
                <div class="flap-face flap-out"></div>
                <div class="flap-face flap-in"></div>
                <div class="selo" :style="{ '--lacre-size': visual.lacreTam / 100 }" aria-hidden="true">
                  <img v-if="visual.lacreImg" class="selo-img" :src="visual.lacreImg" alt="" draggable="false" />
                  <span v-else-if="visual.lacreEmoji" class="selo-emoji">{{ visual.lacreEmoji }}</span>
                  <SealMark v-else :forma="visual.lacre" :inicial="visual.inicial" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
