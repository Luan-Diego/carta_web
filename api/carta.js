// API da carta na Vercel: guarda a carta no MongoDB e devolve um id curto.
//   POST /api/carta   { config }  ->  { id }
//   GET  /api/carta?id=abc123     ->  { config }
// A carta é guardada como texto JSON (campo "json"), nunca como documento aberto,
// então nada do que vem do navegador vira operador ou campo do MongoDB.
import { randomBytes } from 'node:crypto';
import { MongoClient } from 'mongodb';

const MAX_BYTES = 1_000_000;
const ID_RE = /^[A-Za-z0-9_-]{6,20}$/;
let pronto = null;

function colecao() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI não definida');
  pronto ??= new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 3 })
    .connect()
    .then(async (c) => {
      const col = c.db(process.env.MONGODB_DB || 'carta').collection('cartas');
      await col.createIndex({ criada: 1 });
      return col;
    })
    .catch((e) => {
      pronto = null; // tenta de novo na próxima chamada
      throw e;
    });
  return pronto;
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id ?? '');
      if (!ID_RE.test(id)) return res.status(400).json({ erro: 'id inválido' });
      const doc = await (await colecao()).findOne({ _id: id });
      if (!doc) return res.status(404).json({ erro: 'carta não encontrada' });
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
      return res.status(200).json({ config: JSON.parse(doc.json) });
    }

    if (req.method === 'POST') {
      const config = req.body?.config;
      if (!config || typeof config !== 'object' || Array.isArray(config)) return res.status(400).json({ erro: 'carta inválida' });
      const json = JSON.stringify(config);
      if (json.length > MAX_BYTES) return res.status(413).json({ erro: 'carta grande demais' });
      const col = await colecao();
      for (let i = 0; i < 4; i++) {
        const id = randomBytes(6).toString('base64url'); // 8 caracteres
        try {
          await col.insertOne({ _id: id, json, criada: new Date() });
          return res.status(201).json({ id });
        } catch (e) {
          if (e?.code !== 11000) throw e; // id repetido: sorteia outro
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
