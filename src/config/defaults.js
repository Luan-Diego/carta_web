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
};

// Limites de tamanho (protegem contra links gigantes)
export const LIMITS = {
  titulo: 120,
  saudacao: 80,
  assinatura: 80,
  paragrafos: 8,
  paragrafo: 800,
};
