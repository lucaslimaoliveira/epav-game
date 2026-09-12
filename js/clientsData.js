const feedbackPorCategoria = {
  observacao: {
    excelente: 'Você respeitou o momento do cliente antes de iniciar a conversa.',
    boa: 'Você percebeu o contexto, mas poderia ter esperado um sinal mais claro de disponibilidade.',
    neutra: 'A abordagem não considerou se este era o melhor momento para conversar.',
    ruim: 'Você interrompeu o cliente antes de confirmar se ele estava disponível.'
  },
  abordagem: {
    excelente: 'Você abriu espaço para o cliente falar sem pressionar uma compra.',
    boa: 'A abordagem foi educada, mas direcionou a conversa cedo demais.',
    neutra: 'A fala manteve a conversa, mas ainda não demonstrou interesse real pelo contexto.',
    ruim: 'Você tentou conduzir a venda antes de conquistar abertura para conversar.'
  },
  pergunta: {
    excelente: 'Boa decisão. A pergunta revelou uma necessidade que poderá ser usada mais adiante.',
    boa: 'A pergunta ajuda, mas ainda parte de uma suposição sobre o que o cliente quer.',
    neutra: 'Você recebeu pouca informação nova porque a pergunta foi genérica.',
    ruim: 'Você pulou a descoberta e tentou chegar à solução sem entender o problema.'
  },
  necessidade: {
    excelente: 'Você reconheceu a necessidade e mostrou que está acompanhando o raciocínio do cliente.',
    boa: 'Você considerou parte da necessidade, mas deixou um detalhe importante de fora.',
    neutra: 'A resposta parece adequada, porém não usa o que o cliente acabou de contar.',
    ruim: 'Você ignorou uma informação relevante e o cliente ficou menos receptivo.'
  },
  objecao: {
    excelente: 'Você acolheu a preocupação antes de apresentar uma alternativa coerente.',
    boa: 'A resposta oferece uma saída, mas valida pouco a preocupação do cliente.',
    neutra: 'Você respondeu à objeção sem investigar o que realmente está por trás dela.',
    ruim: 'Você rebateu a objeção em vez de compreendê-la, reduzindo a confiança.'
  },
  oferta: {
    excelente: 'A recomendação conecta a solução às informações que o cliente compartilhou.',
    boa: 'A oferta faz sentido, mas ainda poderia ser mais personalizada.',
    neutra: 'A oferta é possível, porém poderia servir para qualquer cliente.',
    ruim: 'Você ofereceu antes de reunir ou usar o contexto necessário.'
  },
  fechamento: {
    excelente: 'Você confirmou a decisão com clareza e sem transformar o fechamento em pressão.',
    boa: 'O fechamento é cordial, mas não reforça o valor construído durante a conversa.',
    neutra: 'Você encerrou sem confirmar se a solução atende ao que foi combinado.',
    ruim: 'A pressão no fechamento enfraqueceu a confiança construída no atendimento.'
  }
};

function feedbackDaOpcao(categoria, nivel) {
  return feedbackPorCategoria[categoria]?.[nivel]
    || feedbackPorCategoria.necessidade[nivel]
    || 'Observe como sua resposta afetou a confiança do cliente.';
}

const distratoresPlausiveis = {
  abordagem: [
    'Posso adiantar as opções mais procuradas enquanto você me explica melhor.',
    'Vou começar com uma sugestão rápida e ajustamos se for necessário.'
  ],
  pergunta: [
    'Posso partir das escolhas mais vendidas e confirmar os detalhes depois.',
    'Vou usar o que costuma funcionar para a maioria e depois ajustamos.'
  ],
  necessidade: [
    'Vou priorizar o ponto principal; os outros detalhes nós confirmamos depois.',
    'Posso simplificar a escolha usando apenas a necessidade mais urgente.'
  ],
  objecao: [
    'Primeiro posso explicar por que esta opção custa mais e depois comparar.',
    'Vou reforçar os benefícios; talvez isso resolva sua preocupação.'
  ],
  oferta: [
    'Vou indicar a opção mais completa para garantir que nada falte.',
    'Posso começar pela opção mais popular e adaptar a quantidade.'
  ],
  fechamento: [
    'Posso deixar esta opção separada enquanto você confirma os detalhes.',
    'Vou encaminhar esta opção e depois ajustamos se surgir alguma dúvida.'
  ]
};

function criarNo(texto, escolhas, pontos, categoria, proximoNo, resposta = '', id = '') {
  const alternativas = distratoresPlausiveis[categoria] || distratoresPlausiveis.necessidade;
  return {
    texto,
    opcoes: escolhas.map((escolha, indice) => {
      const valor = pontos[indice];
      const nivel = valor >= 10 ? 'excelente' : valor > 0 ? 'boa' : valor === 0 ? 'neutra' : 'ruim';
      return {
        id: `${id}-o${indice + 1}`,
        texto: nivel === 'ruim' && indice === escolhas.length - 1 ? alternativas[indice % alternativas.length] : escolha,
        categoria,
        qualidade: nivel,
        efeitoSatisfacao: valor >= 10 ? 6 : valor > 0 ? 3 : valor === 0 ? 0 : valor <= -10 ? -7 : -4,
        pontos: valor,
        correta: valor === 10,
        feedback: feedbackDaOpcao(categoria, nivel),
        resposta,
        proximoNo
      };
    })
  };
}

function criarCliente(configuracao, decisoes) {
  const dialogo = {};
  decisoes.forEach((decisao, indice) => {
    const atual = `d${indice + 1}`;
    const proximo = indice === decisoes.length - 1 ? null : `d${indice + 2}`;
    dialogo[atual] = criarNo(decisao[0], decisao[1], decisao[2], decisao[3], proximo, decisao[4] || '', atual);
    dialogo[atual].descoberta = configuracao.descobertas?.[atual] || null;
    dialogo[atual].retorno = configuracao.retornos?.[atual] || null;
  });
  return { ...configuracao, decisoes: decisoes.length, noInicial: 'd1', dialogo };
}

const clientes = [
  criarCliente({
    id: 'cliente1', nome: 'Lucas', area: 'Desafio 1 · Abordagem', dificuldade: '⭐',
    imagem: 'cliente1-v2.png',
    reacoes: { positiva: 'cliente1-reacao-positiva.png', negativa: 'cliente1-reacao-negativa.png' },
    perfil: 'Vai preparar um churrasco para seis pessoas e procura praticidade sem desperdício.',
    status: 'Terminando uma tarefa', x: 33, y: 36, satisfacaoInicial: 55,
    situacao: 'ocupado', rotuloSituacao: 'TERMINANDO TAREFA',
    tempoOcupadoInicial: 3500,
    motivoOcupado: 'Está terminando uma coisa. Observe o momento antes de abordar.',
    descobertas: {
      d1: { chave: 'pessoas', rotulo: 'Churrasco para 6 pessoas' },
      d2: { chave: 'tempo', rotulo: 'Pouco tempo para preparar' },
      d3: { chave: 'desperdicio', rotulo: 'Quer evitar sobras' }
    },
    retornos: {
      d4: { chave: 'tempo', texto: 'Além do preço, isso ainda vai ser rápido de preparar?', opcaoExcelente: 'Entendo. Vou comparar o custo-benefício sem perder a praticidade que você precisa.', feedback: 'Você recuperou a informação sobre tempo e a conectou à objeção de preço.' },
      d5: { chave: 'pessoas', texto: 'A quantidade continua adequada para as seis pessoas?', opcaoExcelente: 'Sim. A opção continua dimensionada para seis pessoas; posso deixá-la definida para você decidir depois.', feedback: 'Você retomou quantidade e respeitou o tempo de decisão do cliente.' }
    },
    objetivo: 'Aprender a abordar, entender a necessidade e fechar sem pressionar.',
    licao: 'Respeite o momento, entenda quantidade, praticidade e orçamento antes de recomendar.',
    produtos: []
  }, [
    [
      'Oi! Você que está atendendo por aqui hoje?\n\n[VENDEDOR]: Sim! Posso te ajudar?\n\nLUCAS: Pode. Eu estava pensando em comprar algumas coisas para fazer um churrasco no fim de semana.\n\n[VENDEDOR]: Legal! É para quantas pessoas?\n\nLUCAS: Umas seis pessoas. Mas eu só estou dando uma olhada. Não quero comprar nada agora.',
      [
        'Tudo bem. Se precisar de alguma coisa, estou por aqui.',
        'Mas posso te mostrar algumas promoções?',
        'Você precisa comprar para o churrasco, então posso te ajudar.',
        'Se você não comprar agora, pode acabar ficando sem produto.'
      ], [10, 5, -5, -10], 'abordagem'
    ],
    [
      'Tranquilo. Na verdade, eu queria mesmo saber o que seria melhor para seis pessoas. Eu queria algo que fosse fácil de preparar. Não tenho muito tempo para ficar fazendo tudo.',
      [
        'Então vou te mostrar opções práticas que combinam com o churrasco.',
        'Você pode comprar qualquer carne e preparar do seu jeito.',
        'Nesse caso, talvez seja melhor comprar bastante coisa.',
        'Se você não tem tempo, churrasco talvez não seja uma boa ideia.'
      ], [10, 3, -3, -10], 'necessidade'
    ],
    [
      'E também não quero comprar demais e acabar sobrando.',
      [
        'Podemos pensar na quantidade de pessoas e escolher uma quantidade adequada.',
        'É melhor comprar um pouco a mais para garantir.',
        'Compra bastante e depois você vê o que faz com o restante.',
        'Então compra pouco, mesmo que não seja suficiente.'
      ], [10, 5, -5, -10], 'oferta'
    ],
    [
      'Gostei dessa opção, mas achei o preço um pouco alto.',
      [
        'Entendo. Posso verificar se existe alguma promoção ou outra opção com melhor custo-benefício.',
        'É um produto melhor, então acaba sendo mais caro.',
        'Mas o preço está normal.',
        'Se está caro, então não tem muito o que fazer.'
      ], [10, 5, 0, -10], 'objecao'
    ],
    [
      'Vou pensar e talvez compre mais perto do fim de semana.',
      [
        'Claro. Se quiser, podemos deixar a opção definida e você decide mais perto do fim de semana.',
        'Tudo bem, mas tenta não deixar para a última hora.',
        'Você deveria comprar agora.',
        'Se deixar para depois, provavelmente vai esquecer.'
      ], [10, 5, -5, -10], 'objecao'
    ],
    [
      'Tá, acho que vou levar essa opção mesmo.',
      [
        'Perfeito. Então vamos fechar essa opção para o seu churrasco.',
        'Boa escolha.',
        'Tem certeza?',
        'Finalmente decidiu.'
      ], [10, 5, 0, -10], 'fechamento', 'Valeu pela ajuda, [VENDEDOR].'
    ]
  ]),

  criarCliente({
    id: 'cliente2', nome: 'Marina', area: 'Desafio 2 · Descoberta', dificuldade: '⭐⭐',
    imagem: 'cliente2-v2.png',
    reacoes: { positiva: 'cliente2-reacao-positiva.png', negativa: 'cliente2-reacao-negativa.png' },
    perfil: 'Mora sozinha, tem restrições alimentares e procura um jantar prático.',
    status: 'Falando ao telefone', x: 14, y: 43, satisfacaoInicial: 52,
    situacao: 'telefone', rotuloSituacao: 'AO TELEFONE', tempoOcupadoInicial: 4200,
    motivoOcupado: 'Está encerrando uma ligação. Espere ela guardar o telefone antes de abordar.',
    descobertas: {
      d2: { chave: 'praticidade', rotulo: 'Chega em casa cansada' },
      d3: { chave: 'quantidade', rotulo: 'Mora sozinha' },
      d4: { chave: 'restricoes', rotulo: 'Tem restrições alimentares' }
    },
    retornos: {
      d5: { chave: 'restricoes', texto: 'E essa opção continua respeitando as minhas restrições?', opcaoExcelente: 'Vamos comparar o custo-benefício somente entre opções seguras para as suas restrições.', feedback: 'Você usou a restrição descoberta como critério, em vez de comparar apenas preços.' },
      d7: { chave: 'quantidade', texto: 'A embalagem não vai ser grande demais para uma pessoa?', opcaoExcelente: 'Não. Escolhemos uma quantidade adequada para uma pessoa, prática e sem desperdício.', feedback: 'Você confirmou a decisão retomando quantidade, rotina e desperdício.' }
    },
    objetivo: 'Descobrir necessidades, restrições e custo-benefício antes da oferta.',
    licao: 'Uma boa recomendação considera rotina, quantidade, restrições e preço.',
    produtos: []
  }, [
    [
      'Oi, [VENDEDOR]. Estou procurando alguma coisa para fazer um jantar hoje.\n\n[VENDEDOR]: Claro. Você já sabe o que gostaria de preparar?\n\nMARINA: Ainda não. Quero algo gostoso, mas também não quero passar muito tempo na cozinha. Você tem alguma sugestão?',
      [
        'Antes de sugerir, posso entender um pouco melhor o que você procura?',
        'Tenho várias. Posso te mostrar as mais vendidas.',
        'Depende do preço.',
        'Tem bastante coisa ali. Dá uma olhada.'
      ], [10, 5, 0, -10], 'pergunta'
    ],
    [
      'Quero algo prático. Vou chegar em casa cansada.',
      [
        'Então faz sentido procurar algo rápido de preparar.',
        'Você pode preparar qualquer produto rapidamente.',
        'Então compre uma quantidade maior.',
        'Se está cansada, talvez seja melhor pedir comida.'
      ], [10, 3, -3, -10], 'necessidade'
    ],
    [
      'E também não quero comprar muito. Moro sozinha.',
      [
        'Nesse caso, podemos procurar uma quantidade adequada para uma pessoa e evitar desperdício.',
        'É melhor levar uma quantidade maior e guardar.',
        'Pode levar a embalagem maior, porque o preço costuma compensar.',
        'Então pega qualquer uma.'
      ], [10, 5, -3, -10], 'necessidade'
    ],
    [
      'Eu tenho algumas restrições alimentares, então preciso tomar cuidado.',
      [
        'Claro. Vamos conferir as opções que atendem ao que você pode consumir.',
        'Acho que esse produto não tem problema.',
        'Você pode levar e conferir em casa.',
        'Isso não faz muita diferença.'
      ], [10, 3, -5, -10], 'necessidade'
    ],
    [
      'Gostei dessa opção, mas será que vale o preço?',
      [
        'Vamos comparar com outras opções e ver qual entrega o melhor custo-benefício para o que você precisa.',
        'É um pouco mais caro, mas é uma boa opção.',
        'O preço é esse mesmo.',
        'Se você gostou, vale a pena pagar.'
      ], [10, 5, 0, -5], 'objecao'
    ],
    [
      'Eu costumo comprar em outro lugar.',
      [
        'Entendo. O importante é encontrar uma opção que realmente faça sentido para você. Posso te mostrar o que temos aqui.',
        'Mas aqui também temos produtos bons.',
        'Você deveria experimentar a nossa loja.',
        'O outro lugar provavelmente não tem opções tão boas.'
      ], [10, 5, 3, -10], 'objecao'
    ],
    [
      'Tá bom, vou experimentar essa opção.',
      [
        'Ótimo. Acho que ela combina bem com o que você estava procurando.',
        'Boa escolha.',
        'Tem certeza?',
        'Então leva logo.'
      ], [10, 5, 0, -10], 'fechamento'
    ]
  ]),

  criarCliente({
    id: 'cliente3', nome: 'Rafael', area: 'Desafio 3 · Valor', dificuldade: '⭐⭐⭐',
    imagem: 'cliente3-v2.png',
    reacoes: { positiva: 'cliente3-reacao-positiva.png', negativa: 'cliente3-reacao-negativa.png' },
    perfil: 'Compra carnes para a semana, compara preços e já frequenta outra loja.',
    status: 'Conferindo preços', x: 52, y: 41, satisfacaoInicial: 49,
    situacao: 'livre', rotuloSituacao: 'DISPONÍVEL',
    descobertas: {
      d1: { chave: 'concorrencia', rotulo: 'Costuma comprar em outra loja' },
      d2: { chave: 'rotina', rotulo: 'Compra carnes para a semana' },
      d3: { chave: 'preparo', rotulo: 'Alterna preparos rápidos' }
    },
    retornos: {
      d7: { chave: 'rotina', texto: 'Mas essa opção funciona bem para a minha semana inteira?', opcaoExcelente: 'Funciona: ela combina com os preparos que você descreveu e permite variar durante a semana.', feedback: 'Você transformou a rotina descoberta em argumento de valor personalizado.' },
      d8: { chave: 'concorrencia', texto: 'E se eu comparar novamente com a loja onde costumo comprar?', opcaoExcelente: 'Compare com tranquilidade. O importante é a opção fazer sentido para sua rotina e seu orçamento.', feedback: 'Você respeitou a comparação do cliente e fechou sem pressionar.' }
    },
    objetivo: 'Construir valor considerando rotina, concorrência, quantidade e tempo.',
    licao: 'Valor aparece quando a oferta se conecta ao consumo real e respeita a comparação do cliente.',
    produtos: []
  }, [
    [
      'Você é quem está atendendo hoje?\n\n[VENDEDOR]: Sou eu. Como posso ajudar?\n\nRAFAEL: Estou procurando algumas carnes para a semana, mas normalmente compro em outro lugar. Não sei se vou comprar alguma coisa aqui hoje.',
      [
        'Sem problema. Posso entender o que você costuma comprar e, se fizer sentido, mostrar algumas opções.',
        'Posso te mostrar nossas promoções.',
        'Você pode encontrar produtos melhores aqui.',
        'Mas por que você não compra aqui?'
      ], [10, 5, 3, -10], 'abordagem'
    ],
    [
      'Normalmente compro carne moída e alguns cortes para a semana.',
      [
        'E você costuma preparar essas carnes de que forma?',
        'Então tenho algumas opções para você.',
        'A carne moída é uma boa escolha.',
        'Você deveria experimentar outros produtos.'
      ], [10, 5, 3, -5], 'pergunta'
    ],
    [
      'Carne moída eu uso durante a semana. Nos finais de semana gosto de fazer algo diferente.',
      [
        'Então podemos pensar em uma opção prática para a semana e outra para o fim de semana.',
        'Você pode levar mais de uma opção.',
        'Então pega duas carnes diferentes.',
        'É melhor comprar tudo igual.'
      ], [10, 5, 0, -5], 'necessidade'
    ],
    [
      'Mas o outro lugar onde compro costuma ter preços melhores.',
      [
        'Entendo. Vamos comparar as opções e ver qual apresenta o melhor custo-benefício para o que você procura.',
        'Aqui também temos preços bons.',
        'Preço não é tudo.',
        'Então compre lá.'
      ], [10, 5, 3, -10], 'objecao'
    ],
    [
      'Também não quero comprar muita coisa e depois ficar sobrando.',
      [
        'Podemos pensar no que você realmente consome durante a semana para evitar desperdício.',
        'É melhor levar um pouco a mais.',
        'Depois você congela.',
        'Pode comprar bastante, porque sempre dá para usar.'
      ], [10, 5, 3, -5], 'necessidade'
    ],
    [
      'Hoje estou meio sem tempo.',
      [
        'Sem problema. Posso ser [OBJETIVO] e te mostrar apenas as opções que fazem sentido.',
        'É rapidinho, então posso te mostrar algumas coisas.',
        'Você consegue esperar alguns minutos.',
        'Então deixa para outro dia.'
      ], [10, 5, -3, -5], 'abordagem'
    ],
    [
      'Tá, essa opção parece interessante.',
      [
        'Ela combina com o que você me contou. Se quiser, posso explicar rapidamente por que pensei nela.',
        'Eu também acho.',
        'É uma das melhores.',
        'Pode confiar em mim.'
      ], [10, 5, 3, -3], 'oferta'
    ],
    [
      'Vou levar. Quero testar para ver se gosto.',
      [
        'Perfeito. Depois você já vai saber se ela funciona para a sua rotina.',
        'Boa. Espero que goste.',
        'Você não vai se arrepender.',
        'Tenho certeza que vai gostar.'
      ], [10, 5, 3, 0], 'fechamento'
    ]
  ]),

  criarCliente({
    id: 'cliente4', nome: 'Camila', area: 'Desafio 4 · Objeções', dificuldade: '⭐⭐⭐⭐',
    imagem: 'cliente4-v2.png',
    reacoes: { positiva: 'cliente4-reacao-positiva.png', negativa: 'cliente4-reacao-negativa.png' },
    perfil: 'Tem pressa, restrições alimentares e precisa controlar gastos e desperdício.',
    status: 'Entre duas reuniões', x: 70, y: 34, satisfacaoInicial: 46,
    situacao: 'reuniao', rotuloSituacao: 'EM REUNIÃO', tempoOcupadoInicial: 5200,
    motivoOcupado: 'Está concluindo uma reunião. Aguarde ela se afastar do grupo antes de chamar.',
    descobertas: {
      d1: { chave: 'pressa', rotulo: 'Tem poucos minutos' },
      d2: { chave: 'praticidade', rotulo: 'Quase não cozinha na semana' },
      d3: { chave: 'restricoes', rotulo: 'Precisa conferir restrições' },
      d5: { chave: 'orcamento', rotulo: 'Tem limite de orçamento' }
    },
    retornos: {
      d6: { chave: 'pressa', texto: 'Você consegue resumir por que essa seria a melhor opção?', opcaoExcelente: 'Consigo: ela é prática, respeita suas restrições e cabe no orçamento que você informou.', feedback: 'Você sintetizou três critérios descobertos e respeitou a pressa da cliente.' },
      d8: { chave: 'orcamento', texto: 'Ainda estou preocupada em ultrapassar o que planejei gastar.', opcaoExcelente: 'Vamos manter o limite que você definiu e ajustar a quantidade sem perder praticidade.', feedback: 'Você reconheceu a objeção e retomou o orçamento informado pela cliente.' }
    },
    objetivo: 'Atender com objetividade e organizar múltiplos critérios de escolha.',
    licao: 'Rapidez não substitui escuta: organize praticidade, restrições, quantidade e orçamento.',
    produtos: []
  }, [
    [
      'Oi. Você pode me ajudar rapidinho?\n\n[VENDEDOR]: Claro. O que você está procurando?\n\nCAMILA: Algumas coisas para a semana, mas estou com bastante pressa.',
      [
        'Claro. Vou ser [OBJETIVO] e entender primeiro o que você precisa.',
        'Pode deixar que vou tentar ser [RAPIDO].',
        'Tenho várias opções para te mostrar.',
        'É só um minutinho, prometo.'
      ], [10, 5, 3, -5], 'abordagem'
    ],
    [
      'Preciso de coisas práticas. Durante a semana quase não tenho tempo para cozinhar.',
      [
        'Entendi. Então o mais importante é praticidade. Você costuma preparar as refeições de que forma?',
        'Então produtos prontos seriam melhores.',
        'Tenho alguns produtos rápidos.',
        'Você deveria cozinhar no fim de semana.'
      ], [10, 5, 3, -10], 'necessidade'
    ],
    [
      'Eu também preciso tomar cuidado com alguns ingredientes.',
      [
        'Entendi. Vamos conferir as opções que se encaixam no que você pode consumir.',
        'Acredito que essa opção seja tranquila.',
        'Você pode conferir depois.',
        'Acho que não precisa se preocupar tanto.'
      ], [10, 3, -5, -10], 'necessidade'
    ],
    [
      'Gostei, mas estou tentando não gastar muito essa semana.',
      [
        'Entendo. Podemos procurar uma alternativa que fique dentro do que você pretende gastar.',
        'Posso mostrar uma opção mais barata.',
        'Essa é a melhor opção mesmo sendo mais cara.',
        'Se está caro, não tem muito o que fazer.'
      ], [10, 5, 3, -10], 'objecao'
    ],
    [
      'Eu não conheço muito esses produtos.',
      [
        'Sem problema. Posso explicar de forma simples o que muda entre as opções para você decidir.',
        'Você pode experimentar.',
        'Esse é um produto bastante conhecido.',
        'É fácil, você vai gostar.'
      ], [10, 5, 3, -3], 'pergunta'
    ],
    [
      'Qual deles você escolheria para uma rotina corrida?',
      [
        'Eu escolheria este porque atende ao que você me contou sobre praticidade e tempo.',
        'Esse aqui parece uma boa opção.',
        'O mais barato.',
        'O mais vendido.'
      ], [10, 5, 3, 0], 'oferta'
    ],
    [
      'Mas será que essa quantidade não é demais?',
      [
        'Podemos ajustar a quantidade ao seu consumo para evitar desperdício.',
        'Você pode guardar o restante.',
        'É melhor sobrar do que faltar.',
        'Leva tudo de uma vez.'
      ], [10, 5, 3, -5], 'necessidade'
    ],
    [
      'Mesmo assim, achei um pouco caro.',
      [
        'Entendo. Pelo que você me contou, podemos comparar com uma alternativa mais econômica e ver qual atende melhor sua rotina.',
        'Mas esse produto tem qualidade.',
        'O preço está normal.',
        'Você já chegou até aqui, então pode levar.'
      ], [10, 5, 0, -10], 'objecao'
    ],
    [
      'Tá. Acho que essa opção faz sentido.',
      [
        'Perfeito. Então vamos fechar essa opção.',
        'Boa escolha.',
        'Tem certeza?',
        'Finalmente.'
      ], [10, 5, 0, -10], 'fechamento', 'Obrigada, [VENDEDOR]. Você conseguiu ser [RAPIDO] mesmo.'
    ]
  ]),

  criarCliente({
    id: 'cliente5', nome: 'André', area: 'Desafio 5 · Atendimento completo', dificuldade: '⭐⭐⭐⭐⭐',
    imagem: 'cliente5.png',
    reacoes: { positiva: 'cliente5-reacao-positiva.png', negativa: 'cliente5-reacao-negativa.png' },
    perfil: 'Compra para quatro pessoas, tem pressa e precisa controlar o orçamento.',
    status: 'Disponível por poucos minutos', x: 87, y: 39, satisfacaoInicial: 42,
    situacao: 'livre', rotuloSituacao: 'DISPONÍVEL',
    descobertas: {
      d1: { chave: 'orcamento', rotulo: 'Precisa controlar o orçamento' },
      d2: { chave: 'familia', rotulo: 'Compra para 4 pessoas' },
      d3: { chave: 'frequencia', rotulo: 'Cozinha todos os dias' },
      d6: { chave: 'decisao', rotulo: 'Divide a decisão em casa' }
    },
    retornos: {
      d7: { chave: 'familia', texto: 'Essa quantidade realmente atende quatro pessoas durante a semana?', opcaoExcelente: 'Sim. Calculei a quantidade para quatro pessoas e para a frequência de preparo que você contou.', feedback: 'Você usou tamanho da família e rotina para justificar a quantidade.' },
      d9: { chave: 'decisao', texto: 'Preciso conseguir explicar essa escolha para minha família antes de decidir.', opcaoExcelente: 'Claro. Vou resumir quantidade, custo e benefícios para você decidir junto com sua família.', feedback: 'Você respeitou quem participa da decisão e facilitou a próxima conversa do cliente.' }
    },
    objetivo: 'Juntar descoberta, quantidade, valor, confiança e fechamento.',
    licao: 'Atendimento completo respeita tempo, orçamento, família e autoridade de decisão.',
    produtos: []
  }, [
    [
      'Oi. Estou procurando algumas coisas para casa.\n\n[VENDEDOR]: Claro. Você já sabe o que precisa?\n\nANDRÉ: Mais ou menos. Quero comprar para a semana, mas preciso controlar o orçamento.',
      [
        'Entendi. Posso fazer algumas perguntas para entender o que você realmente precisa?',
        'Posso te mostrar algumas opções mais baratas.',
        'Tenho algumas promoções.',
        'Então vamos direto para os produtos baratos.'
      ], [10, 5, 3, -5], 'pergunta'
    ],
    [
      'Em casa somos quatro pessoas e normalmente fazemos comida todos os dias.',
      [
        'Então podemos pensar no consumo da semana para calcular uma quantidade que faça sentido.',
        'Nesse caso, é melhor comprar bastante.',
        'Quatro pessoas consomem bastante.',
        'Então pega a maior embalagem.'
      ], [10, 5, 3, -5], 'necessidade'
    ],
    [
      'Mas eu estou com bastante pressa hoje.',
      [
        'Tudo bem. Vou focar apenas no que atende às suas necessidades.',
        'Vou tentar ser [RAPIDO].',
        'Tenho bastante coisa para mostrar.',
        'Então você pode voltar outro dia.'
      ], [10, 5, 3, -5], 'abordagem'
    ],
    [
      'Também estou tentando economizar.',
      [
        'Entendo. Podemos montar uma opção que respeite seu orçamento sem levar produtos desnecessários.',
        'Tenho algumas opções mais baratas.',
        'Você pode comprar só o essencial.',
        'Qualidade custa mais.'
      ], [10, 5, 3, -5], 'objecao'
    ],
    [
      'Eu vi um produto parecido por um preço menor.',
      [
        'Entendo. Vamos comparar as opções e ver qual apresenta o melhor custo-benefício para o que você precisa.',
        'Mas esse produto também tem qualidade.',
        'Pode ser parecido, mas não é igual.',
        'Então compra o outro.'
      ], [10, 5, 3, -10], 'objecao'
    ],
    [
      'Eu também preciso ter certeza de que vou gostar antes de comprar uma quantidade maior.',
      [
        'Faz sentido. Podemos começar com uma quantidade menor e você avalia se funciona para sua rotina.',
        'Você pode experimentar.',
        'Acho difícil você não gostar.',
        'Pode comprar bastante porque é um produto bom.'
      ], [10, 5, 3, -5], 'necessidade'
    ],
    [
      'Tá. Essa opção parece boa.',
      [
        'Pelo que você me contou, ela atende ao seu orçamento e à quantidade que sua família consome.',
        'Ela é uma boa opção.',
        'É uma das mais vendidas.',
        'Eu compraria essa.'
      ], [10, 5, 3, 0], 'oferta'
    ],
    [
      'Mas eu preciso conversar com minha esposa antes de decidir.',
      [
        'Claro. Posso te passar as informações principais para você conversar com ela e vocês decidirem juntos.',
        'Tudo bem, você pode perguntar para ela.',
        'Mas você pode decidir sozinho.',
        'Se esperar, talvez perca a oportunidade.'
      ], [10, 5, -5, -10], 'objecao'
    ],
    [
      'Ela provavelmente vai perguntar quanto custa e quanto vamos levar.',
      [
        'Então posso deixar claro o preço, a quantidade e por que essa opção atende ao que vocês precisam.',
        'É só falar que vale a pena.',
        'Fala que estava em promoção.',
        'Diz que eu recomendei.'
      ], [10, 5, -5, -3], 'oferta'
    ],
    [
      'Na verdade, pensando bem, acho que já consigo decidir.',
      [
        'Perfeito. Então vamos fechar o que faz sentido para vocês.',
        'Boa.',
        'Tem certeza?',
        'Eu sabia que você ia comprar.'
      ], [10, 5, 0, -5], 'fechamento', 'Valeu, [VENDEDOR]. Você realmente entendeu o que eu precisava.'
    ]
  ])
];
