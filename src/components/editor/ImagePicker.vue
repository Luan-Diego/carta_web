<script setup>
import { nextTick, ref, watch } from 'vue';
import { useImageLibrary } from '../../composables/useImageLibrary.js';
import { LIMITS, safeImage } from '../../config/schema.js';
import { toBackground } from '../../lib/image.js';
import '../../styles/modal.css';

// Janela "Minha imagem": adicionar por endereço ou do computador e escolher entre
// as imagens já adicionadas.
const props = defineProps({
  open: { type: Boolean, default: false },
  atual: { type: String, default: '' }, // imagem em uso
});
const emit = defineEmits(['close', 'select']);

const { items, add, remove } = useImageLibrary();
const aba = ref('arquivo'); // 'arquivo' | 'url'
const url = ref('');
const erro = ref('');
const ocupado = ref(false);
const dialog = ref(null);

watch(
  () => props.open,
  async (v) => {
    if (!v) return;
    erro.value = '';
    url.value = '';
    await nextTick();
    dialog.value?.focus();
  },
);

const escolher = (src) => emit('select', src);

async function doArquivo(file) {
  erro.value = '';
  if (!file) return;
  ocupado.value = true;
  const r = await toBackground(file);
  ocupado.value = false;
  if (r.erro) {
    erro.value = r.erro;
    return;
  }
  escolher(add(r.dataUrl, 'arquivo').src);
}

function onFile(e) {
  const file = e.target.files?.[0];
  e.target.value = '';
  doArquivo(file);
}

function onDrop(e) {
  doArquivo(e.dataTransfer?.files?.[0]);
}

// confere se o endereço realmente carrega como imagem antes de aceitar
function testar(src) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 7000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.referrerPolicy = 'no-referrer';
    img.src = src;
  });
}

async function usarUrl() {
  erro.value = '';
  const src = safeImage(url.value.trim(), { data: false });
  if (!src) {
    erro.value = 'Cole um endereço que comece com https:// e não tenha espaços.';
    return;
  }
  ocupado.value = true;
  const ok = await testar(src);
  ocupado.value = false;
  if (!ok) {
    erro.value = 'Não consegui carregar essa imagem. Confira o endereço (alguns sites bloqueiam o uso em outras páginas).';
    return;
  }
  escolher(add(src, 'url').src);
  url.value = '';
}
</script>

<template>
  <Teleport to=".ed">
    <Transition name="modal">
      <div v-if="open" class="ed-modal" @click.self="emit('close')" @keydown.esc.stop="emit('close')">
        <div ref="dialog" class="ed-dialog" role="dialog" aria-modal="true" aria-label="Minha imagem" tabindex="-1">
          <header class="ed-dialog-head">
            <h2>Minha imagem</h2>
            <button type="button" class="ed-done" @click="emit('close')">OK</button>
          </header>

          <div class="ed-seg" role="tablist">
            <button type="button" role="tab" :aria-selected="aba === 'arquivo'" :class="{ on: aba === 'arquivo' }" @click="aba = 'arquivo'">Do computador</button>
            <button type="button" role="tab" :aria-selected="aba === 'url'" :class="{ on: aba === 'url' }" @click="aba = 'url'">Endereço (URL)</button>
          </div>

          <label v-if="aba === 'arquivo'" class="ed-drop" @dragover.prevent @drop.prevent="onDrop">
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="onFile" />
            <strong>{{ ocupado ? 'Preparando…' : 'Escolher uma imagem' }}</strong>
            <small>ou arraste um arquivo até aqui</small>
          </label>

          <div v-else class="ed-urlbox">
            <div class="ed-group">
              <label class="ed-row">
                <input v-model="url" type="url" :maxlength="LIMITS.url" placeholder="https://…" aria-label="Endereço da imagem" @keydown.enter.prevent="usarUrl" />
              </label>
            </div>
            <button type="button" class="ed-aqua" :disabled="ocupado || !url" @click="usarUrl">
              {{ ocupado ? 'Verificando…' : 'Usar este endereço' }}
            </button>
          </div>
          <p v-if="erro" class="ed-error" role="alert">{{ erro }}</p>

          <h3 class="ed-sub">Minhas imagens</h3>
          <p v-if="!items.length" class="ed-empty">Nenhuma imagem ainda. Adicione uma acima e ela fica guardada aqui.</p>
          <ul v-else class="ed-lib">
            <li v-for="i in items" :key="i.id">
              <button
                type="button"
                class="ed-thumb"
                :class="{ on: atual === i.src }"
                :style="{ backgroundImage: `url(${i.src})` }"
                :aria-label="atual === i.src ? 'Imagem em uso' : 'Usar esta imagem'"
                :aria-pressed="atual === i.src ? 'true' : 'false'"
                @click="escolher(i.src)"
              ></button>
              <button type="button" class="ed-thumb-x" aria-label="Excluir imagem" @click="remove(i.id)">✕</button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
