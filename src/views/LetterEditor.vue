<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import LetterPlayer from '../components/LetterPlayer.vue';
import { useSound } from '../composables/useSound.js';
import { siteConfig } from '../config/carta.config.js';
import { LIMITS, resolveConfig } from '../config/schema.js';
import { encodeConfig, MAX_ENC } from '../lib/link.js';
import '../styles/editor-form.css';

const STORAGE_KEY = 'carta:rascunho';

const CAMPOS_COR = [
  ['fundo1', 'Fundo (centro)'],
  ['fundo2', 'Fundo (bordas)'],
  ['envelope', 'Envelope'],
  ['papel', 'Papel'],
  ['texto', 'Texto'],
  ['lacre', 'Lacre'],
];

/* ---- formulário <-> configuração ---- */
const toForm = (cfg) => ({
  titulo: cfg.titulo,
  saudacao: cfg.carta.saudacao,
  mensagem: cfg.carta.mensagem.join('\n\n'), // linha em branco = novo parágrafo
  assinatura: cfg.carta.assinatura,
  cores: { ...cfg.cores },
  som: cfg.som,
});

const toConfig = (f) => ({
  titulo: f.titulo,
  carta: {
    saudacao: f.saudacao,
    mensagem: f.mensagem.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean),
    assinatura: f.assinatura,
  },
  cores: { ...f.cores },
  som: f.som,
});

/* ---- rascunho salvo neste navegador ---- */
function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(cfg) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    /* sem armazenamento: o rascunho vale só nesta aba */
  }
}

const form = reactive(toForm(resolveConfig(siteConfig, loadDraft())));
const config = computed(() => resolveConfig(siteConfig, toConfig(form)));
const totalChars = computed(() => form.mensagem.length);

/* ---- link ---- */
const link = ref('');
const linkError = ref('');
const copied = ref(false);
const linkInput = ref(null);

// endereço da página da carta (a pasta acima de /criar/)
function viewerUrl() {
  const here = new URL(location.href);
  here.search = '';
  here.hash = '';
  if (!here.pathname.endsWith('/')) here.pathname += '/';
  return new URL('../', here).href;
}

async function generate() {
  try {
    const payload = await encodeConfig(config.value);
    if (payload.length > MAX_ENC) {
      link.value = '';
      linkError.value = 'O texto é grande demais para caber no link. Reduza a mensagem.';
    } else {
      link.value = viewerUrl() + '#c=' + payload;
      linkError.value = '';
    }
  } catch {
    link.value = '';
    linkError.value = 'Não foi possível gerar o link neste navegador.';
  }
  saveDraft(toConfig(form));
}

let timer = 0;
watch(
  config,
  () => {
    clearTimeout(timer);
    timer = setTimeout(generate, 250);
  },
  { immediate: true },
);

async function copy() {
  try {
    await navigator.clipboard.writeText(link.value);
  } catch {
    linkInput.value?.select();
    document.execCommand?.('copy');
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}

function restaurar() {
  Object.assign(form, toForm(resolveConfig(siteConfig)));
}

onMounted(() => useSound().applyDefault(config.value.som));
</script>

<template>
  <div class="ed">
    <section class="ed-preview" aria-label="Pré-visualização da carta">
      <LetterPlayer :config="config" />
    </section>

    <form class="ed-form" @submit.prevent>
      <header class="ed-head">
        <h1>Criar carta</h1>
        <p>Personalize e copie o link. Quem abrir só vê a carta: nada pode ser alterado por ela.</p>
      </header>

      <fieldset class="ed-card">
        <legend>Mensagem</legend>
        <label>
          Saudação
          <input v-model="form.saudacao" type="text" :maxlength="LIMITS.saudacao" />
        </label>
        <label>
          Mensagem
          <textarea v-model="form.mensagem" rows="9"></textarea>
          <small>
            Linha em branco = novo parágrafo · {{ totalChars }} caracteres. No papel cabem cerca de 400; o texto
            completo aparece ao tocar na carta aberta. Máximo de {{ LIMITS.paragrafos }} parágrafos de
            {{ LIMITS.paragrafo }} caracteres.
          </small>
        </label>
        <label>
          Assinatura
          <input v-model="form.assinatura" type="text" :maxlength="LIMITS.assinatura" />
        </label>
      </fieldset>

      <fieldset class="ed-card">
        <legend>Cores</legend>
        <div class="ed-colors">
          <label v-for="[chave, nome] in CAMPOS_COR" :key="chave" class="ed-color">
            <input v-model="form.cores[chave]" type="color" />
            <span>{{ nome }}</span>
          </label>
        </div>
      </fieldset>

      <fieldset class="ed-card">
        <legend>Outros</legend>
        <label>
          Título da aba do navegador
          <input v-model="form.titulo" type="text" :maxlength="LIMITS.titulo" />
        </label>
        <label class="ed-check">
          <input v-model="form.som" type="checkbox" />
          Som ligado ao abrir a carta
        </label>
      </fieldset>

      <fieldset class="ed-card">
        <legend>Link da carta</legend>
        <input
          ref="linkInput"
          class="ed-link"
          type="text"
          readonly
          :value="link"
          placeholder="Gerando…"
          aria-label="Link da carta"
          @focus="$event.target.select()"
        />
        <p v-if="linkError" class="ed-error" role="alert">{{ linkError }}</p>
        <div class="ed-actions">
          <button type="button" class="ed-btn primary" :disabled="!link" @click="copy">
            {{ copied ? 'Copiado!' : 'Copiar link' }}
          </button>
          <a v-if="link" class="ed-btn" :href="link" target="_blank" rel="noopener">Abrir carta</a>
          <button type="button" class="ed-btn ghost" @click="restaurar">Restaurar padrão</button>
        </div>
        <small v-if="link">{{ link.length }} caracteres. O rascunho fica salvo neste navegador.</small>
      </fieldset>
    </form>
  </div>
</template>
