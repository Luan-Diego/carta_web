// Cliente da API (/api/carta): guarda e busca cartas pelo id curto.
const API = '/api/carta';
export const ID_RE = /^[A-Za-z0-9_-]{6,20}$/;

// dias: por quanto tempo a carta fica guardada (1, 7 ou 30)
export async function salvarCarta(config, dias = 7) {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config, dias }) });
  if (!r.ok) {
    const msg = { 413: 'A carta é grande demais para salvar.', 422: 'Use no máximo 5 imagens próprias na carta para gerar o link curto.' }[r.status];
    throw new Error(msg || 'Não foi possível salvar a carta agora.');
  }
  return (await r.json()).id;
}

export async function buscarCarta(id) {
  if (!ID_RE.test(id)) throw new Error('link inválido');
  const r = await fetch(`${API}?id=${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(r.status === 404 ? 'Esta carta expirou ou não existe mais.' : 'carta não encontrada');
  return (await r.json()).config;
}
