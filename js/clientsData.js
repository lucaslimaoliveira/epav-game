const feedbackPorResultado = {
  excelente: 'Excelente escolha: você ouviu o cliente e respondeu exatamente ao que ele precisava.',
  boa: 'Boa resposta. Ela ajuda a conversa, mas ainda poderia considerar melhor a necessidade apresentada.',
  neutra: 'Resposta neutra. Ela não prejudica o atendimento, mas também não cria valor para o cliente.',
  ruim: 'Essa resposta enfraquece o atendimento porque ignora ou pressiona a necessidade do cliente.'
};

function criarNo(texto, escolhas, pontos, categoria, proximoNo, resposta = '') {
  return {
    texto,
    opcoes: escolhas.map((escolha, indice) => {
      const valor = pontos[indice];
      const nivel = valor >= 10 ? 'excelente' : valor > 0 ? 'boa' : valor === 0 ? 'neutra' : 'ruim';
      return {
        texto: escolha,
        categoria,
        qualidade: nivel,
        efeitoSatisfacao: valor >= 10 ? 6 : valor > 0 ? 3 : valor === 0 ? 0 : valor <= -10 ? -7 : -4,
        pontos: valor,
        correta: valor === 10,
        feedback: feedbackPorResultado[nivel],
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
    dialogo[atual] = criarNo(decisao[0], decisao[1], decisao[2], decisao[3], proximo, decisao[4] || '');
  });
  return { ...configuracao, decisoes: decisoes.length, noInicial: 'd1', dialogo };
}

const clientes = [
  criarCliente({
    id: 'cliente1', nome: 'Lucas', area: 'Desafio 1 · Abordagem', dificuldade: '⭐',
    perfil: 'Vai preparar um churrasco para seis pessoas e procura praticidade sem desperdício.',
    status: 'Terminando uma tarefa', x: 14, y: 43, satisfacaoInicial: 55,
    tempoOcupadoInicial: 3500,
    motivoOcupado: 'Está terminando uma coisa. Observe o momento antes de abordar.',
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
    perfil: 'Mora sozinha, tem restrições alimentares e procura um jantar prático.',
    status: 'Organizando a agenda', x: 33, y: 36, satisfacaoInicial: 52,
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
    perfil: 'Compra carnes para a semana, compara preços e já frequenta outra loja.',
    status: 'Conferindo preços', x: 52, y: 41, satisfacaoInicial: 49,
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
        'Sem problema. Posso ser objetivo e te mostrar apenas as opções que fazem sentido.',
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
    perfil: 'Tem pressa, restrições alimentares e precisa controlar gastos e desperdício.',
    status: 'Entre duas reuniões', x: 70, y: 34, satisfacaoInicial: 46,
    objetivo: 'Atender com objetividade e organizar múltiplos critérios de escolha.',
    licao: 'Rapidez não substitui escuta: organize praticidade, restrições, quantidade e orçamento.',
    produtos: []
  }, [
    [
      'Oi. Você pode me ajudar rapidinho?\n\n[VENDEDOR]: Claro. O que você está procurando?\n\nCAMILA: Algumas coisas para a semana, mas estou com bastante pressa.',
      [
        'Claro. Vou ser objetiva e entender primeiro o que você precisa.',
        'Pode deixar que vou tentar ser rápida.',
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
      ], [10, 5, 0, -10], 'fechamento', 'Obrigada, [VENDEDOR]. Você conseguiu ser rápido mesmo.'
    ]
  ]),

  criarCliente({
    id: 'cliente5', nome: 'André', area: 'Desafio 5 · Atendimento completo', dificuldade: '⭐⭐⭐⭐⭐',
    perfil: 'Compra para quatro pessoas, tem pressa e precisa controlar o orçamento.',
    status: 'Disponível por poucos minutos', x: 87, y: 39, satisfacaoInicial: 42,
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
        'Vou tentar ser rápido.',
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
