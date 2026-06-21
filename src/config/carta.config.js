// =============================================================
// PERSONALIZE AQUI: a carta que aparece quando o site é aberto
// sem um link personalizado (e o ponto de partida do editor).
// Campos removidos ou inválidos voltam ao padrão (defaults.js).
// =============================================================
export const siteConfig = {
  // Título da aba do navegador
  titulo: 'Uma carta para você',

  carta: {
    saudacao: 'Lorem ipsum,',
    // Cada item da lista vira um parágrafo (no papel cabem ~400 caracteres;
    // o texto completo aparece ao tocar na carta aberta)
    mensagem: [
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae id incidunt error corrupti neque? A, distinctio asperiores aut saepe pariatur quaerat aspernatur repellendus ea, earum, ad sit inventore doloremque deserunt..',
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem, mollitia culpa. Facilis reiciendis perspiciatis, fugit fuga omnis nobis voluptates aut inventore. Odio fugiat in expedita nesciunt, qui magnam. Consectetur, ea.',
    ],
    // Deixe vazio ('') para não mostrar
    assinatura: '',
  },

  // Cores em #hex, rgb() ou hsl()
  cores: {
    fundo1: '#f9f7f2',
    fundo2: '#e7e2d6',
    envelope: '#e6cfa7',
    papel: '#fffefa',
    texto: '#3f3b33',
    lacre: '#92161c',
  },

  // Som ligado ao abrir (o botão de som lembra a escolha de quem visita)
  som: true,
};
