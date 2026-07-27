// API da carta na Vercel: guarda a carta no Redis (Upstash) por tempo limitado.
//   POST /api/carta   { config, dias }  ->  { id, expira }     dias: 1, 7 ou 30 (padrão 7)
//   GET  /api/carta?id=abc123def456     ->  { config }
// A carta é guardada como texto JSON, com validade (EX): o Redis apaga sozinho
// quando o prazo acaba. Sem dependências: fala com o Upstash pela API REST.
//
// Segurança (resumo; detalhes em SECURITY.md):
//  - nada do que chega é guardado como veio: passa pelo mesmo validador do site (resolveConfig),
//    que só aceita valores das listas conhecidas, cores válidas e imagens png/webp/jpeg (sem SVG);
//  - limite de tamanho, de imagens e de pedidos por IP (o IP é guardado só como hash);
//  - só aceita JSON, só do mesmo site (Origin) e responde sem cache nos erros;
//  - ids com 72 bits aleatórios (impossíveis de adivinhar) e erros genéricos (sem detalhes internos).
import { createHash, randomBytes } from 'node:crypto';
import { resolveConfig } from '../src/config/schema.js';

const MAX_BYTES = 800_000; // o Upstash grátis aceita requisições de até 1 MB
const MAX_IMAGENS = 5; // imagens próprias por carta
const DIAS = [1, 7, 30];
const DIAS_PADRAO = 7;
const ID_RE = /^[A-Za-z0-9_-]{6,20}$/;
// pedidos por IP: [nome, máximo, janela em segundos]
const LIMITE_POST = [['p-h', 8, 3600], ['p-d', 30, 86400]];
const LIMITE_GET = [['g-m', 120, 60]];

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

// IP de quem chamou (a Vercel preenche o cabeçalho; ele não vem do navegador), guardado só como hash
function quem(req) {
  const h = req.headers || {};
  const ip = String(h['x-vercel-forwarded-for'] || h['x-forwarded-for'] || req.socket?.remoteAddress || 'desconhecido').split(',')[0].trim();
  return createHash('sha256').update(`${process.env.RATE_SALT || 'carta'}:${ip}`).digest('base64url').slice(0, 16);
}

// conta o pedido; devolve false se passou do limite (e quantos segundos esperar)
async function dentroDoLimite(req, regras) {
  const id = quem(req);
  for (const [nome, max, janela] of regras) {
    const chave = `rl:${nome}:${id}:${Math.floor(Date.now() / 1000 / janela)}`;
    const n = await redis(['INCR', chave]);
    if (n === 1) await redis(['EXPIRE', chave, janela * 2]);
    if (n > max) return { ok: false, espera: janela };
  }
  return { ok: true };
}

// pedidos feitos por outro site (Origin diferente do nosso) são recusados
function mesmaOrigem(req) {
  const origem = req.headers?.origin;
  if (!origem) return true; // chamadas sem navegador (curl, testes) não têm Origin
  try {
    return new URL(origem).host === req.headers.host;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const id = String(req.query?.id ?? '');
      if (!ID_RE.test(id)) return res.status(400).json({ erro: 'id inválido' });
      const lim = await dentroDoLimite(req, LIMITE_GET);
      if (!lim.ok) { res.setHeader('Retry-After', String(lim.espera)); return res.status(429).json({ erro: 'muitos pedidos, tente mais tarde' }); }
      const json = await redis(['GET', `carta:${id}`]);
      if (!json) return res.status(404).json({ erro: 'carta não encontrada ou expirada' });
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60'); // só as cartas que existem ficam no cache da CDN
      return res.status(200).json({ config: JSON.parse(json) });
    }

    if (req.method === 'POST') {
      if (!mesmaOrigem(req)) return res.status(403).json({ erro: 'origem não permitida' });
      if (!String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) return res.status(415).json({ erro: 'envie JSON' });
      const config = req.body?.config;
      if (!config || typeof config !== 'object' || Array.isArray(config)) return res.status(400).json({ erro: 'carta inválida' });
      const dias = DIAS.includes(req.body?.dias) ? req.body.dias : DIAS_PADRAO;
      if (JSON.stringify(config).length > MAX_BYTES) return res.status(413).json({ erro: 'carta grande demais' });
      const lim = await dentroDoLimite(req, LIMITE_POST);
      if (!lim.ok) { res.setHeader('Retry-After', String(lim.espera)); return res.status(429).json({ erro: 'muitas cartas criadas, tente mais tarde' }); }
      // o que vai para o Redis é a versão validada, nunca o texto recebido
      const limpa = resolveConfig(config);
      if (contarImagens(limpa) > MAX_IMAGENS) return res.status(422).json({ erro: `no máximo ${MAX_IMAGENS} imagens por carta` });
      const json = JSON.stringify(limpa);
      if (json.length > MAX_BYTES) return res.status(413).json({ erro: 'carta grande demais' });
      const segundos = dias * 86400;
      for (let i = 0; i < 4; i++) {
        const id = randomBytes(9).toString('base64url'); // 12 caracteres
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
    console.error(e?.message || e); // só a mensagem: nada de token ou corpo do pedido nos logs
    return res.status(500).json({ erro: 'erro no servidor' });
  }
}
