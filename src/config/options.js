// Opções visuais disponíveis. Fonte única: o editor lista estas opções e
// a validação (schema.js) só aceita estes valores.

// Fundos animados (desenhados em canvas, ver lib/scenes). `cores` = fundo sugerido
// ao escolher a opção; dá para ajustar depois. 'imagem' usa a foto do usuário.
export const FUNDOS = [
  { id: 'gradiente', nome: 'Liso', icone: '◐', cores: null },
  { id: 'particulas', nome: 'Partículas', icone: '✨', cores: ['#e8fbff', '#a9e3f5'], cor: true },
  { id: 'nebulosa', nome: 'Nebulosa', icone: '🌌', cores: ['#1b1040', '#07040f'], cor: true },
  { id: 'aurora', nome: 'Aurora', icone: '🌠', cores: ['#0a2236', '#02060d'], cor: true },
  { id: 'estrelado', nome: 'Céu estrelado', icone: '⭐', cores: ['#142046', '#04060f'], cor: true },
  { id: 'ondas', nome: 'Ondas', icone: '🌊', cores: ['#dff4ff', '#8fd0f0'], cor: true },
  { id: 'agua', nome: 'Água cristalina', icone: '💧', cores: ['#2ab6dc', '#0a6aaa'], cor: true },
  { id: 'chuva', nome: 'Chuva na janela', icone: '🌧️', cores: ['#607080', '#232c36'] },
  { id: 'jardim', nome: 'Jardim', icone: '🌷', cores: ['#eaf7ff', '#d3efd3'] },
  { id: 'fogo', nome: 'Fogo e brasas', icone: '🔥', cores: ['#2d0f06', '#090302'], cor: true },
  { id: 'circuitos', nome: 'Circuitos', icone: '⚡', cores: ['#07181f', '#020708'], cor: true },
  { id: 'petalas', nome: 'Pétalas', icone: '🌸', cores: ['#fff1f3', '#f8d5dc'], cor: true },
  { id: 'coracoes', nome: 'Corações', icone: '💕', cores: ['#fff0f3', '#ffd0dc'], cor: true },
  { id: 'estrelas', nome: 'Chuva de estrelas', icone: '🌟', cores: ['#1d2540', '#0c1020'], cor: true },
  { id: 'imagem', nome: 'Minha imagem', icone: '🖼️', cores: null },
];

// Links antigos usavam 'brilhos'; hoje equivale a 'particulas'
export const FUNDO_ANTIGO = { brilhos: 'particulas' };

export const LACRES = [
  { id: 'coracao', nome: 'Coração' },
  { id: 'estrela', nome: 'Estrela' },
  { id: 'flor', nome: 'Flor' },
  { id: 'lua', nome: 'Lua' },
  { id: 'diamante', nome: 'Diamante' },
  { id: 'borboleta', nome: 'Borboleta' },
  { id: 'trevo', nome: 'Trevo' },
  { id: 'raio', nome: 'Raio' },
  { id: 'musica', nome: 'Nota' },
  { id: 'sol', nome: 'Sol' },
  { id: 'coroa', nome: 'Coroa' },
  { id: 'floco', nome: 'Floco de neve' },
  { id: 'laco', nome: 'Laço' },
  { id: 'patinha', nome: 'Patinha' },
  { id: 'gota', nome: 'Gota' },
  { id: 'folha', nome: 'Folha' },
  { id: 'escudo', nome: 'Escudo' },
  { id: 'nuvem', nome: 'Nuvem' },
  { id: 'chama', nome: 'Chama' },
  { id: 'inicial', nome: 'Inicial' },
];

// Fontes da carta. As do app vêm do pacote @fontsource (empacotadas no site, então
// todo mundo vê igual, sem precisar ter a fonte instalada). 'propria' = arquivo enviado.
export const FONTE_PROPRIA = 'FonteDaCarta';
export const FONTES = [
  { id: 'padrao', nome: 'Padrão', familia: '' },
  { id: 'playfair', nome: 'Playfair', familia: "'Playfair Display', Georgia, serif" },
  { id: 'lora', nome: 'Lora', familia: "'Lora', Georgia, serif" },
  { id: 'cormorant', nome: 'Cormorant', familia: "'Cormorant Garamond', Georgia, serif" },
  { id: 'merriweather', nome: 'Merriweather', familia: "'Merriweather', Georgia, serif" },
  { id: 'dancing', nome: 'Dancing', familia: "'Dancing Script', cursive" },
  { id: 'greatvibes', nome: 'Great Vibes', familia: "'Great Vibes', cursive" },
  { id: 'satisfy', nome: 'Satisfy', familia: "'Satisfy', cursive" },
  { id: 'caveat', nome: 'Caveat', familia: "'Caveat', cursive" },
  { id: 'patrick', nome: 'Patrick Hand', familia: "'Patrick Hand', cursive" },
  { id: 'quicksand', nome: 'Quicksand', familia: "'Quicksand', sans-serif" },
];
export const FONTE_ARQ_MAX = 250 * 1024; // tamanho máximo do arquivo de fonte enviado

// Paletas prontas: mexem só na carta (envelope, papel, texto e lacre), nunca no fundo
export const PALETAS = [
  { id: 'classico', nome: 'Clássico', cores: { envelope: '#e6cfa7', papel: '#fffefa', texto: '#3f3b33', lacre: '#92161c' } },
  { id: 'oceano', nome: 'Oceano', cores: { envelope: '#8fd0ea', papel: '#ffffff', texto: '#27495a', lacre: '#0b6fae' } },
  { id: 'rosa', nome: 'Rosa', cores: { envelope: '#f0a9bb', papel: '#fffafb', texto: '#5a3a42', lacre: '#b3203f' } },
  { id: 'floresta', nome: 'Floresta', cores: { envelope: '#b6d1a0', papel: '#fffff8', texto: '#2f4a33', lacre: '#2e7d4f' } },
  { id: 'lavanda', nome: 'Lavanda', cores: { envelope: '#c4b2ec', papel: '#fffdff', texto: '#3d3358', lacre: '#7a4fc4' } },
  { id: 'noite', nome: 'Noite', cores: { envelope: '#2b3a67', papel: '#f5f1e6', texto: '#262a3d', lacre: '#e0b84a' } },
];

// Adesivos do app, em categorias. '' = sem adesivo. Todos (emojis) também servem de selo postal.
const lista = (s) => s.split(/\s+/).filter(Boolean);
export const ADESIVO_CATEGORIAS = [
  { id: 'anime', nome: 'Anime e Japão', icone: '🍥', itens: lista('🍥 🍙 🍘 🍚 🍜 🍣 🍤 🍢 🍡 🍱 🍵 🍶 🥢 🎎 🎏 🎐 🎑 🎋 🎍 🎌 ⛩️ 🗾 🗻 🏯 🏮 🧧 🎴 🀄 🐉 🐲 🦊 🐱 🌸 💮 🏵️ ⚔️ 🗡️ 🏹 🔥 💥 ⚡ 🌀 👺 👹 🎭 🎆 🎇 🧿') },
  { id: 'rostos', nome: 'Rostos', icone: '😍', itens: lista('😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😌 😔 😪 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 💩 🤡 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 🙈 🙉 🙊') },
  { id: 'amor', nome: 'Amor e gestos', icone: '💖', itens: lista('💋 💌 💘 💝 💖 💗 💓 💞 💕 💟 ❣️ 💔 ❤️ 🧡 💛 💚 💙 💜 🤎 🖤 🤍 💯 💢 💥 💫 💦 💨 💤 👋 🤚 ✋ 🖖 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 👍 👎 ✊ 👊 👏 🙌 👐 🤲 🤝 🙏 💅 💪 👀 👅 👄 🧠') },
  { id: 'animais', nome: 'Animais', icone: '🐱', itens: lista('🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦗 🕷️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦏 🦛 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🦚 🦜 🦢 🕊️ 🐇 🦝 🦨 🦡 🦦 🦥 🐁 🐀 🐿️ 🦔 🐾 🐉 🐲') },
  { id: 'natureza', nome: 'Natureza', icone: '🌸', itens: lista('🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🍃 🍂 🍁 🍄 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🪻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 ⭐ 🌟 ✨ ☄️ 🌪️ 🌈 ☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 🌬️ 💧 ☔ 🌊 🌫️') },
  { id: 'comida', nome: 'Comida', icone: '🍓', itens: lista('🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🌮 🌯 🥗 🍝 🍲 🍛 🥟 🥠 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 ☕ 🧃 🥤 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🧊') },
  { id: 'festa', nome: 'Festa e jogos', icone: '🎉', itens: lista('🎈 🎉 🎊 🎀 🎁 🎂 🎃 🧨 🏆 🥇 🥈 🥉 🏅 🎖️ ⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🥊 🥋 ⛳ 🎣 🎯 🎮 🕹️ 🎲 🧩 🎰 🎳 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎵 🎶 🎪 🎡 🎢 🎠') },
  { id: 'objetos', nome: 'Objetos', icone: '💎', itens: lista('✉️ 📩 📨 📦 📮 📬 📜 📃 📄 📖 📚 📓 📒 📝 ✏️ 🖊️ 🖋️ 🖌️ 🖍️ 📌 📍 📎 ✂️ 🔑 🗝️ 🔒 🔓 🔔 🔮 🪄 💎 💍 👑 🎩 🎓 👓 🕶️ 🌂 ☂️ 👜 👛 🎒 👒 🧢 👗 👚 👕 👖 👠 💄 🧸 📷 📸 🎥 📱 💻 🖥️ ⌚ ⏰ ⏳ 💡 🔦 🕯️ 🔭 🔬 🧪 💊 🧬 🔧 🔨 ⚙️ 🧲 💰 💳 🛒 🕰️ 🧭 🗺️ 🧳') },
  { id: 'viagem', nome: 'Viagem e lugares', icone: '🚀', itens: lista('🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚚 🚜 🚲 🛴 🏍️ 🚂 🚆 🚇 🚊 🚀 🛸 ✈️ 🛫 🛬 🚁 ⛵ 🚤 🛥️ 🚢 ⚓ 🗿 🏔️ ⛰️ 🌋 🏝️ 🏖️ 🏜️ 🌅 🌄 🌇 🌆 🌃 🌌 🌉 ⛺ 🏠 🏡 🏰 🗼 🗽 ⛪ 🕌') },
];

export const ADESIVOS = ['', ...new Set(ADESIVO_CATEGORIAS.flatMap((c) => c.itens))];

// Sugestões para o selo postal (qualquer emoji de ADESIVOS é aceito)
export const POSTAIS = ['🌹', '🌸', '🦋', '🕊️', '⭐', '🌙', '💌', '❤️', '🎀', '☕', '🍥', '🏰', '🌍', '🚂', '⛵', '🐱', '🐶', '🦊', '🌻', '🍀', '🎵', '💎'];

// Estampas do envelope: desenhadas em CSS (styles/envelope.css), usam a cor do lacre
export const ESTAMPAS = [
  { id: '', nome: 'Lisa' },
  { id: 'aerea', nome: 'Correio aéreo' },
  { id: 'bolinhas', nome: 'Bolinhas' },
  { id: 'listras', nome: 'Listras' },
  { id: 'xadrez', nome: 'Xadrez' },
  { id: 'coracoes', nome: 'Corações' },
  { id: 'estrelas', nome: 'Estrelas' },
  { id: 'ondas', nome: 'Ondas' },
];

// Imagens do usuário (data URL ou https) e tamanho do adesivo próprio, em %
export const STICKER_SIZE = { min: 50, max: 200, padrao: 100 };
export const LACRE_SIZE = { min: 60, max: 160, padrao: 100 }; // tamanho do lacre, em %

// Aba Papel: texturas do papel, marca d'água e decorações arrastáveis
export const TEXTURAS = [
  { id: '', nome: 'Lisa' },
  { id: 'pautado', nome: 'Pautado' },
  { id: 'quadriculado', nome: 'Quadriculado' },
  { id: 'pontilhado', nome: 'Pontilhado' },
];
export const MARCA_OP = { min: 5, max: 60, padrao: 18 }; // opacidade da marca d'água, em %
export const MARCA_TAM = { min: 20, max: 100, padrao: 60 }; // largura da marca, em % do papel
export const DECOR_TAM = { min: 6, max: 60, padrao: 18 }; // largura da decoração, em % da superfície
export const DECOR_MAX = 12; // decorações por superfície (papel ou envelope)
export const DECOR_IMGS_MAX = 4; // imagens próprias diferentes usadas nas decorações
