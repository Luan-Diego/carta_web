// Cliente da API (/api/carta): guarda e busca cartas pelo id curto.
const API = '/api/carta';
export const ID_RE = /^[A-Za-z0-9_-]{6,20}$/;

export async function salvarCarta(config) {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config }) });
  if (!r.ok) throw new Error(r.status === 413 ? 'A carta é grande demais para salvar.' : 'Não foi possível salvar a carta agora.');
  return (await r.json()).id;
}

export async function buscarCarta(id) {
  if (!ID_RE.test(id)) throw new Error('link inválido');
  const r = await fetch(`${API}?id=${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error('carta não encontrada');
  return (await r.json()).config;
}
