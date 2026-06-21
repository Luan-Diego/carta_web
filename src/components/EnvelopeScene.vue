<script setup>
import { onMounted, ref } from 'vue';
import LetterContent from './LetterContent.vue';
import { useFit } from '../composables/useFit.js';
import { useOrbit } from '../composables/useOrbit.js';
import { useSound } from '../composables/useSound.js';
import '../styles/scene.css';
import '../styles/envelope.css';

defineProps({
  letter: { type: Object, required: true }, // { saudacao, mensagem[], assinatura }
  open: { type: Boolean, default: false },
});
const auto = defineModel('auto', { type: Boolean, default: false }); // giro automático
const emit = defineEmits(['tap', 'toggle', 'read']);

const sound = useSound();
const stage = ref(null);
const orbitEl = ref(null);
const shadowEl = ref(null);

const fit = useFit(stage);
const { dragging, onPointerDown, onPointerMove, onPointerEnd, nudge, resetView, intro } = useOrbit({
  orbitEl,
  shadowEl,
  auto,
  onPress: sound.unlock,
  onSpeed: sound.speed,
  onTap: (info) => emit('tap', info),
});

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
      break;
    case 'l':
    case 'L':
      emit('read');
      break;
  }
}

onMounted(intro);

defineExpose({
  resetView,
  focus: () => stage.value?.focus({ preventScroll: true }),
});
</script>

<template>
  <div
    ref="stage"
    class="stage"
    :class="{ 'is-open': open, 'is-auto': auto, 'is-dragging': dragging }"
    :style="{ '--fit': fit }"
    tabindex="0"
    role="button"
    :aria-pressed="open ? 'true' : 'false'"
    aria-label="Envelope em 3D. Toque para abrir ou fechar. Arraste ou use as setas para girar."
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
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
                    <div class="texto"><LetterContent :letter="letter" /></div>
                  </div>
                  <div class="paper rear"></div>
                </div>
              </div>

              <!-- frente (bolso) do envelope -->
              <div class="face front-pocket">
                <i class="f-left"></i>
                <i class="f-right"></i>
                <i class="f-bottom"></i>
              </div>

              <!-- aba + lacre em coração -->
              <div class="flap">
                <div class="flap-face flap-out"></div>
                <div class="flap-face flap-in"></div>
                <div class="selo" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
