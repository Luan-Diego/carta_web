import { ref } from 'vue';
import pt from './pt.js';
import en from './en.js';
import es from './es.js';
import it from './it.js';
import zh from './zh.js';
import ja from './ja.js';
import ko from './ko.js';
import hi from './hi.js';

// Idiomas da interface. O código é o de <html lang>; o nome aparece no próprio idioma.
const DICIONARIOS = { pt, en, es, it, zh, ja, ko, hi };
export const IDIOMAS = Object.entries(DICIONARIOS).map(([code, d]) => ({ code, nome: d.name }));

const CHAVE = 'carta:idioma';

function inicial() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo in DICIONARIOS) return salvo;
  } catch {
    /* sem armazenamento */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'pt';
  const code = nav.toLowerCase().slice(0, 2);
  return code in DICIONARIOS ? code : 'pt';
}

const locale = ref(inicial());
if (typeof document !== 'undefined') document.documentElement.lang = locale.value;

export function setLocale(code) {
  if (!(code in DICIONARIOS)) return;
  locale.value = code;
  if (typeof document !== 'undefined') document.documentElement.lang = code;
  try {
    localStorage.setItem(CHAVE, code);
  } catch {
    /* sem armazenamento */
  }
}

// t('chave', { n: 3 }): reativo (troca na hora). Para os textos do editor a própria frase em
// português é a chave: se não houver tradução, aparece o português. {n} vira o valor dado.
export const t = (chave, vars) => {
  const txt = DICIONARIOS[locale.value]?.[chave] ?? pt[chave] ?? chave;
  return vars ? txt.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : txt;
};

export const useI18n = () => ({ t, locale, setLocale, idiomas: IDIOMAS });
