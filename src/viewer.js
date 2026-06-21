import { createApp } from 'vue';
import LetterViewer from './views/LetterViewer.vue';
import { useSound } from './composables/useSound.js';
import { siteConfig } from './config/carta.config.js';
import { resolveConfig } from './config/schema.js';
import { applyTheme } from './config/theme.js';
import { decodeConfig, readHashPayload } from './lib/link.js';
import './styles/tokens.css';
import './styles/viewer-page.css';

// padrões < carta do site < link (#c=...), sempre validado
async function loadConfig() {
  const payload = readHashPayload();
  if (payload) {
    try {
      return resolveConfig(siteConfig, await decodeConfig(payload));
    } catch {
      /* link inválido: mostra a carta padrão do site */
    }
  }
  return resolveConfig(siteConfig);
}

async function boot() {
  const config = await loadConfig();
  applyTheme(config);
  useSound().applyDefault(config.som);
  createApp(LetterViewer, { config }).mount('#app');
}

boot();

// colar outro link na mesma aba só muda o #: recarrega para mostrar a nova carta
window.addEventListener('hashchange', () => location.reload());
