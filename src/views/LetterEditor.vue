<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import LetterPlayer from '../components/LetterPlayer.vue';
import GlassDock from '../components/editor/GlassDock.vue';
import GlassSheet from '../components/editor/GlassSheet.vue';
import PanelCores from '../components/editor/PanelCores.vue';
import PanelEnvelope from '../components/editor/PanelEnvelope.vue';
import PanelFundo from '../components/editor/PanelFundo.vue';
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

const SECOES = [
  { id: 'mensagem', nome: 'Mensagem', painel: PanelMensagem },
  { id: 'cores', nome: 'Cores', painel: PanelCores },
  { id: 'fundo', nome: 'Fundo', painel: PanelFundo },
  { id: 'lacre', nome: 'Lacre', painel: PanelLacre },
  { id: 'envelope', nome: 'Envelope', painel: PanelEnvelope },
  { id: 'link', nome: 'Link', painel: PanelLink },
];

const ativa = ref(null); // opção aberta (null = folha fechada)
const ultima = ref(SECOES[0]); // mantém o conteúdo enquanto a folha fecha

function selecionar(id) {
  if (ativa.value === id) {
    ativa.value = null;
    return;
  }
  ativa.value = id;
  ultima.value = SECOES.find((s) => s.id === id);
}

const fechar = () => (ativa.value = null);
const onKey = (e) => {
  if (e.key === 'Escape') fechar();
};

// bolhas decorativas (valores fixos: sem aleatoriedade, sem reatividade)
const BOLHAS = Array.from({ length: 10 }, (_, i) => ({
  key: i,
  style: {
    '--x': `${(i * 29 + 6) % 96}%`,
    '--s': `${22 + ((i * 17) % 60)}px`,
    '--t': `${16 + ((i * 5) % 12)}s`,
    '--d': `-${(i * 2.7).toFixed(1)}s`,
  },
}));

const sound = useSound();
onMounted(() => {
  sound.applyDefault(config.value.som);
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

const titulo = computed(() => ultima.value.nome);
</script>

<template>
  <div class="ed">
    <div class="ed-bubbles" aria-hidden="true">
      <span v-for="b in BOLHAS" :key="b.key" :style="b.style"></span>
    </div>

    <main class="ed-stage">
      <LetterPlayer :config="config" compact />
    </main>

    <div class="ed-bottom">
      <GlassSheet :open="ativa !== null" :title="titulo" @close="fechar">
        <Transition name="painel" mode="out-in">
          <component :is="ultima.painel" :key="ultima.id" />
        </Transition>
      </GlassSheet>
      <GlassDock :secoes="SECOES" :ativa="ativa" @select="selecionar" />
    </div>
  </div>
</template>
