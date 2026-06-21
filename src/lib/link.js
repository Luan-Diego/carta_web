// Link personalizado:  <site>/#c=<j|z>.<base64url>
//   j = JSON puro, z = JSON comprimido (deflate-raw).
// A parte depois do # nunca é enviada a nenhum servidor.

export const MAX_ENC = 12000; // tamanho máximo aceito do trecho codificado
const MAX_JSON = 60000; // tamanho máximo do JSON depois de descomprimir

const toB64u = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64u = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function deflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// Descomprime parando assim que passar do limite (protege contra "zip bomb")
async function inflate(bytes, limit) {
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      throw new Error('conteúdo grande demais');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export async function encodeConfig(cfg) {
  const json = new TextEncoder().encode(JSON.stringify(cfg));
  if (typeof CompressionStream !== 'undefined') {
    try {
      return 'z.' + toB64u(await deflate(json));
    } catch {
      /* cai para JSON puro */
    }
  }
  return 'j.' + toB64u(json);
}

export async function decodeConfig(payload) {
  const m = /^([jz])\.([A-Za-z0-9_-]+)$/.exec(payload);
  if (!m || payload.length > MAX_ENC) throw new Error('link inválido');
  let bytes = fromB64u(m[2]);
  if (m[1] === 'z') bytes = await inflate(bytes, MAX_JSON);
  if (bytes.length > MAX_JSON) throw new Error('conteúdo grande demais');
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function readHashPayload(hash = location.hash) {
  const m = /^#c=(.+)$/.exec(hash);
  return m ? m[1] : null;
}
