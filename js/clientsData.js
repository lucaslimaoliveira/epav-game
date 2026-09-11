const clientes = [
  {
    id: "cliente1", nome: "Marcos", area: "Recursos Humanos", dificuldade: "Introdução",
    perfil: "Tranquilo, prático e aberto a conversar.", status: "Finalizando uma ligação", x: 14, y: 43,
    satisfacaoInicial: 58, tempoOcupadoInicial: 4500,
    motivoOcupado: "Está terminando uma ligação. Espere o telefone baixar.",
    licao: "Uma boa venda começa pelo momento certo e por uma pergunta simples.",
    produtos: [
      { nome: "Kit Prático", preco: 25, caracteristica: "pronto para consumo imediato" },
      { nome: "Kit Econômico", preco: 15, caracteristica: "melhor custo-benefício" }
    ],
    noInicial: "abordagem",
    dialogo: {
      abordagem: { texto: "Oi! Agora posso falar. O que você trouxe hoje?", opcoes: [
        { texto: "Antes de mostrar, posso saber o que facilitaria seu dia hoje?", categoria: "abordagem", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Você abriu espaço para entender a necessidade.", proximoNo: "descoberta" },
        { texto: "Tenho dois kits. Quer ver?", categoria: "abordagem", qualidade: "boa", efeitoSatisfacao: 3, feedback: "Objetivo, mas ainda pouco investigativo.", proximoNo: "atalho" },
        { texto: "Esse aqui é o que todo mundo compra.", categoria: "abordagem", qualidade: "ruim", efeitoSatisfacao: -8, feedback: "Popularidade não substitui entender o cliente.", proximoNo: "resistencia" }
      ]},
      descoberta: { texto: "Hoje estou indo de uma reunião para outra. Preciso de algo que não dê trabalho.", opcoes: [
        { texto: "Então rapidez pesa mais que o menor preço, certo?", categoria: "necessidade", qualidade: "excelente", efeitoSatisfacao: 10, feedback: "Você confirmou a prioridade antes de oferecer.", proximoNo: "oferta" },
        { texto: "O Kit Econômico custa menos.", categoria: "necessidade", qualidade: "ruim", efeitoSatisfacao: -5, feedback: "Você ouviu 'sem trabalho', não 'mais barato'.", proximoNo: "resistencia" }
      ]},
      atalho: { texto: "Posso, mas estou sem tempo. Qual resolve mais rápido?", opcoes: [
        { texto: "O Kit Prático: já vem pronto e cabe na sua rotina de hoje.", categoria: "oferta", qualidade: "boa", efeitoSatisfacao: 7, feedback: "A oferta foi ligada ao contexto.", proximoNo: "fechamento" },
        { texto: "O Econômico, porque é o mais barato.", categoria: "oferta", qualidade: "neutra", efeitoSatisfacao: -2, feedback: "Preço sozinho não responde à pressa.", proximoNo: "resistencia" }
      ]},
      resistencia: { texto: "Acho que você ainda não entendeu o que eu preciso.", opcoes: [
        { texto: "Tem razão. O que mais importa: rapidez, quantidade ou preço?", categoria: "pergunta", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Reconhecer e perguntar recuperou a conversa.", proximoNo: "oferta" },
        { texto: "Mas os dois kits são muito bons.", categoria: "objecao", qualidade: "ruim", efeitoSatisfacao: -9, feedback: "Repetir qualidade não esclarece valor.", proximoNo: "fechamento_fraco" }
      ]},
      oferta: { texto: "Rapidez, com certeza. O que você sugere?", opcoes: [
        { texto: "Kit Prático — pronto para agora e sem preparo.", produto: 0, categoria: "oferta", qualidade: "excelente", efeitoSatisfacao: 10, feedback: "Produto, benefício e necessidade ficaram conectados.", proximoNo: "fechamento" },
        { texto: "Kit Econômico — você economiza R$ 10.", produto: 1, categoria: "oferta", qualidade: "neutra", efeitoSatisfacao: 1, feedback: "É viável, mas não prioriza a necessidade principal.", proximoNo: "fechamento_fraco" }
      ]},
      fechamento: { texto: "Perfeito. Assim eu resolvo isso sem perder tempo.", opcoes: [
        { texto: "Combinado! Posso separar o Kit Prático para você.", categoria: "fechamento", qualidade: "excelente", efeitoSatisfacao: 5, feedback: "Fechamento claro, sem pressão.", proximoNo: null }
      ]},
      fechamento_fraco: { texto: "Vou levar, mas ainda fiquei com algumas dúvidas.", opcoes: [
        { texto: "Entendi. Na próxima eu confirmo melhor sua prioridade.", categoria: "fechamento", qualidade: "boa", efeitoSatisfacao: 2, feedback: "Você fechou e reconheceu o ponto de melhoria.", proximoNo: null }
      ]}
    }
  },
  {
    id: "cliente2", nome: "Renata", area: "Financeiro", dificuldade: "Objeção de preço",
    perfil: "Educada, analítica e direta sobre custo.", status: "Revisando uma planilha", x: 33, y: 36,
    satisfacaoInicial: 54, licao: "Preço vira valor quando o benefício é específico para a rotina do cliente.",
    produtos: [
      { nome: "Kit Prático", preco: 30, caracteristica: "não exige preparo" },
      { nome: "Kit Completo", preco: 45, caracteristica: "mais variedade e quantidade" }
    ],
    noInicial: "abordagem",
    dialogo: {
      abordagem: { texto: "Oi. Tenho alguns minutos antes de fechar esta planilha.", opcoes: [
        { texto: "Vou ser breve: o que costuma pesar mais, praticidade ou quantidade?", categoria: "abordagem", qualidade: "excelente", efeitoSatisfacao: 8, feedback: "Você respeitou o tempo e abriu uma descoberta.", proximoNo: "descoberta" },
        { texto: "Temos uma promoção imperdível hoje.", categoria: "abordagem", qualidade: "neutra", efeitoSatisfacao: -2, feedback: "Promoção sem contexto soa automática.", proximoNo: "preco" },
        { texto: "Trouxe nosso kit mais completo.", categoria: "abordagem", qualidade: "ruim", efeitoSatisfacao: -7, feedback: "Você escolheu antes de investigar.", proximoNo: "preco" }
      ]},
      descoberta: { texto: "Praticidade, mas eu controlo bem meus gastos.", opcoes: [
        { texto: "Qual gasto o preparo ou a perda de tempo costuma gerar para você?", categoria: "pergunta", qualidade: "excelente", efeitoSatisfacao: 8, feedback: "Você ampliou a conversa além da etiqueta de preço.", proximoNo: "preco" },
        { texto: "Então vou direto no mais barato.", categoria: "pergunta", qualidade: "ruim", efeitoSatisfacao: -6, feedback: "Controle de gastos não significa escolher sempre o menor preço.", proximoNo: "preco" }
      ]},
      preco: { texto: "R$ 30? Parece caro para um kit pequeno.", opcoes: [
        { texto: "Faz sentido comparar. Este já vem pronto e evita preparo e desperdício hoje.", categoria: "objecao", qualidade: "excelente", efeitoSatisfacao: 11, feedback: "Você acolheu a objeção e demonstrou valor concreto.", proximoNo: "oferta" },
        { texto: "Mas a qualidade é ótima.", categoria: "objecao", qualidade: "neutra", efeitoSatisfacao: -2, feedback: "Qualidade genérica não responde à comparação.", proximoNo: "duvida" },
        { texto: "Posso fazer mais barato.", categoria: "objecao", qualidade: "ruim", efeitoSatisfacao: -8, feedback: "Desconto imediato reduz valor sem entender a objeção.", proximoNo: "duvida" }
      ]},
      duvida: { texto: "Ainda não vi por que ele vale isso.", opcoes: [
        { texto: "Você paga pela conveniência de usar agora e pela quantidade certa, sem sobra.", categoria: "objecao", qualidade: "boa", efeitoSatisfacao: 7, feedback: "Benefício e custo ficaram comparáveis.", proximoNo: "oferta" },
        { texto: "É o preço da tabela.", categoria: "objecao", qualidade: "muitoRuim", efeitoSatisfacao: -12, feedback: "Defender a tabela ignora a dúvida da cliente.", proximoNo: "fechamento_fraco" }
      ]},
      oferta: { texto: "Certo. Qual opção combina melhor com o que eu disse?", opcoes: [
        { texto: "Kit Prático — quantidade certa e zero preparo.", produto: 0, categoria: "oferta", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Oferta coerente com praticidade e controle.", proximoNo: "fechamento" },
        { texto: "Kit Completo — mais itens por R$ 45.", produto: 1, categoria: "oferta", qualidade: "boa", efeitoSatisfacao: 3, feedback: "Tem valor, mas oferece mais do que ela pediu.", proximoNo: "fechamento_fraco" }
      ]},
      fechamento: { texto: "Agora entendi. O Prático evita desperdício. Vou levar.", opcoes: [
        { texto: "Ótima escolha para a sua rotina de hoje.", categoria: "fechamento", qualidade: "excelente", efeitoSatisfacao: 5, feedback: "Você resumiu o motivo real da compra.", proximoNo: null }
      ]},
      fechamento_fraco: { texto: "Vou pensar melhor antes de decidir.", opcoes: [
        { texto: "Claro. Posso deixar as duas opções anotadas para você comparar.", categoria: "fechamento", qualidade: "boa", efeitoSatisfacao: 3, feedback: "Você preservou a relação sem pressionar.", proximoNo: null }
      ]}
    }
  },
  {
    id: "cliente3", nome: "Eduardo", area: "Logística", dificuldade: "Necessidade oculta",
    perfil: "Sociável; revela detalhes quando sente interesse genuíno.", status: "Tirou os fones para uma pausa", x: 52, y: 41,
    satisfacaoInicial: 50, licao: "A primeira necessidade mencionada nem sempre é a necessidade completa.",
    produtos: [
      { nome: "Kit Churrasco Família", preco: 120, caracteristica: "serve até 8 pessoas" },
      { nome: "Kit Churrasco Individual", preco: 35, caracteristica: "serve até 2 pessoas" }
    ], noInicial: "abordagem",
    dialogo: {
      abordagem: { texto: "E aí! Estou pensando no churrasco do fim de semana.", opcoes: [
        { texto: "Boa! Para quantas pessoas e que tipo de encontro você imagina?", categoria: "pergunta", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Pergunta aberta revela contexto e escala.", proximoNo: "descoberta" },
        { texto: "Então o Kit Churrasco é perfeito.", categoria: "abordagem", qualidade: "ruim", efeitoSatisfacao: -6, feedback: "Você ofereceu antes de saber o tamanho do encontro.", proximoNo: "quantidade" },
        { texto: "Você prefere pagar menos ou ter mais comida?", categoria: "pergunta", qualidade: "neutra", efeitoSatisfacao: 0, feedback: "A pergunta força uma escolha cedo demais.", proximoNo: "quantidade" }
      ]},
      descoberta: { texto: "Devem ir seis pessoas. Quero curtir, não ficar preocupado se vai faltar.", opcoes: [
        { texto: "Além da quantidade, facilidade para servir também importa?", categoria: "necessidade", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Você ouviu a ansiedade por trás do pedido.", proximoNo: "objecao" },
        { texto: "Seis pessoas. Já sei o que vender.", categoria: "necessidade", qualidade: "boa", efeitoSatisfacao: 3, feedback: "Você identificou a escala, mas não confirmou o restante.", proximoNo: "objecao" }
      ]},
      quantidade: { texto: "Calma, ainda nem disse quantas pessoas vão.", opcoes: [
        { texto: "Você tem razão. Quantas pessoas e o que não pode faltar?", categoria: "pergunta", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Você corrigiu a pressa com escuta ativa.", proximoNo: "descoberta" },
        { texto: "O maior kit sempre garante.", categoria: "oferta", qualidade: "ruim", efeitoSatisfacao: -8, feedback: "Excesso também pode gerar desperdício.", proximoNo: "objecao" }
      ]},
      objecao: { texto: "R$ 120 é bastante. E se sobrar?", opcoes: [
        { texto: "Para seis, ele dá margem sem exagero e você não precisa complementar depois.", categoria: "objecao", qualidade: "excelente", efeitoSatisfacao: 10, feedback: "Você tratou risco de falta e de sobra ao mesmo tempo.", proximoNo: "oferta" },
        { texto: "Sobrar é melhor do que faltar.", categoria: "objecao", qualidade: "neutra", efeitoSatisfacao: -3, feedback: "A frase ignora o desperdício que ele teme.", proximoNo: "oferta" }
      ]},
      oferta: { texto: "Qual você levaria para seis pessoas?", opcoes: [
        { texto: "Kit Família — serve até 8 e dá a margem tranquila que você quer.", produto: 0, categoria: "oferta", qualidade: "excelente", efeitoSatisfacao: 10, feedback: "Oferta baseada em quantidade e tranquilidade.", proximoNo: "fechamento" },
        { texto: "Dois Kits Individuais — sai mais barato.", produto: 1, categoria: "oferta", qualidade: "muitoRuim", efeitoSatisfacao: -12, feedback: "Dois kits não atendem seis pessoas.", proximoNo: "fechamento_fraco" }
      ]},
      fechamento: { texto: "É isso. Quero aproveitar sem fazer conta toda hora.", opcoes: [
        { texto: "Fechado. Vou separar o Família para o seu churrasco.", categoria: "fechamento", qualidade: "excelente", efeitoSatisfacao: 5, feedback: "Você fechou retomando a motivação do cliente.", proximoNo: null }
      ]},
      fechamento_fraco: { texto: "Não, assim vai faltar. Melhor deixar para outra hora.", opcoes: [
        { texto: "Entendi. Obrigado por me alertar; vou calcular melhor na próxima.", categoria: "fechamento", qualidade: "neutra", efeitoSatisfacao: 1, feedback: "Assumir o erro preserva respeito, mas a venda foi perdida.", proximoNo: null }
      ]}
    }
  },
  {
    id: "cliente4", nome: "Patrícia", area: "Gerência", dificuldade: "Duas objeções",
    perfil: "Cética, experiente e pouco tolerante a promessas vagas.", status: "Terminou uma conversa", x: 70, y: 34,
    satisfacaoInicial: 43, licao: "Clientes experientes confiam em evidência, clareza e limites honestos.",
    produtos: [
      { nome: "Kit Premium", preco: 80, caracteristica: "qualidade certificada e seleção especial" },
      { nome: "Kit Padrão", preco: 40, caracteristica: "essencial com menor investimento" }
    ], noInicial: "abordagem",
    dialogo: {
      abordagem: { texto: "Pois não? Espero que não seja outro discurso pronto.", opcoes: [
        { texto: "Também não gosto de discurso pronto. Posso começar pelo que faria diferença para você?", categoria: "abordagem", qualidade: "excelente", efeitoSatisfacao: 8, feedback: "Você reconheceu o ceticismo sem confrontar.", proximoNo: "descoberta" },
        { texto: "Garanto que nosso produto é o melhor.", categoria: "abordagem", qualidade: "muitoRuim", efeitoSatisfacao: -11, feedback: "Promessa absoluta confirma a desconfiança.", proximoNo: "desconfianca" },
        { texto: "Vou mostrar as opções e você decide.", categoria: "abordagem", qualidade: "neutra", efeitoSatisfacao: 0, feedback: "Respeitosa, mas transfere todo o trabalho à cliente.", proximoNo: "descoberta" }
      ]},
      descoberta: { texto: "Quero algo confiável para presentear, mas não pago só por aparência.", opcoes: [
        { texto: "O que provaria qualidade para você: origem, seleção ou apresentação?", categoria: "pergunta", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Você pediu critérios verificáveis.", proximoNo: "objecao1" },
        { texto: "O Premium tem uma embalagem bonita.", categoria: "necessidade", qualidade: "ruim", efeitoSatisfacao: -7, feedback: "Ela acabou de dizer que aparência não basta.", proximoNo: "desconfianca" }
      ]},
      desconfianca: { texto: "É exatamente esse tipo de frase que todo vendedor usa.", opcoes: [
        { texto: "Justo. Em vez de prometer, posso comparar os critérios objetivos dos dois kits.", categoria: "objecao", qualidade: "excelente", efeitoSatisfacao: 10, feedback: "Transparência recuperou credibilidade.", proximoNo: "objecao1" },
        { texto: "Você precisa confiar em mim.", categoria: "objecao", qualidade: "muitoRuim", efeitoSatisfacao: -13, feedback: "Confiança não se exige; se constrói.", proximoNo: "fechamento_fraco" }
      ]},
      objecao1: { texto: "Seleção e origem. Mas ainda acho R$ 80 caro.", opcoes: [
        { texto: "Concordo que é um investimento. O Premium certifica a seleção; o Padrão reduz custo sem essa curadoria.", categoria: "objecao", qualidade: "excelente", efeitoSatisfacao: 11, feedback: "Você explicou a diferença sem desmerecer a opção barata.", proximoNo: "objecao2" },
        { texto: "Posso dizer que está em promoção.", categoria: "objecao", qualidade: "muitoRuim", efeitoSatisfacao: -14, feedback: "Inventar urgência quebra confiança.", proximoNo: "fechamento_fraco" }
      ]},
      objecao2: { texto: "E se a pessoa não gostar?", opcoes: [
        { texto: "Não dá para garantir gosto pessoal. Posso garantir os critérios de seleção e mostrar exatamente o que vem.", categoria: "objecao", qualidade: "excelente", efeitoSatisfacao: 12, feedback: "Limite honesto aumenta confiança.", proximoNo: "oferta" },
        { texto: "Todo mundo gosta.", categoria: "objecao", qualidade: "ruim", efeitoSatisfacao: -9, feedback: "Generalização não elimina o risco percebido.", proximoNo: "oferta" }
      ]},
      oferta: { texto: "Com essa diferença clara, qual você recomenda para presente?", opcoes: [
        { texto: "Kit Premium — pela seleção certificada, que é o seu critério principal.", produto: 0, categoria: "oferta", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Recomendação sustentada pelo critério da cliente.", proximoNo: "fechamento" },
        { texto: "Kit Padrão — é mais barato e também serve.", produto: 1, categoria: "oferta", qualidade: "boa", efeitoSatisfacao: 2, feedback: "É honesto, mas não atende tão bem ao objetivo de presentear.", proximoNo: "fechamento_fraco" }
      ]},
      fechamento: { texto: "Agora sim: você explicou sem exagerar. Vou levar o Premium.", opcoes: [
        { texto: "Perfeito. Vou conferir o conteúdo com você antes de fechar.", categoria: "fechamento", qualidade: "excelente", efeitoSatisfacao: 5, feedback: "A conferência reforça segurança.", proximoNo: null }
      ]},
      fechamento_fraco: { texto: "Prefiro não decidir hoje.", opcoes: [
        { texto: "Sem problema. Deixo a comparação para você avaliar com calma.", categoria: "fechamento", qualidade: "boa", efeitoSatisfacao: 3, feedback: "Você encerrou sem pressão e preservou a relação.", proximoNo: null }
      ]}
    }
  },
  {
    id: "cliente5", nome: "Ricardo", area: "Diretoria", dificuldade: "Desafio final",
    perfil: "Direto, impaciente e exige lógica em cada recomendação.", status: "Tem exatamente dois minutos", x: 87, y: 39,
    satisfacaoInicial: 38, licao: "No atendimento difícil, síntese só funciona quando vem apoiada por boas perguntas.",
    produtos: [
      { nome: "Kit Executivo", preco: 60, caracteristica: "reposição planejada e economia de tempo" },
      { nome: "Kit Avulso", preco: 20, caracteristica: "compra pontual sem compromisso" }
    ], noInicial: "abordagem",
    dialogo: {
      abordagem: { texto: "Tenho dois minutos. Por que eu deveria te ouvir?", opcoes: [
        { texto: "Porque em 20 segundos eu descubro se consigo poupar seu tempo. Posso fazer duas perguntas?", categoria: "abordagem", qualidade: "excelente", efeitoSatisfacao: 9, feedback: "Você ofereceu valor e definiu um limite claro.", proximoNo: "perguntas" },
        { texto: "Porque temos o melhor preço do escritório.", categoria: "abordagem", qualidade: "ruim", efeitoSatisfacao: -10, feedback: "Preço sem relevância desperdiça o pouco tempo disponível.", proximoNo: "pressao" },
        { texto: "Prometo ser rápido. Veja nosso catálogo.", categoria: "abordagem", qualidade: "neutra", efeitoSatisfacao: -4, feedback: "Entregar um catálogo transfere esforço ao cliente.", proximoNo: "pressao" }
      ]},
      perguntas: { texto: "Duas. Seja objetivo.", opcoes: [
        { texto: "Você compra isso com frequência? E o que mais incomoda nesse processo hoje?", categoria: "pergunta", qualidade: "excelente", efeitoSatisfacao: 10, feedback: "Frequência e dor revelam potencial de recorrência.", proximoNo: "necessidade" },
        { texto: "Quanto pretende gastar?", categoria: "pergunta", qualidade: "neutra", efeitoSatisfacao: 0, feedback: "Orçamento importa, mas sozinho não revela valor.", proximoNo: "pressao" }
      ]},
      necessidade: { texto: "Compro toda semana. O que me irrita é precisar parar para resolver de novo.", opcoes: [
        { texto: "Então a prioridade é reduzir decisões repetidas, não apenas o preço desta compra.", categoria: "necessidade", qualidade: "excelente", efeitoSatisfacao: 11, feedback: "Você sintetizou a necessidade real.", proximoNo: "objecao" },
        { texto: "Ótimo, posso vender uma quantidade maior.", categoria: "necessidade", qualidade: "ruim", efeitoSatisfacao: -7, feedback: "Quantidade não é automaticamente conveniência.", proximoNo: "objecao" }
      ]},
      pressao: { texto: "Você já gastou metade do tempo e ainda não disse nada útil.", opcoes: [
        { texto: "Tem razão. Uma pergunta: você quer resolver hoje ou reduzir compras futuras?", categoria: "pergunta", qualidade: "boa", efeitoSatisfacao: 6, feedback: "Uma pergunta decisiva recuperou foco.", proximoNo: "necessidade_curta" },
        { texto: "Só mais um minuto para eu explicar tudo.", categoria: "abordagem", qualidade: "muitoRuim", efeitoSatisfacao: -15, feedback: "Insistir viola o limite declarado.", proximoNo: "fechamento_fraco" }
      ]},
      necessidade_curta: { texto: "Reduzir compras futuras. Faço isso toda semana.", opcoes: [
        { texto: "Entendi: menos interrupções recorrentes.", categoria: "necessidade", qualidade: "boa", efeitoSatisfacao: 7, feedback: "Você encontrou a necessidade sob pressão.", proximoNo: "objecao" }
      ]},
      objecao: { texto: "O Executivo custa três vezes mais. Qual a vantagem real?", opcoes: [
        { texto: "Ele cobre mais de uma compra e evita repetir esse processo. O ganho é tempo planejado, não desconto.", categoria: "objecao", qualidade: "excelente", efeitoSatisfacao: 12, feedback: "A resposta compara custo com a dor real.", proximoNo: "oferta" },
        { texto: "É premium e executivos costumam preferir.", categoria: "objecao", qualidade: "muitoRuim", efeitoSatisfacao: -14, feedback: "Rótulo e status não demonstram vantagem.", proximoNo: "fechamento_fraco" }
      ]},
      oferta: { texto: "Última pergunta: qual opção você recomenda e por quê?", opcoes: [
        { texto: "Kit Executivo — reduz suas compras semanais e devolve tempo à sua agenda.", produto: 0, categoria: "oferta", qualidade: "excelente", efeitoSatisfacao: 12, feedback: "Recomendação curta, lógica e personalizada.", proximoNo: "fechamento" },
        { texto: "Kit Avulso — custa menos hoje.", produto: 1, categoria: "oferta", qualidade: "ruim", efeitoSatisfacao: -8, feedback: "Economiza hoje, mas mantém a dor semanal.", proximoNo: "fechamento_fraco" }
      ]},
      fechamento: { texto: "Objetivo e bem justificado. Separe o Executivo.", opcoes: [
        { texto: "Fechado. Confirmo a reposição antes de sair.", categoria: "fechamento", qualidade: "excelente", efeitoSatisfacao: 6, feedback: "Você confirmou o próximo passo sem prolongar.", proximoNo: null }
      ]},
      fechamento_fraco: { texto: "Os dois minutos acabaram. Hoje não.", opcoes: [
        { texto: "Entendido. Obrigado pelo tempo; não vou insistir.", categoria: "fechamento", qualidade: "boa", efeitoSatisfacao: 3, feedback: "Respeitar o limite protege uma oportunidade futura.", proximoNo: null }
      ]}
    }
  }
];
