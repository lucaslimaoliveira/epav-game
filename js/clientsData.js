const feedbackPorCategoria = {
  abordagem: ['Você respeitou o momento e abriu espaço para conversar.', 'A abordagem criou pressão antes de entender o cliente.'],
  pergunta: ['A pergunta aprofundou a necessidade sem presumir a resposta.', 'A pergunta conduziu cedo demais ou não investigou a necessidade real.'],
  necessidade: ['Você conectou as pistas e confirmou a necessidade.', 'A resposta presumiu a solução antes de compreender todo o contexto.'],
  oferta: ['A oferta foi ligada ao que o cliente realmente valoriza.', 'A oferta priorizou o produto, não a necessidade revelada.'],
  objecao: ['Você acolheu a objeção e respondeu com um critério concreto.', 'A objeção foi minimizada ou respondida sem evidência.'],
  fechamento: ['O fechamento confirmou o próximo passo sem pressionar.', 'O fechamento criou pressão e enfraqueceu a confiança construída.']
};

function criarNo(texto, escolhas, melhores, categoria, proximoNo, respostas = []) {
  return {
    texto,
    opcoes: escolhas.map((escolha, indice) => {
      const correta = melhores.includes(indice);
      const resposta = Array.isArray(respostas) ? respostas[indice] : respostas;
      return {
        texto: escolha,
        categoria,
        qualidade: correta ? 'excelente' : 'ruim',
        efeitoSatisfacao: correta ? 6 : -5,
        pontos: correta ? 10 : 0,
        correta,
        feedback: feedbackPorCategoria[categoria][correta ? 0 : 1],
        resposta: resposta || '',
        proximoNo
      };
    })
  };
}

const clientes = [
  {
    id: 'cliente1',
    nome: 'Lucas',
    area: 'Desafio 1 · Abordagem',
    dificuldade: '⭐',
    perfil: 'Mora sozinho e procura refeições práticas para a semana.',
    status: 'Terminando uma tarefa',
    x: 14,
    y: 43,
    satisfacaoInicial: 55,
    tempoOcupadoInicial: 3500,
    motivoOcupado: 'Está terminando uma coisa. Observe o momento antes de abordar.',
    objetivo: 'Aprender a abordar, fazer perguntas e entender a necessidade.',
    decisoes: 6,
    licao: 'Aborde com respeito, investigue a rotina e só então relacione produto, praticidade e preço.',
    produtos: [
      { nome: 'Porção Prática', preco: 24.90, caracteristica: 'preparo rápido e quantidade individual' },
      { nome: 'Carne Versátil', preco: 22.90, caracteristica: 'serve diferentes refeições' }
    ],
    noInicial: 'd1',
    dialogo: {
      d1: criarNo(
        'Opa... você é do EPAV, né? Pode falar. Só estou terminando uma coisa aqui.',
        [
          'Vou ser rápido. Quero te mostrar alguns produtos que estão vendendo bastante.',
          'Você está ocupado? Se estiver, posso voltar depois.',
          'Preciso que você me diga o que costuma comprar.',
          'Você tem que comprar alguma coisa hoje?'
        ],
        [1], 'abordagem', 'd2',
        [
          'Tudo bem, mas eu ainda não sei se tenho interesse.',
          'Estou quase terminando. Pode falar.',
          'Calma... nem começamos a conversar.',
          'Não necessariamente. Só estou ouvindo.'
        ]
      ),
      d2: criarNo(
        'Moro sozinho. Quando estou tranquilo, cozinho; durante a semana é complicado e prefiro alguma coisa prática.',
        [
          'Então você precisa de coisas rápidas para os dias mais corridos?',
          'Você deveria comprar refeições prontas.',
          'Qual é o produto mais barato que você compra?',
          'Você não gosta de cozinhar?'
        ],
        [0], 'necessidade', 'd3'
      ),
      d3: criarNo(
        'Exatamente. Quando chego cansado, não quero passar muito tempo na cozinha. Praticidade importa, mas também não quero gastar muito.',
        [
          'Se tivesse que escolher, você prefere economizar ou ganhar tempo?',
          'Você costuma gastar quanto por refeição?',
          'Você compra bastante carne?',
          'Quer que eu mostre logo alguns produtos?'
        ],
        [0, 1], 'pergunta', 'd4'
      ),
      d4: criarNo(
        'Normalmente tento não passar muito de R$ 25 por refeição. Quero algo fácil de preparar e que possa usar em refeições diferentes.',
        [
          'É um produto muito bom e todo mundo compra.',
          'Como você quer praticidade, essa opção é fácil de preparar e pode ser usada em mais de uma refeição.',
          'Está em promoção, então é melhor comprar agora.',
          'É mais caro, mas vale a pena.'
        ],
        [1], 'oferta', 'd5'
      ),
      d5: criarNo(
        'Aí sim. Gosto de produto que não serve só para uma coisa. Mas, dependendo do preço, talvez eu não leve.',
        [
          'Mas é barato.',
          'Se você não quiser gastar, pode escolher qualquer outra coisa.',
          'Entendo. Como seu limite é R$ 25 por refeição, podemos pensar em uma quantidade que faça sentido.',
          'Você está preocupado demais com preço.'
        ],
        [2], 'objecao', 'd6'
      ),
      d6: criarNo(
        'Assim fica mais fácil. Não quero comprar sem saber quanto vou gastar. Essa opção faz sentido para minha rotina e acho que vou levar.',
        [
          'Então compra logo.',
          'Quer que eu te ajude a escolher a quantidade ideal para não comprar demais?',
          'Você tem certeza?',
          'Eu sabia que você ia gostar.'
        ],
        [1], 'fechamento', null,
        [
          'Prefiro decidir sem pressão.',
          'Pode ser. Quero começar com uma quantidade pequena. Valeu pela ajuda; você entendeu o que eu precisava.',
          'Eu estava, mas agora fiquei em dúvida.',
          'Gostei, mas não precisa decidir por mim.'
        ]
      )
    }
  },
  {
    id: 'cliente2',
    nome: 'Marina',
    area: 'Desafio 2 · Descoberta',
    dificuldade: '⭐⭐',
    perfil: 'Tem uma rotina corrida e quer reduzir gastos com delivery.',
    status: 'Organizando a agenda',
    x: 33,
    y: 36,
    satisfacaoInicial: 52,
    objetivo: 'Descobrir necessidades específicas e relacioná-las ao produto.',
    decisoes: 7,
    licao: 'Perguntas abertas transformam uma vontade vaga em critérios claros de escolha.',
    produtos: [
      { nome: 'Frango Porcionado', preco: 34.90, caracteristica: 'versátil e fácil de preparar' },
      { nome: 'Kit Semanal', preco: 59.90, caracteristica: 'porções para várias refeições' }
    ],
    noInicial: 'd1',
    dialogo: {
      d1: criarNo(
        'Oi! Você é o aluno que está atendendo o pessoal hoje? Não estou procurando nada específico.',
        [
          'Então vou te mostrar alguns produtos até você encontrar um.',
          'Tudo bem. Posso entender primeiro como é sua rotina e ver se aparece algo que faça sentido?',
          'Mas você precisa comprar alguma coisa?',
          'Você pode pelo menos olhar as promoções?'
        ],
        [1], 'abordagem', 'd2'
      ),
      d2: criarNo(
        'Minha rotina é bem corrida. Trabalho o dia inteiro, chego tarde e às vezes peço comida, mas estou tentando diminuir isso.',
        [
          'Por quê?',
          'Você deveria cozinhar mais.',
          'Então você precisa de comida congelada.',
          'Quanto você gasta com delivery?'
        ],
        [0], 'pergunta', 'd3'
      ),
      d3: criarNo(
        'Porque acaba ficando caro. Às vezes peço só porque estou cansada; não é que eu não goste de cozinhar.',
        [
          'Você precisa de alguma coisa que possa deixar preparada antes?',
          'Então compre qualquer coisa congelada.',
          'Você não tem tempo nenhum?',
          'Quer ver carnes?'
        ],
        [0], 'necessidade', 'd4'
      ),
      d4: criarNo(
        'Se eu pudesse preparar algo no fim de semana e usar durante a semana, seria ótimo. Gosto de frango porque combina com arroz, salada e massa.',
        [
          'Então vou te mostrar o frango mais barato.',
          'Você prefere peito, coxa ou tanto faz?',
          'Frango é o que todo mundo compra.',
          'Você gosta de frango mesmo?'
        ],
        [1], 'pergunta', 'd5'
      ),
      d5: criarNo(
        'Normalmente peito. É mais versátil. Preço importa, mas praticidade é prioridade.',
        [
          'Esse produto é o melhor.',
          'Esse produto pode ser usado em preparos diferentes e ajuda a deixar as refeições da semana mais práticas.',
          'Esse produto está na promoção.',
          'Todo mundo gosta dele.'
        ],
        [1], 'oferta', 'd6'
      ),
      d6: criarNo(
        'Gostei da ideia, mas tenho medo de comprar e acabar não usando.',
        [
          'Não vai acontecer.',
          'Então não compra.',
          'Podemos começar com uma quantidade menor e você vê se encaixa na sua rotina.',
          'Você precisa experimentar para saber.'
        ],
        [2], 'objecao', 'd7'
      ),
      d7: criarNo(
        'Faz sentido. Assim não corro tanto risco e, se funcionar, já sei o que comprar da próxima vez.',
        [
          'Pode comprar?',
          'Quer que eu monte uma sugestão pensando nas suas refeições da semana?',
          'Você vai levar ou não?',
          'Acho que já conversamos demais.'
        ],
        [1], 'fechamento', null,
        [
          'Ainda preciso entender melhor a sugestão.',
          'Quero sim. Obrigada; eu nem procurava nada e agora sei o que pode facilitar minha semana.',
          'Não precisa me pressionar.',
          'Então é melhor encerrarmos por aqui.'
        ]
      )
    }
  },
  {
    id: 'cliente3',
    nome: 'Rafael',
    area: 'Desafio 3 · Valor',
    dificuldade: '⭐⭐⭐',
    perfil: 'Pesquisa preço e compara quantidade e rendimento.',
    status: 'Conferindo preços',
    x: 52,
    y: 41,
    satisfacaoInicial: 49,
    objetivo: 'Trabalhar preço, comparação e construção de valor.',
    decisoes: 8,
    licao: 'Comparar valor exige considerar quantidade, rendimento, uso real e desperdício.',
    produtos: [
      { nome: 'Carne Moída Família', preco: 42.90, caracteristica: 'quantidade adequada para três pessoas' },
      { nome: 'Porção Compacta', preco: 29.90, caracteristica: 'menor volume e menor rendimento' }
    ],
    noInicial: 'd1',
    dialogo: {
      d1: criarNo(
        'Fala! Você está vendendo alguma coisa? Já vou avisando: eu pesquiso preço antes de comprar.',
        [
          'Mas nossos produtos têm qualidade.',
          'Você está certo. Posso entender o que costuma comparar antes de falar de produto?',
          'Então você provavelmente não vai comprar.',
          'Tenho algumas promoções.'
        ],
        [1], 'abordagem', 'd2'
      ),
      d2: criarNo(
        'Comparo principalmente preço e quantidade. Algumas vezes compro para mim e para minha família.',
        [
          'Quantas pessoas?',
          'Então você precisa comprar bastante.',
          'Sua família gosta de carne?',
          'Você compra toda semana?'
        ],
        [0], 'pergunta', 'd3'
      ),
      d3: criarNo(
        'Normalmente três pessoas. Cozinhamos à noite e compramos carne moída com frequência porque é fácil de usar.',
        [
          'Então compre a maior embalagem.',
          'Você usa a carne moída em quais pratos?',
          'Quanto você paga normalmente?',
          'Tem uma promoção de carne.'
        ],
        [1], 'pergunta', 'd4'
      ),
      d4: criarNo(
        'Usamos em hambúrguer, molho e recheio. Quando uma embalagem é maior, às vezes acaba sobrando.',
        [
          'Então você deveria comprar a menor.',
          'O preço da embalagem não basta: também precisamos pensar em quanto vocês realmente vão usar.',
          'É por isso que comprar barato pode ser ruim.',
          'Então preço não importa.'
        ],
        [1], 'necessidade', 'd5'
      ),
      d5: criarNo(
        'Exatamente. Procuro um tamanho adequado para três pessoas e que possa ser usado em vários pratos.',
        [
          'Essa é a mais barata.',
          'Essa opção tem uma quantidade que pode funcionar para três pessoas e é versátil.',
          'Essa é a mais vendida.',
          'Essa é a melhor que temos.'
        ],
        [1], 'oferta', 'd6'
      ),
      d6: criarNo(
        'Ela custa R$ 42,90? Encontrei uma parecida mais barata.',
        [
          'Mas essa aqui é melhor.',
          'Então compre a outra.',
          'Além do preço, compare quantidade e rendimento para ver qual realmente compensa para sua família.',
          'Essa diferença não é grande.'
        ],
        [2], 'objecao', 'd7'
      ),
      d7: criarNo(
        'Eu realmente comparo mais pelo quanto rende. Mesmo assim, não sei se vale a pena.',
        [
          'Vale sim.',
          'O que faria essa compra valer a pena para você?',
          'Você está pensando demais.',
          'Posso te dar um desconto.'
        ],
        [1], 'objecao', 'd8'
      ),
      d8: criarNo(
        'Valeria se eu conseguisse usar tudo sem sobrar e tivesse um preço bom por quantidade. Essa opção parece atender melhor.',
        [
          'Vai levar?',
          'Se você quiser, podemos comparar mais uma opção antes de decidir.',
          'Eu acho que você deveria levar.',
          'Essa é sua última chance.'
        ],
        [1], 'fechamento', null,
        [
          'Não precisa me apressar.',
          'Não precisa. Agora entendi a diferença e vou levar. Você me ajudou a comparar em vez de só tentar convencer.',
          'Quero tomar minha própria decisão.',
          'Nesse caso, prefiro não levar.'
        ]
      )
    }
  },
  {
    id: 'cliente4',
    nome: 'Camila',
    area: 'Desafio 4 · Objeções',
    dificuldade: '⭐⭐⭐⭐',
    perfil: 'Tem pouco tempo, pouco espaço e várias preocupações de compra.',
    status: 'Entre duas reuniões',
    x: 70,
    y: 34,
    satisfacaoInicial: 46,
    objetivo: 'Lidar com múltiplas objeções e manter o foco na necessidade.',
    decisoes: 9,
    licao: 'Múltiplas objeções ficam mais simples quando você organiza os critérios do cliente.',
    produtos: [
      { nome: 'Kit Compacto', preco: 74.90, caracteristica: 'porções variadas que ocupam pouco espaço' },
      { nome: 'Kit Econômico', preco: 59.90, caracteristica: 'menor preço e embalagem maior' }
    ],
    noInicial: 'd1',
    dialogo: {
      d1: criarNo(
        'Você pode falar, mas já adianto que estou com pouco tempo.',
        [
          'Qual produto você quer?',
          'Antes de falar de produto, o que costuma ser mais difícil para você ao comprar comida?',
          'Então vou mostrar só uma promoção.',
          'Você pode voltar quando estiver livre.'
        ],
        [1], 'abordagem', 'd2'
      ),
      d2: criarNo(
        'Planejamento. Compro coisas sem pensar muito e depois percebo que faltou alguma coisa.',
        [
          'Você precisa fazer uma lista.',
          'Isso acontece porque você esquece ou porque não sabe o que vai precisar?',
          'Então compre mais produtos.',
          'Eu também sou assim.'
        ],
        [1], 'pergunta', 'd3'
      ),
      d3: criarNo(
        'Mais porque não sei o que vou usar durante a semana. Também não gosto de ficar muito tempo preparando comida.',
        [
          'Então você quer praticidade.',
          'Você cozinha todos os dias?',
          'Qual produto você mais compra?',
          'Então você precisa de congelados.'
        ],
        [1], 'pergunta', 'd4'
      ),
      d4: criarNo(
        'Cozinho talvez três vezes por semana. Nos outros dias como fora ou peço algo. Produtos armazenáveis ajudariam, mas não quero encher meu freezer.',
        [
          'Então compre pouco.',
          'Quanto espaço você costuma ter disponível?',
          'Esse produto ocupa pouco espaço.',
          'Mas vale a pena.'
        ],
        [1], 'pergunta', 'd5'
      ),
      d5: criarNo(
        'Meu freezer não é muito grande e tenho outras coisas. Quantidade e espaço importam. E provavelmente vai ficar caro.',
        [
          'Não vai.',
          'Qual valor você considera confortável para essa compra?',
          'É um pouco caro mesmo.',
          'Tem produtos mais baratos.'
        ],
        [1], 'objecao', 'd6'
      ),
      d6: criarNo(
        'Não queria gastar mais de R$ 80, mas também não quero comprar só porque está dentro do orçamento.',
        [
          'Claro, mas está barato.',
          'Concordo. O produto precisa fazer sentido para sua rotina também.',
          'Então é melhor não comprar.',
          'Você é difícil de convencer.'
        ],
        [1], 'objecao', 'd7'
      ),
      d7: criarNo(
        'Exatamente. Precisamos considerar espaço, praticidade e valor. Qual opção você mostraria?',
        [
          'Mostrar o produto mais barato.',
          'Mostrar o produto que melhor atende à rotina explicada.',
          'Mostrar o produto mais vendido.',
          'Mostrar o produto com maior embalagem.'
        ],
        [1], 'oferta', 'd8'
      ),
      d8: criarNo(
        'Esse parece interessante. Pode ser usado em preparos diferentes sem uma quantidade enorme, mas não sei se vou gostar.',
        [
          'Você só vai saber se experimentar.',
          'Podemos começar com uma quantidade menor e avaliar se combina com sua rotina.',
          'Tenho certeza de que você vai gostar.',
          'É um dos mais vendidos.'
        ],
        [1], 'objecao', 'd9'
      ),
      d9: criarNo(
        'Assim fico mais confortável. A opção menor resolve parte do problema, ocupa pouco espaço e não passa do valor que eu queria.',
        [
          'Então pode finalizar.',
          'Quer levar essa opção menor para testar primeiro?',
          'Você vai comprar ou não?',
          'Eu sabia que funcionaria.'
        ],
        [1], 'fechamento', null,
        [
          'Ainda quero confirmar a decisão.',
          'Vou testar. Gostei da conversa; você não ficou tentando empurrar produto.',
          'Com essa pressão, prefiro não comprar.',
          'Funcionou porque você ouviu, não porque já sabia.'
        ]
      )
    }
  },
  {
    id: 'cliente5',
    nome: 'André',
    area: 'Desafio 5 · Atendimento completo',
    dificuldade: '⭐⭐⭐⭐⭐',
    perfil: 'Questiona preço, quantidade, comparação e a própria necessidade.',
    status: 'Disponível por poucos minutos',
    x: 87,
    y: 39,
    satisfacaoInicial: 42,
    objetivo: 'Juntar tudo o que foi aprendido nos atendimentos anteriores.',
    decisoes: 10,
    licao: 'Atendimento de verdade começa pela escuta e sustenta cada recomendação nos critérios do cliente.',
    produtos: [
      { nome: 'Porção Bovina Individual', preco: 39.90, caracteristica: 'rápida, versátil e sem desperdício' },
      { nome: 'Kit Bovino Família', preco: 69.90, caracteristica: 'maior volume e menor preço por quilo' }
    ],
    noInicial: 'd1',
    dialogo: {
      d1: criarNo(
        'Você é do EPAV? Pode falar, mas vou ser sincero: não estou muito interessado em comprar nada hoje.',
        [
          'Tudo bem, então vou procurar outra pessoa.',
          'Posso entender o que você procura e, se não fizer sentido, paramos por aqui.',
          'Mas você precisa conhecer os produtos.',
          'Tem certeza? Temos promoções.'
        ],
        [1], 'abordagem', 'd2'
      ),
      d2: criarNo(
        'Minha rotina é corrida. Às vezes cozinho e às vezes compro pronto.',
        [
          'Então você precisa de comida pronta.',
          'Quando compra pronto, normalmente é por falta de tempo ou por praticidade?',
          'Quanto você gasta?',
          'Você não gosta de cozinhar?'
        ],
        [1], 'pergunta', 'd3'
      ),
      d3: criarNo(
        'É mais por falta de tempo. Gosto de cozinhar, só não quero passar duas horas fazendo comida.',
        [
          'Então você precisa de algo rápido.',
          'Quanto tempo você considera razoável para preparar uma refeição?',
          'Você gosta de carne?',
          'Quer ver algumas opções?'
        ],
        [1], 'pergunta', 'd4'
      ),
      d4: criarNo(
        'Uns 30 minutos, no máximo. Durante a semana preparo só para mim e prefiro carne bovina.',
        [
          'Então vou te mostrar carne bovina.',
          'Você prefere uma carne rápida de preparar ou aceita esperar mais, desde que seja boa?',
          'Você compra carne toda semana?',
          'Qual é a carne mais barata?'
        ],
        [1], 'necessidade', 'd5'
      ),
      d5: criarNo(
        'Quero algo rápido e não quero desperdiçar comida. A quantidade também é muito importante.',
        [
          'Mostrar a opção mais cara.',
          'Mostrar uma opção que atenda rapidez, quantidade adequada e versatilidade.',
          'Mostrar a maior embalagem.',
          'Mostrar a promoção do dia.'
        ],
        [1], 'oferta', 'd6'
      ),
      d6: criarNo(
        'A opção custa R$ 39,90? Caramba. Consigo encontrar carne mais barata.',
        [
          'Mas essa é melhor.',
          'Existem opções mais baratas. Vamos comparar quantidade, praticidade e quanto você realmente vai usar.',
          'A diferença não é tão grande.',
          'Então compra a mais barata.'
        ],
        [1], 'objecao', 'd7'
      ),
      d7: criarNo(
        'Ainda acho caro. Valeria a pena se eu usasse tudo, mas essa embalagem talvez seja grande demais para mim.',
        [
          'Você pode congelar.',
          'Talvez essa não seja a melhor. Posso procurar uma quantidade menor que ainda atenda ao que você precisa.',
          'Você pode comprar mesmo assim.',
          'Não é tão grande.'
        ],
        [1], 'objecao', 'd8'
      ),
      d8: criarNo(
        'Essa resposta eu gostei. A outra opção funciona melhor para uma pessoa, mas é mais cara por quilo.',
        [
          'Sim, mas é melhor.',
          'Por quilo fica mais cara, mas podemos comparar quanto você vai usar e quanto vai sobrar.',
          'Não precisa olhar o preço por quilo.',
          'Essa é a que eu recomendo.'
        ],
        [1], 'objecao', 'd9'
      ),
      d9: criarNo(
        'Pensando assim, talvez compense. Ainda estou em dúvida se realmente preciso comprar agora.',
        [
          'Você deveria comprar.',
          'Não faz sentido comprar só por comprar. Mas pode valer a pena se resolver seu problema durante a semana.',
          'Mas você já gostou.',
          'Posso te dar um desconto.'
        ],
        [1], 'objecao', 'd10'
      ),
      d10: criarNo(
        'Justo. Meu problema é falta de tempo e desperdício, e essa opção menor parece resolver melhor os dois pontos.',
        [
          'Então vai levar?',
          'Quer começar com essa opção menor e ver se ela funciona na sua rotina?',
          'Posso registrar seu pedido?',
          'Essa é definitivamente a melhor escolha.'
        ],
        [1], 'fechamento', null,
        [
          'Não precisa me pressionar agora.',
          'Vou fazer isso. Eu não queria comprar nada, mas você primeiro entendeu o que eu precisava. Isso foi atendimento de verdade.',
          'Ainda não confirmei que quero comprar.',
          'Prefiro decidir por conta própria.'
        ]
      )
    }
  }
];
