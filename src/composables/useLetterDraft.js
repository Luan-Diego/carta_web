import { computed, inject, onBeforeUnmount, provide, reactive, ref, watch } from 'vue';
import { siteConfig } from '../config/carta.config.js';
import { PALETAS } from '../config/options.js';
import { resolveConfig } from '../config/schema.js';
import { salvarCarta } from '../lib/cloud.js';
import { encodeConfig, MAX_ENC } from '../lib/link.js';

// Estado do editor: formulário, configuração validada e link. Fica fora dos
// componentes para que cada painel só cuide da sua parte da interface.

const STORAGE_KEY = 'carta:rascunho';
const KEY = Symbol('letter-draft');

/* ---- formulário <-> configuração ---- */
const toForm = (cfg) => ({
  titulo: cfg.titulo,
  saudacao: cfg.carta.saudacao,
  mensagem: cfg.carta.mensagem.join('\n\n'), // linha em branco = novo parágrafo
  assinatura: cfg.carta.assinatura,
  cores: { ...cfg.cores },
  som: cfg.som,
  ...cfg.visual, // fundo, imagem, lacre, inicial, para, adesivo, adesivoImg, adesivoTam
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
  visual: {
    fundo: f.fundo,
    matiz: f.matiz,
    imagem: f.imagem,
    lacre: f.lacre,
    inicial: f.inicial,
    lacreEmoji: f.lacreEmoji,
    lacreImg: f.lacreImg,
    lacreTam: f.lacreTam,
    para: f.para,
    adesivo: f.adesivo,
    adesivoImg: f.adesivoImg,
    adesivoTam: f.adesivoTam,
    estampa: f.estampa,
    postal: f.postal,
  },
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

// endereço da página da carta (a pasta acima de /criar/)
function viewerUrl() {
  const here = new URL(location.href);
  here.search = '';
  here.hash = '';
  if (!here.pathname.endsWith('/')) here.pathname += '/';
  return new URL('../', here).href;
}

export function createLetterDraft() {
  const form = reactive(toForm(resolveConfig(siteConfig, loadDraft())));
  const config = computed(() => resolveConfig(siteConfig, toConfig(form)));
  const totalChars = computed(() => form.mensagem.length);

  // paleta pronta que coincide com as cores atuais ('' se for uma mistura própria)
  const paletaAtual = computed(() => {
    const p = PALETAS.find((x) => Object.keys(x.cores).every((k) => x.cores[k] === String(form.cores[k]).toLowerCase()));
    return p ? p.id : '';
  });

  /* ---- link ---- */
  const link = ref('');
  const linkError = ref('');
  const copied = ref(false);
  let timer = 0;
  let copiedTimer = 0;

  async function generate() {
    try {
      const payload = await encodeConfig(config.value);
      if (payload.length > MAX_ENC) {
        link.value = '';
        linkError.value = 'A carta é grande demais para caber no link. Reduza o texto ou use imagens menores.';
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
      const area = document.createElement('textarea');
      area.value = link.value;
      document.body.appendChild(area);
      area.select();
      document.execCommand?.('copy');
      area.remove();
    }
    copied.value = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied.value = false), 1800);
  }

  // link curto: a carta fica guardada no servidor (MongoDB) e o link leva só o id
  const linkCurto = ref('');
  const curtoErro = ref('');
  const curtoOcupado = ref(false);
  async function gerarCurto() {
    curtoOcupado.value = true;
    curtoErro.value = '';
    try {
      linkCurto.value = viewerUrl() + '#i=' + (await salvarCarta(config.value));
    } catch (e) {
      curtoErro.value = e.message;
    } finally {
      curtoOcupado.value = false;
    }
  }
  watch(config, () => (linkCurto.value = ''), { deep: true }); // carta mudou: o link curto antigo não vale mais

  // cores padrão da carta (as do site), para o botão "Voltar ao padrão"
  const padrao = resolveConfig(siteConfig).cores;
  const CORES_CARTA = ['envelope', 'papel', 'texto', 'lacre'];
  const restaurarCarta = () => CORES_CARTA.forEach((k) => (form.cores[k] = padrao[k]));
  const restaurar = () => Object.assign(form, toForm(resolveConfig(siteConfig)));
  const aplicarPaleta = (p) => Object.assign(form.cores, p.cores); // só a carta, nunca o fundo
  // escolher um fundo ajusta só as cores do fundo (a carta não muda)
  const escolherFundo = (o) => {
    form.fundo = o.id;
    form.matiz = -1; // cada fundo começa com as cores originais da animação
    if (o.cores) [form.cores.fundo1, form.cores.fundo2] = o.cores;
  };

  onBeforeUnmount(() => {
    clearTimeout(timer);
    clearTimeout(copiedTimer);
  });

  return { form, config, totalChars, paletaAtual, link, linkError, copied, copy, linkCurto, curtoErro, curtoOcupado, gerarCurto, restaurar, aplicarPaleta, escolherFundo, padrao, restaurarCarta };
}

export function provideLetterDraft() {
  const draft = createLetterDraft();
  provide(KEY, draft);
  return draft;
}

export function useLetterDraft() {
  const draft = inject(KEY);
  if (!draft) throw new Error('useLetterDraft só funciona dentro do editor');
  return draft;
}
