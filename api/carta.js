// API da carta na Vercel: guarda a carta no Redis (Upstash) por tempo limitado.
//   POST /api/carta   { config, dias }  ->  { id, expira }     dias: 1, 7 ou 30 (padrão 7)
//   GET  /api/carta?id=abc123           ->  { config }
// A carta é guardada como texto JSON, com validade (EX): o Redis apaga sozinho
// quando o prazo acaba. Sem dependências: fala com o Upstash pela API REST.
import { randomBytes } from 'node:crypto';

const MAX_BYTES = 800_000; // o Upstash grátis aceita requisições de até 1 MB
const MAX_IMAGENS = 5; // imagens próprias por carta
const DIAS = [1, 7, 30];
const DIAS_PADRAO = 7;
const ID_RE = /^[A-Za-z0-9_-]{6,20}$/;

const URL_REDIS = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

// um comando Redis, ex.: redis(['GET', 'carta:abc'])
async function redis(comando) {
  if (!URL_REDIS() || !TOKEN()) throw new Error('Redis não configurado (UPSTASH_REDIS_REST_URL / TOKEN)');
  const r = await fetch(URL_REDIS(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comando),
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok || dados.error) throw new Error(dados.error || `Redis respondeu ${r.status}`);
  return dados.result;
}

// quantas imagens próprias a carta carrega (fundo, lacre, adesivo, estampa, marca d'água, decorações)
export function contarImagens(config) {
  const v = config?.visual && typeof config.visual === 'object' ? config.visual : {};
  const unicas = new Set();
  for (const k of ['imagem', 'lacreImg', 'adesivoImg', 'estampaImg', 'marcaImg']) if (typeof v[k] === 'string' && v[k]) unicas.add(v[k]);
  if (Array.isArray(v.decorImgs)) for (const x of v.decorImgs) if (typeof x === 'string' && x) unicas.add(x);
  return unicas.size;
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id ?? '');
      if (!ID_RE.test(id)) return res.status(400).json({ erro: 'id inválido' });
      const json = await redis(['GET', `carta:${id}`]);
      if (!json) return res.status(404).json({ erro: 'carta não encontrada ou expirada' });
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
      return res.status(200).json({ config: JSON.parse(json) });
    }

    if (req.method === 'POST') {
      const config = req.body?.config;
      if (!config || typeof config !== 'object' || Array.isArray(config)) return res.status(400).json({ erro: 'carta inválida' });
      const dias = DIAS.includes(req.body?.dias) ? req.body.dias : DIAS_PADRAO;
      if (contarImagens(config) > MAX_IMAGENS) return res.status(422).json({ erro: `no máximo ${MAX_IMAGENS} imagens por carta` });
      const json = JSON.stringify(config);
      if (json.length > MAX_BYTES) return res.status(413).json({ erro: 'carta grande demais' });
      const segundos = dias * 86400;
      for (let i = 0; i < 4; i++) {
        const id = randomBytes(6).toString('base64url'); // 8 caracteres
        // NX: só grava se o id ainda não existir
        if ((await redis(['SET', `carta:${id}`, json, 'EX', segundos, 'NX'])) === 'OK') {
          return res.status(201).json({ id, expira: new Date(Date.now() + segundos * 1000).toISOString() });
        }
      }
      return res.status(500).json({ erro: 'não foi possível gerar o id' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'erro no servidor' });
  }
}
