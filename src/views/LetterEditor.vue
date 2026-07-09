<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import LetterPlayer from '../components/LetterPlayer.vue';
import GlassDock from '../components/editor/GlassDock.vue';
import GlassSheet from '../components/editor/GlassSheet.vue';
import PanelCores from '../components/editor/PanelCores.vue';
import PanelAdesivo from '../components/editor/PanelAdesivo.vue';
import PanelEnvelope from '../components/editor/PanelEnvelope.vue';
import PanelFundo from '../components/editor/PanelFundo.vue';
import PanelPapel from '../components/editor/PanelPapel.vue';
import PanelLacre from '../components/editor/PanelLacre.vue';
import PanelLink from '../components/editor/PanelLink.vue';
import PanelMensagem from '../components/editor/PanelMensagem.vue';
import { provideLetterDraft } from '../composables/useLetterDraft.js';
import { useSound } from '../composables/useSound.js';
import '../styles/controls.css';
import '../styles/previews.css';

// Editor: a carta ao vivo dentro de um "aquário" de vidro e, embaixo, uma dock
// com uma opção por personalização. Cada opção abre uma folha só com os seus controles.
const { config } = provideLetterDraft();
const sound = useSound();

const SECOES = [
  { id: 'mensagem', nome: 'Mensagem', curto: 'Texto', painel: PanelMensagem },
  { id: 'cores', nome: 'Cores', painel: PanelCores },
  { id: 'fundo', nome: 'Fundo', painel: PanelFundo },
  { id: 'lacre', nome: 'Lacre', painel: PanelLacre },
  { id: 'papel', nome: 'Papel', painel: PanelPapel },
  { id: 'envelope', nome: 'Envelope', curto: 'Capa', painel: PanelEnvelope },
  { id: 'adesivo', nome: 'Adesivo', painel: PanelAdesivo },
  { id: 'link', nome: 'Link', painel: PanelLink },
];

const raiz = ref(null);
const baixo = ref(null);
let observador = null;

const ativa = ref(null); // opção aberta (null = folha fechada)
const ultima = ref(SECOES[0]); // mantém o conteúdo enquanto a folha fecha

function selecionar(id) {
  sound.unlock();
  sound.drop();
  if (ativa.value === id) {
    ativa.value = null;
    return;
  }
  ativa.value = id;
  ultima.value = SECOES.find((s) => s.id === id);
}

const fechar = () => {
  if (ativa.value === null) return;
  sound.drop();
  ativa.value = null;
};
const onKey = (e) => {
  if (e.key === 'Escape') fechar();
};

onMounted(() => {
  // a carta só ocupa o espaço acima dos ícones e da folha (nada a cobre)
  if (typeof ResizeObserver !== 'undefined' && baixo.value) {
    observador = new ResizeObserver(() => raiz.value?.style.setProperty('--ed-bottom', `${baixo.value.offsetHeight}px`));
    observador.observe(baixo.value);
  }
  sound.applyDefault(config.value.som);
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  observador?.disconnect();
});

const titulo = computed(() => ultima.value.nome);
</script>

<template>
  <div ref="raiz" class="ed">
    <main class="ed-stage">
      <LetterPlayer :config="config" compact />
    </main>

    <div ref="baixo" class="ed-bottom">
      <GlassSheet :open="ativa !== null" :title="titulo" @close="fechar">
        <Transition name="painel" mode="out-in">
          <component :is="ultima.painel" :key="ultima.id" />
        </Transition>
      </GlassSheet>
      <GlassDock :secoes="SECOES" :ativa="ativa" @select="selecionar" />
    </div>
  </div>
</template>
