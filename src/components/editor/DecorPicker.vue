<script setup>
import { computed, ref } from 'vue';
import DecorControls from './DecorControls.vue';
import StickerPicker from './StickerPicker.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { useStickerLibrary } from '../../composables/useImageLibrary.js';
import { ADESIVO_CATEGORIAS, DECOR_IMGS_MAX, DECOR_MAX } from '../../config/options.js';

// Escolhe o que colocar na carta: emojis do app ou "Meus adesivos".
// Tocar num item o acrescenta na mesa de posicionamento.
const props = defineProps({ alvo: { type: String, default: 'papel' } });
const { form, addDecor } = useLetterDraft();
const { items, remove } = useStickerLibrary();

const aba = ref('app');
const categoria = ref(ADESIVO_CATEGORIAS[0].id);
const picker = ref(false);
const aviso = ref('');
const atual = computed(() => ADESIVO_CATEGORIAS.find((c) => c.id === categoria.value));
const lista = computed(() => (props.alvo === 'env' ? form.envDecor : form.decor));

function adicionar(dado) {
  aviso.value = '';
  if (lista.value.length >= DECOR_MAX) aviso.value = `Limite de ${DECOR_MAX} decorações. Tire alguma para pôr outra.`;
  else if (addDecor(props.alvo, dado) < 0) aviso.value = `Você já usa ${DECOR_IMGS_MAX} imagens diferentes nas decorações. Tire uma para usar outra.`;
}
</script>

<template>
  <div class="ed-panel-in">
    <DecorControls :alvo="alvo" />
    <div class="ed-seg" role="tablist">
      <button type="button" role="tab" :aria-selected="aba === 'app'" :class="{ on: aba === 'app' }" @click="aba = 'app'">Do app</button>
      <button type="button" role="tab" :aria-selected="aba === 'meus'" :class="{ on: aba === 'meus' }" @click="aba = 'meus'">Meus adesivos</button>
    </div>

    <template v-if="aba === 'app'">
      <div class="ed-strip" role="tablist" aria-label="Categorias">
        <button v-for="c in ADESIVO_CATEGORIAS" :key="c.id" type="button" role="tab" class="ed-cat" :class="{ on: categoria === c.id }" :aria-selected="categoria === c.id" :title="c.nome" @click="categoria = c.id">
          <span>{{ c.icone }}</span>
        </button>
      </div>
      <div class="ed-stickers">
        <button v-for="e in atual.itens" :key="e" type="button" class="ed-sticker ed-sticker-btn" :aria-label="`Adicionar ${e}`" @click="adicionar({ e })">
          <span>{{ e }}</span>
        </button>
      </div>
    </template>
    <template v-else>
      <ul class="ed-lib">
        <li><button type="button" class="ed-thumb ed-add" aria-label="Adicionar adesivo" @click="picker = true">＋</button></li>
        <li v-for="i in items" :key="i.id">
          <button type="button" class="ed-thumb ed-thumb-sticker" aria-label="Adicionar este adesivo" @click="adicionar({ src: i.src })"><img :src="i.src" alt="" /></button>
          <button type="button" class="ed-thumb-x" aria-label="Excluir adesivo" @click="remove(i.id)">✕</button>
        </li>
      </ul>
      <p v-if="!items.length" class="ed-empty">Toque no ＋ para adicionar um PNG seu; ele fica guardado aqui.</p>
    </template>
    <p v-if="aviso" class="ed-foot" role="status">{{ aviso }}</p>

    <StickerPicker :open="picker" @close="picker = false" @select="(src) => adicionar({ src })" />
  </div>
</template>
