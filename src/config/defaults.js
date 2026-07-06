// Formato (esquema) e valores padrão da configuração da carta.
// Qualquer campo ausente ou inválido volta para estes valores.
export const DEFAULTS = {
  titulo: 'Uma carta para você',
  carta: {
    saudacao: 'Querido(a),',
    mensagem: ['Escreva aqui a sua mensagem.'],
    assinatura: '',
  },
  cores: {
    fundo1: '#f9f7f2', // centro do fundo
    fundo2: '#e7e2d6', // bordas do fundo
    envelope: '#e6cfa7', // cor base do envelope (os outros tons são calculados)
    papel: '#fffefa',
    texto: '#3f3b33',
    lacre: '#92161c', // coração do lacre
  },
  som: true,
  // opções válidas em config/options.js
  visual: {
    fundo: 'gradiente', // ver FUNDOS em options.js
    matiz: -1, // cor da animação do fundo (0-359); -1 = cores originais da cena
    imagem: '', // fundo = 'imagem': endereço https ou data URL da foto
    lacre: 'coracao', // ver LACRES em options.js
    inicial: '', // letra(s) do lacre, quando lacre = 'inicial'
    para: '', // dedicatória escrita no envelope (ex.: "Para Maria")
    adesivo: '', // emoji colado no envelope ('' = nenhum)
    adesivoImg: '', // PNG/WebP próprio (data URL) no lugar do emoji
    lacreEmoji: '', // emoji no lugar da forma do lacre (um de ADESIVOS)
    lacreImg: '', // PNG/WebP próprio (data URL) no lugar da forma do lacre
    lacreTam: 100, // tamanho do lacre, em % (60 a 160)
    adesivoTam: 100, // tamanho do adesivo, em % (50 a 200)
    estampa: '', // padrão do envelope (ESTAMPAS em options.js)
    postal: '', // emoji no selo postal do envelope ('' = sem selo)
  },
};

// Limites de tamanho (protegem contra links gigantes)
export const LIMITS = {
  titulo: 120,
  saudacao: 80,
  assinatura: 80,
  paragrafos: 8,
  paragrafo: 800,
  inicial: 2,
  para: 40,
  url: 500, // endereço https de imagem
  dataUrl: 14000, // imagem embutida no link (já reduzida pelo editor)
};
