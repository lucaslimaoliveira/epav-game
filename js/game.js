const estado = {
  nomeVendedor: 'Kevin',
  sexoVendedor: 'masculino',
  indiceClienteAtual: 0,
  clienteAtual: null,
  noAtual: null,
  satisfacao: 0,
  pontuacaoAtendimento: 0,
  pontuacaoTotal: 0,
  erros: 0,
  acertos: 0,
  decisoesRespondidas: 0,
  satisfacaoAcumulada: 0,
  objecoesCorretas: 0,
  objecoesRespondidas: 0,
  primeiraEntradaEscritorio: true,
  clientesLiberados: new Set(),
  temporizadores: new Map(),
  momentoInadequado: false,
  bonusAtendimento: 0,
  etapa: 'menu'
};

const CHAVE_PROGRESSO = 'progressoEpavV2';
const CHAVE_PERFIL = 'perfilVendedorEpav';
let temporizadoresCutscene = [];

const tabelaPontuacao = {
  observacao:  { excelente: 100, boa: 60, neutra: 0, ruim: -100, muitoRuim: -200 },
  abordagem:   { excelente: 200, boa: 120, neutra: 0, ruim: -100, muitoRuim: -200 },
  pergunta:    { excelente: 250, boa: 150, neutra: 0, ruim: -80, muitoRuim: -150 },
  necessidade: { excelente: 400, boa: 240, neutra: 0, ruim: -125, muitoRuim: -250 },
  objecao:     { excelente: 500, boa: 300, neutra: 0, ruim: -150, muitoRuim: -300 },
  oferta:      { excelente: 400, boa: 240, neutra: 0, ruim: -100, muitoRuim: -200 },
  fechamento:  { excelente: 700, boa: 420, neutra: 0, ruim: -150, muitoRuim: -300 }
};

const estadosFemininos = {
  parado: 'parada',
  feliz: 'feliz',
  falando: 'falando',
  frustrado: 'frustrada',
  pensando: 'pensando',
  surpreso: 'surpresa',
  comemorando: 'comemorando'
};

function imagemVendedor(expressao = 'parado') {
  if (estado.sexoVendedor === 'feminino') {
    return `assets/images/vendedora-${estadosFemininos[expressao] || expressao}.png`;
  }
  return `assets/images/vendedor-${expressao}.png`;
}

function framesAndandoAtuais() {
  const prefixo = estado.sexoVendedor === 'feminino' ? 'vendedora' : 'vendedor';
  return [1, 2, 3, 4].map(numero => `assets/images/${prefixo}-andando-${numero}.png`);
}

function embaralharOpcoes(opcoes) {
  const embaralhadas = [...opcoes];
  for (let indice = embaralhadas.length - 1; indice > 0; indice -= 1) {
    const sorteado = Math.floor(Math.random() * (indice + 1));
    [embaralhadas[indice], embaralhadas[sorteado]] = [embaralhadas[sorteado], embaralhadas[indice]];
  }
  return embaralhadas;
}

function lerPerfilVendedor() {
  try {
    const perfil = JSON.parse(localStorage.getItem(CHAVE_PERFIL) || 'null');
    if (!perfil || !['masculino', 'feminino'].includes(perfil.sexoVendedor)) return null;
    const nome = String(perfil.nomeVendedor || '').trim();
    return nome.length >= 2 ? { nomeVendedor: nome.slice(0, 20), sexoVendedor: perfil.sexoVendedor } : null;
  } catch {
    return null;
  }
}

function abrirPersonalizacao() {
  const perfil = lerPerfilVendedor() || { nomeVendedor: estado.nomeVendedor, sexoVendedor: estado.sexoVendedor };
  document.getElementById('nome-vendedor').value = perfil.nomeVendedor;
  const opcao = document.querySelector(`input[name="sexo-vendedor"][value="${perfil.sexoVendedor}"]`);
  if (opcao) opcao.checked = true;
  mostrarTela('tela-personalizacao');
  requestAnimationFrame(() => document.getElementById('nome-vendedor').focus());
}

function confirmarPersonalizacao(evento) {
  evento.preventDefault();
  const campoNome = document.getElementById('nome-vendedor');
  const nome = campoNome.value.trim().replace(/\s+/g, ' ').slice(0, 20);
  if (nome.length < 2) {
    campoNome.setCustomValidity('Digite um nome com pelo menos 2 caracteres.');
    campoNome.reportValidity();
    return;
  }
  campoNome.setCustomValidity('');
  const sexoSelecionado = document.querySelector('input[name="sexo-vendedor"]:checked')?.value;
  estado.nomeVendedor = nome;
  estado.sexoVendedor = sexoSelecionado === 'feminino' ? 'feminino' : 'masculino';
  localStorage.setItem(CHAVE_PERFIL, JSON.stringify({ nomeVendedor: estado.nomeVendedor, sexoVendedor: estado.sexoVendedor }));
  iniciarJogo();
}

function atualizarIdentidadeVendedor() {
  const descricao = `${estado.nomeVendedor}, ${estado.sexoVendedor === 'feminino' ? 'vendedora' : 'vendedor'} EPAV`;
  const nomeHud = document.getElementById('nome-vendedor-hud');
  const cargoHud = document.getElementById('cargo-vendedor-hud');
  if (nomeHud) nomeHud.textContent = estado.nomeVendedor;
  if (cargoHud) cargoHud.textContent = estado.sexoVendedor === 'feminino' ? 'VENDEDORA' : 'VENDEDOR';
  ['vendedor-sprite', 'vendedor-dialogo', 'cutscene-vendedor', 'vendedor-final'].forEach(id => {
    const imagem = document.getElementById(id);
    if (imagem) imagem.alt = descricao;
  });
}

function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
  const destino = document.getElementById(id);
  if (destino) destino.classList.add('ativa');
  if (id === 'tela-menu') atualizarResumoMenu();
}

function iniciarJogo() {
  estado.temporizadores.forEach(clearTimeout);
  localStorage.removeItem(CHAVE_PROGRESSO);
  Object.assign(estado, {
    indiceClienteAtual: 0,
    clienteAtual: null,
    noAtual: null,
    satisfacao: 0,
    pontuacaoAtendimento: 0,
    pontuacaoTotal: 0,
    erros: 0,
    acertos: 0,
    decisoesRespondidas: 0,
    satisfacaoAcumulada: 0,
    objecoesCorretas: 0,
    objecoesRespondidas: 0,
    primeiraEntradaEscritorio: true,
    clientesLiberados: new Set(),
    temporizadores: new Map(),
    momentoInadequado: false,
    bonusAtendimento: 0,
    etapa: 'escritorio'
  });
  atualizarIdentidadeVendedor();
  mostrarEscritorio();
}

function solicitarNovoJogo() {
  if (!lerProgresso()) return abrirPersonalizacao();
  abrirModal('INICIAR NOVA PARTIDA?', 'A partida salva atual será substituída.', 'Novo jogo', () => {
    fecharModal();
    abrirPersonalizacao();
  });
}

function mostrarEscritorio() {
  estado.etapa = 'escritorio';
  mostrarTela('tela-escritorio');
  const sprite = document.getElementById('vendedor-sprite');
  sprite.style.top = '';
  if (estado.primeiraEntradaEscritorio) {
    animarChegada();
    estado.primeiraEntradaEscritorio = false;
  } else {
    sprite.style.transition = 'none';
    sprite.style.transform = 'none';
    sprite.style.left = '3%';
    sprite.src = imagemVendedor('parado');
  }
  renderizarMarcadores();
  salvarProgresso();
}

function animarChegada() {
  const sprite = document.getElementById('vendedor-sprite');
  const framesAndando = framesAndandoAtuais();
  sprite.style.transition = 'none';
  sprite.style.transform = 'translateX(-50%)';
  sprite.style.left = '-12%';
  let frameAtual = 0;
  const intervalo = setInterval(() => {
    sprite.src = framesAndando[frameAtual % framesAndando.length];
    frameAtual += 1;
  }, 145);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sprite.style.transition = 'left 2s cubic-bezier(.2,.8,.2,1)';
    sprite.style.left = '50%';
  }));
  setTimeout(() => {
    clearInterval(intervalo);
    sprite.src = imagemVendedor('parado');
  }, 2050);
}

function renderizarMarcadores() {
  atualizarIdentidadeVendedor();
  document.getElementById('progresso-escritorio').textContent = `${estado.indiceClienteAtual}/${clientes.length}`;
  document.getElementById('pontos-escritorio').textContent = String(estado.pontuacaoTotal).padStart(4, '0');
  const container = document.getElementById('marcadores-clientes');
  container.innerHTML = '';

  clientes.forEach((cliente, indice) => {
    const marcador = document.createElement('div');
    marcador.className = 'marcador-cliente';
    marcador.style.left = `${cliente.x}%`;
    marcador.style.top = `${cliente.y}%`;
    marcador.tabIndex = 0;
    marcador.setAttribute('aria-label', `${cliente.nome}, ${cliente.status}`);
    const popup = document.createElement('div');
    popup.className = 'popup-cliente';

    if (indice < estado.indiceClienteAtual) {
      marcador.classList.add('concluido');
      popup.innerHTML = `<span class="status">CONCLUÍDO</span><h4>${cliente.nome}</h4><p>Atendimento finalizado.</p>`;
    } else if (indice > estado.indiceClienteAtual) {
      marcador.classList.add('bloqueado');
      popup.innerHTML = `<span class="status">AGUARDE</span><h4>${cliente.nome}</h4><p>${cliente.status}. Termine o atendimento atual primeiro.</p>`;
    } else {
      const ocupado = cliente.tempoOcupadoInicial && !estado.clientesLiberados.has(cliente.id);
      marcador.classList.add('atual');
      if (ocupado) {
        marcador.classList.add('ocupado');
        popup.innerHTML = `<span class="status">OCUPADO</span><h4>${cliente.nome}</h4><p>${cliente.motivoOcupado}</p><button>Interromper mesmo assim</button>`;
        popup.querySelector('button').onclick = () => irParaAtendimento(indice, true);
        if (!estado.temporizadores.has(cliente.id)) {
          const timer = setTimeout(() => {
            estado.clientesLiberados.add(cliente.id);
            estado.temporizadores.delete(cliente.id);
            salvarProgresso();
            renderizarMarcadores();
          }, cliente.tempoOcupadoInicial);
          estado.temporizadores.set(cliente.id, timer);
        }
      } else {
        popup.innerHTML = `<span class="status">DISPONÍVEL</span><h4>${cliente.nome}</h4><p><strong>${cliente.area}</strong><br>${cliente.perfil}</p><button>Atender agora</button>`;
        popup.querySelector('button').onclick = () => irParaAtendimento(indice, false);
      }
    }
    marcador.appendChild(popup);
    container.appendChild(marcador);
  });
}

function irParaAtendimento(indice, momentoInadequado = false) {
  const vendedor = document.getElementById('vendedor-sprite');
  const cliente = clientes[indice];
  estado.momentoInadequado = momentoInadequado;
  vendedor.src = framesAndandoAtuais()[0];
  vendedor.style.transform = 'translateX(-50%)';
  vendedor.style.transition = 'left .9s ease, top .9s ease';
  vendedor.style.left = `${cliente.x}%`;
  vendedor.style.top = `${Math.min(cliente.y + 4, 58)}%`;
  setTimeout(() => {
    const escritorio = document.getElementById('tela-escritorio');
    escritorio.classList.add('zoom-saindo');
    setTimeout(() => {
      escritorio.classList.remove('zoom-saindo');
      iniciarAtendimento(cliente);
    }, 480);
  }, 900);
}

function iniciarAtendimento(cliente) {
  estado.clienteAtual = cliente;
  estado.satisfacao = cliente.satisfacaoInicial;
  estado.pontuacaoAtendimento = 0;
  estado.bonusAtendimento = 0;
  estado.noAtual = cliente.noInicial;
  estado.etapa = 'dialogo';
  if (estado.momentoInadequado) {
    estado.satisfacao = Math.max(0, estado.satisfacao - 18);
    estado.erros += 1;
  }
  const retrato = document.getElementById('cliente-retrato');
  retrato.src = `assets/images/${cliente.id}.png`;
  retrato.alt = `Retrato de ${cliente.nome}`;
  document.getElementById('vendedor-dialogo').src = imagemVendedor('parado');
  document.getElementById('nome-falante').textContent = cliente.nome.toUpperCase();
  document.getElementById('feedback-decisao').textContent = estado.momentoInadequado
    ? '−200 · MOMENTO INADEQUADO — Observe o contexto antes de abordar.' : '';
  mostrarTela('tela-dialogo');
  salvarProgresso();
  renderizarNo();
  if (estado.momentoInadequado) {
    document.getElementById('vendedor-dialogo').src = imagemVendedor('surpreso');
  }
}

function renderizarNo() {
  const no = estado.clienteAtual.dialogo[estado.noAtual];
  if (!no) return finalizarAtendimento();
  document.getElementById('texto-cliente').textContent = no.texto;
  document.getElementById('vendedor-dialogo').src = imagemVendedor('parado');
  document.getElementById('nome-falante').textContent = estado.clienteAtual.nome.toUpperCase();
  atualizarBarraSatisfacao();
  document.getElementById('pontos-dialogo').textContent = estado.pontuacaoAtendimento;
  const container = document.getElementById('opcoes-resposta');
  container.innerHTML = '';
  embaralharOpcoes(no.opcoes).forEach((opcao, indice) => {
    const botao = document.createElement('button');
    const letra = String.fromCharCode(65 + indice);
    const numero = String(indice + 1);
    botao.dataset.letra = letra;
    botao.dataset.atalho = numero;
    botao.title = `Atalho: ${letra} ou ${numero}`;
    botao.setAttribute('aria-keyshortcuts', `${letra} ${numero}`);
    botao.textContent = opcao.texto;
    if (Number.isInteger(opcao.produto)) {
      const produto = estado.clienteAtual.produtos[opcao.produto];
      botao.classList.add('produto');
      botao.dataset.preco = `R$ ${produto.preco} · ${produto.caracteristica}`;
    }
    botao.onclick = () => escolherOpcao(opcao, botao);
    container.appendChild(botao);
  });
}

function escolherOpcao(opcao, botao) {
  document.querySelectorAll('#opcoes-resposta button').forEach(item => item.disabled = true);
  estado.satisfacao = Math.max(0, Math.min(100, estado.satisfacao + opcao.efeitoSatisfacao));
  let pontos = 0;
  if (opcao.categoria && opcao.qualidade) {
    pontos = Number.isFinite(opcao.pontos) ? opcao.pontos : tabelaPontuacao[opcao.categoria][opcao.qualidade];
    estado.pontuacaoAtendimento += pontos;
    estado.decisoesRespondidas += 1;
    if (opcao.correta) estado.acertos += 1;
    else estado.erros += 1;
    if (opcao.categoria === 'objecao') {
      estado.objecoesRespondidas += 1;
      if (opcao.correta) estado.objecoesCorretas += 1;
    }
    mostrarPontosFlutuantes(pontos, botao);
  }
  const vendedor = document.getElementById('vendedor-dialogo');
  if (!opcao.correta) vendedor.src = imagemVendedor('frustrado');
  else if (opcao.categoria === 'pergunta' || opcao.categoria === 'necessidade') vendedor.src = imagemVendedor('pensando');
  else if (pontos >= 10) vendedor.src = imagemVendedor('feliz');
  else vendedor.src = imagemVendedor('falando');
  if (opcao.resposta) document.getElementById('texto-cliente').textContent = opcao.resposta;
  document.getElementById('feedback-decisao').textContent = opcao.feedback || '';
  atualizarBarraSatisfacao();
  document.getElementById('pontos-dialogo').textContent = estado.pontuacaoAtendimento;
  estado.noAtual = typeof opcao.proximoNo === 'function' ? opcao.proximoNo(estado) : opcao.proximoNo;
  salvarProgresso();
  setTimeout(renderizarNo, estado.noAtual === null ? 1800 : 1150);
}

function mostrarPontosFlutuantes(valor, referencia) {
  const popup = document.createElement('span');
  popup.className = 'pontos-flutuantes';
  popup.textContent = `${valor > 0 ? '+' : ''}${valor}`;
  popup.style.color = valor >= 0 ? '#217c39' : '#a91e39';
  referencia.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

function atualizarBarraSatisfacao() {
  const preenchimento = document.getElementById('barra-satisfacao-preenchimento');
  preenchimento.style.width = `${estado.satisfacao}%`;
  preenchimento.style.background = estado.satisfacao >= 65 ? '#58b957' : estado.satisfacao >= 40 ? '#f2b84b' : '#cf4554';
  document.getElementById('emoji-satisfacao').textContent = emojiSatisfacao(estado.satisfacao);
}

function emojiSatisfacao(valor) {
  if (valor >= 80) return '😊';
  if (valor >= 60) return '🙂';
  if (valor >= 40) return '😐';
  if (valor >= 20) return '😕';
  return '😠';
}

function finalizarAtendimento() {
  estado.bonusAtendimento = 0;
  estado.pontuacaoTotal += estado.pontuacaoAtendimento;
  estado.satisfacaoAcumulada += estado.satisfacao;
  estado.etapa = 'resultado';
  salvarProgresso();
  mostrarResultadoAtendimento();
}

function mostrarResultadoAtendimento() {
  const titulo = estado.satisfacao >= 80 ? 'Conexão excelente!' : estado.satisfacao >= 60 ? 'Boa conversa!' : 'Há espaço para melhorar';
  document.getElementById('titulo-resultado').textContent = titulo;
  document.getElementById('resumo-atendimento').textContent = `${estado.clienteAtual.nome}: ${estado.pontuacaoAtendimento} de ${estado.clienteAtual.decisoes * 10} pontos · satisfação ${estado.satisfacao}% ${emojiSatisfacao(estado.satisfacao)}`;
  document.getElementById('licao-atendimento').textContent = estado.clienteAtual.licao;
  mostrarTela('tela-resultado');
}

function continuarAposResultado() {
  estado.indiceClienteAtual += 1;
  estado.momentoInadequado = false;
  if (estado.indiceClienteAtual < clientes.length) mostrarEscritorio();
  else {
    mostrarEscritorio();
    setTimeout(finalizarJogo, 1400);
  }
}

function calcularClassificacao(pontuacao) {
  const feminino = estado.sexoVendedor === 'feminino';
  if (pontuacao >= 300) return feminino ? 'Mestra do EPAV' : 'Mestre do EPAV';
  if (pontuacao >= 200) return feminino ? 'Vendedora Destaque' : 'Vendedor Destaque';
  if (pontuacao >= 100) return feminino ? 'Boa Vendedora' : 'Bom Vendedor';
  return feminino ? 'Vendedora Iniciante' : 'Vendedor Iniciante';
}

function finalizarJogo() {
  const classificacao = calcularClassificacao(estado.pontuacaoTotal);
  const totalDecisoes = clientes.reduce((total, cliente) => total + cliente.decisoes, 0);
  const satisfacaoMedia = Math.round(estado.satisfacaoAcumulada / clientes.length);
  const desempenhoObjecoes = estado.objecoesRespondidas
    ? Math.round((estado.objecoesCorretas / estado.objecoesRespondidas) * 100) : 0;
  document.getElementById('classificacao-final').textContent = classificacao;
  document.getElementById('mensagem-final').textContent = estado.pontuacaoTotal >= 300
    ? `${estado.nomeVendedor} conseguiu atender todos os clientes com excelência.`
    : `${estado.nomeVendedor} atendeu todos os clientes. Reveja suas escolhas e tente superar seu resultado.`;
  document.getElementById('clientes-final').textContent = `${clientes.length}/${clientes.length}`;
  document.getElementById('decisoes-final').textContent = `${estado.acertos}/${totalDecisoes}`;
  document.getElementById('satisfacao-final').textContent = `${satisfacaoMedia}%`;
  document.getElementById('objecoes-final').textContent = `${desempenhoObjecoes}%`;
  document.getElementById('pontuacao-final').textContent = `${estado.pontuacaoTotal}/400 pontos · ${estado.erros} decisões a revisar`;
  document.getElementById('vendedor-final').src = estado.pontuacaoTotal >= 300
    ? imagemVendedor('comemorando') : imagemVendedor('feliz');
  atualizarIdentidadeVendedor();
  salvarTentativa(classificacao);
  localStorage.removeItem(CHAVE_PROGRESSO);
  if (estado.pontuacaoTotal >= 400) iniciarCutscene('sucesso');
  else if (estado.pontuacaoTotal <= 0) iniciarCutscene('fracasso');
  else mostrarResultadoFinal();
}

function iniciarCutscene(tipo) {
  temporizadoresCutscene.forEach(clearTimeout);
  temporizadoresCutscene = [];
  const sucesso = tipo === 'sucesso';
  const cenario = document.getElementById('cutscene-cenario');
  cenario.className = sucesso ? 'sucesso' : 'fracasso';
  document.getElementById('cutscene-selo').textContent = sucesso ? 'PONTUAÇÃO MÁXIMA · 400/400' : 'PONTUAÇÃO MÍNIMA · 0/400';
  document.getElementById('cutscene-titulo').textContent = sucesso ? 'Atendimento de verdade!' : 'Fim da linha!';
  document.getElementById('cutscene-narracao').textContent = sucesso
    ? `Os clientes adoraram o atendimento de ${estado.nomeVendedor}.`
    : `Os clientes perderam a confiança e decidiram expulsar ${estado.nomeVendedor}.`;
  document.getElementById('cutscene-vendedor').src = sucesso
    ? imagemVendedor('comemorando')
    : imagemVendedor('frustrado');
  document.getElementById('cutscene-vendedor').alt = sucesso
    ? 'Vendedor EPAV comemorando com os clientes'
    : 'Vendedor EPAV sendo expulso pelos clientes';

  const container = document.getElementById('cutscene-clientes');
  container.innerHTML = clientes.map((cliente, indice) =>
    '<div class="cutscene-cliente" style="--atraso: ' + (indice * 90) + 'ms">' +
      '<img src="assets/images/' + cliente.id + '.png" alt="' + cliente.nome + '">' +
      '<span>' + cliente.nome + '</span>' +
    '</div>'
  ).join('');

  const falas = sucesso
    ? [
        'Lucas: “Você entendeu exatamente o que eu precisava.”',
        'Marina: “Você fez a escolha ficar muito mais fácil.”',
        'Rafael: “Gostei de como você comparou as opções.”',
        'Camila: “Você realmente prestou atenção no que eu falei.”',
        'André: “Agora sim. Isso foi atendimento de verdade!”',
        'Narrador: MESTRE DO EPAV!'
      ]
    : [
        'Lucas: “Você nem tentou entender o que eu precisava.”',
        'Marina: “Todas as respostas pareceram pressão de venda.”',
        'Rafael: “Você ignorou tudo o que eu comparei.”',
        'Camila: “Chega. Ninguém merece produto empurrado!”',
        'André: “Atendimento encerrado. Fora do escritório!”',
        `Narrador: ${estado.nomeVendedor} foi ${estado.sexoVendedor === 'feminino' ? 'expulsa' : 'expulso'}. Hora de treinar e tentar novamente.`
      ];

  const fala = document.getElementById('cutscene-fala');
  fala.textContent = falas[0];
  falas.slice(1).forEach((texto, indice) => {
    temporizadoresCutscene.push(setTimeout(() => {
      fala.textContent = texto;
      fala.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 260 }
      );
    }, (indice + 1) * 850));
  });
  mostrarTela('tela-cutscene');
  atualizarIdentidadeVendedor();
}

function encerrarCutscene() {
  temporizadoresCutscene.forEach(clearTimeout);
  temporizadoresCutscene = [];
  mostrarResultadoFinal();
}

function mostrarResultadoFinal() {
  mostrarTela('tela-final');
  if (estado.pontuacaoTotal >= 400) {
    document.querySelector('.trofeu').animate(
      [{ transform: 'scale(.5) rotate(-12deg)' }, { transform: 'scale(1.2) rotate(8deg)' }, { transform: 'scale(1)' }],
      { duration: 900 }
    );
  }
}

function salvarTentativa(classificacao) {
  const historico = lerHistorico();
  historico.push({
    data: new Date().toISOString(), pontuacao: estado.pontuacaoTotal, classificacao,
    clientes: clientes.length, erros: estado.erros, acertos: estado.acertos, maximo: 400, versao: 2,
    nomeVendedor: estado.nomeVendedor, sexoVendedor: estado.sexoVendedor
  });
  localStorage.setItem('historicoEpav', JSON.stringify(historico));
}

function lerHistorico() {
  try { return JSON.parse(localStorage.getItem('historicoEpav') || '[]'); }
  catch { return []; }
}

function salvarProgresso() {
  if (estado.etapa === 'menu' || estado.indiceClienteAtual >= clientes.length) return;
  const progresso = {
    versao: 2,
    salvoEm: new Date().toISOString(),
    etapa: estado.etapa,
    nomeVendedor: estado.nomeVendedor,
    sexoVendedor: estado.sexoVendedor,
    indiceClienteAtual: estado.indiceClienteAtual,
    clienteId: estado.clienteAtual?.id || null,
    noAtual: estado.noAtual,
    satisfacao: estado.satisfacao,
    pontuacaoAtendimento: estado.pontuacaoAtendimento,
    pontuacaoTotal: estado.pontuacaoTotal,
    erros: estado.erros,
    acertos: estado.acertos,
    decisoesRespondidas: estado.decisoesRespondidas,
    satisfacaoAcumulada: estado.satisfacaoAcumulada,
    objecoesCorretas: estado.objecoesCorretas,
    objecoesRespondidas: estado.objecoesRespondidas,
    primeiraEntradaEscritorio: estado.primeiraEntradaEscritorio,
    clientesLiberados: [...estado.clientesLiberados],
    momentoInadequado: estado.momentoInadequado,
    bonusAtendimento: estado.bonusAtendimento
  };
  localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso));
}

function lerProgresso() {
  try {
    const progresso = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO) || 'null');
    const etapasValidas = ['escritorio', 'dialogo', 'resultado'];
    if (!progresso || progresso.versao !== 2 || !etapasValidas.includes(progresso.etapa)) return null;
    if (!Number.isInteger(progresso.indiceClienteAtual) || progresso.indiceClienteAtual < 0 || progresso.indiceClienteAtual >= clientes.length) return null;
    if (progresso.etapa !== 'escritorio' && !clientes.some(cliente => cliente.id === progresso.clienteId)) return null;
    return progresso;
  } catch {
    return null;
  }
}

function continuarPartidaSalva() {
  const progresso = lerProgresso();
  if (!progresso) {
    localStorage.removeItem(CHAVE_PROGRESSO);
    atualizarResumoMenu();
    return;
  }

  estado.temporizadores.forEach(clearTimeout);
  const perfilSalvo = lerPerfilVendedor();
  Object.assign(estado, {
    nomeVendedor: String(progresso.nomeVendedor || perfilSalvo?.nomeVendedor || 'Kevin').slice(0, 20),
    sexoVendedor: progresso.sexoVendedor === 'feminino' ? 'feminino' : (perfilSalvo?.sexoVendedor || 'masculino'),
    indiceClienteAtual: progresso.indiceClienteAtual,
    clienteAtual: progresso.clienteId ? clientes.find(cliente => cliente.id === progresso.clienteId) : null,
    noAtual: progresso.noAtual,
    satisfacao: Number(progresso.satisfacao) || 0,
    pontuacaoAtendimento: Number(progresso.pontuacaoAtendimento) || 0,
    pontuacaoTotal: Number(progresso.pontuacaoTotal) || 0,
    erros: Number(progresso.erros) || 0,
    acertos: Number(progresso.acertos) || 0,
    decisoesRespondidas: Number(progresso.decisoesRespondidas) || 0,
    satisfacaoAcumulada: Number(progresso.satisfacaoAcumulada) || 0,
    objecoesCorretas: Number(progresso.objecoesCorretas) || 0,
    objecoesRespondidas: Number(progresso.objecoesRespondidas) || 0,
    primeiraEntradaEscritorio: false,
    clientesLiberados: new Set(Array.isArray(progresso.clientesLiberados) ? progresso.clientesLiberados : []),
    temporizadores: new Map(),
    momentoInadequado: Boolean(progresso.momentoInadequado),
    bonusAtendimento: Number(progresso.bonusAtendimento) || 0,
    etapa: progresso.etapa
  });
  atualizarIdentidadeVendedor();

  if (estado.etapa === 'escritorio') return mostrarEscritorio();
  if (estado.etapa === 'resultado') return mostrarResultadoAtendimento();
  restaurarAtendimento();
}

function restaurarAtendimento() {
  const cliente = estado.clienteAtual;
  const retrato = document.getElementById('cliente-retrato');
  retrato.src = `assets/images/${cliente.id}.png`;
  retrato.alt = `Retrato de ${cliente.nome}`;
  document.getElementById('vendedor-dialogo').src = imagemVendedor('parado');
  document.getElementById('nome-falante').textContent = cliente.nome.toUpperCase();
  document.getElementById('feedback-decisao').textContent = 'PARTIDA RESTAURADA · Continue de onde parou.';
  mostrarTela('tela-dialogo');
  renderizarNo();
}

function mostrarHistorico() {
  const historico = lerHistorico();
  const container = document.getElementById('lista-tentativas');
  container.innerHTML = '';
  if (!historico.length) {
    container.innerHTML = '<div class="vazio">Nenhuma missão registrada ainda.<br>Jogue uma partida para começar.</div>';
  } else {
    historico.slice().reverse().forEach((tentativa, indice) => {
      const item = document.createElement('article');
      item.className = 'item-historico';
      const numero = historico.length - indice;
      const data = new Date(tentativa.data).toLocaleDateString('pt-BR');
      const pontuacao = tentativa.maximo
        ? `${tentativa.pontuacao.toLocaleString('pt-BR')}/${tentativa.maximo} pts`
        : `${tentativa.pontuacao.toLocaleString('pt-BR')} pts`;
      const acertos = Number.isInteger(tentativa.acertos) ? ` · ${tentativa.acertos}/40 corretas` : ' · versão anterior';
      const vendedor = tentativa.nomeVendedor ? `${tentativa.nomeVendedor} · ` : '';
      item.innerHTML = `<strong>Tentativa ${numero}</strong><strong>${pontuacao}</strong><span>${tentativa.classificacao}</span><span>${data}</span><small>${vendedor}${tentativa.clientes || 5}/5 clientes${acertos} · ${tentativa.erros ?? 0} decisões a revisar</small>`;
      container.appendChild(item);
    });
  }
  mostrarTela('tela-historico');
}

function atualizarResumoMenu() {
  const historico = lerHistorico();
  const progresso = lerProgresso();
  const resumo = document.getElementById('resumo-menu');
  const botaoContinuar = document.getElementById('botao-continuar');
  if (botaoContinuar) botaoContinuar.hidden = !progresso;
  if (!resumo) return;
  if (progresso) {
    const cliente = Math.min(progresso.indiceClienteAtual + 1, clientes.length);
    const pontosEmAndamento = progresso.etapa === 'dialogo' ? Number(progresso.pontuacaoAtendimento || 0) : 0;
    const pontosSalvos = Number(progresso.pontuacaoTotal || 0) + pontosEmAndamento;
    const nome = progresso.nomeVendedor ? `${progresso.nomeVendedor} · ` : '';
    resumo.textContent = `Partida salva · ${nome}cliente ${cliente}/${clientes.length} · ${pontosSalvos.toLocaleString('pt-BR')} pontos`;
  } else if (!historico.length) resumo.textContent = 'Nenhuma missão concluída. Sua primeira negociação começa agora.';
  else {
    const historicoAtual = historico.filter(tentativa => tentativa.maximo === 400);
    if (!historicoAtual.length) resumo.textContent = 'Nova missão disponível: 5 clientes e 40 decisões para dominar.';
    else {
      const melhor = historicoAtual.reduce((a, b) => b.pontuacao > a.pontuacao ? b : a);
      resumo.textContent = `Melhor resultado: ${melhor.pontuacao}/400 pontos · ${melhor.classificacao} · ${historicoAtual.length} partida(s)`;
    }
  }
}

function abrirModalReset() {
  abrirModal('RESETAR HISTÓRICO?', 'Todo o histórico de partidas será apagado.', 'Resetar', () => {
    localStorage.removeItem('historicoEpav');
    fecharModal();
    mostrarHistorico();
  });
}

function confirmarSaida() {
  salvarProgresso();
  abrirModal('SAIR DO ATENDIMENTO?', 'Seu progresso está salvo e poderá ser retomado pelo menu.', 'Sair', () => {
    fecharModal();
    mostrarTela('tela-menu');
  });
}

function abrirModal(titulo, texto, rotulo, acao) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-texto').textContent = texto;
  const confirmar = document.getElementById('modal-confirmar');
  confirmar.textContent = rotulo;
  confirmar.onclick = acao;
  modal.hidden = false;
  confirmar.focus();
}

function fecharModal() {
  document.getElementById('modal').hidden = true;
}

document.addEventListener('keydown', evento => {
  const modalAberto = !document.getElementById('modal').hidden;
  if (evento.key === 'Escape' && modalAberto) {
    fecharModal();
    return;
  }
  if (modalAberto || evento.repeat || !document.getElementById('tela-dialogo').classList.contains('ativa')) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

  const botoes = [...document.querySelectorAll('#opcoes-resposta button:not(:disabled)')];
  if (!botoes.length) return;
  const tecla = evento.key.toUpperCase();
  let indice = /^[A-Z]$/.test(tecla) ? tecla.charCodeAt(0) - 65 : -1;
  if (/^[1-9]$/.test(evento.key)) indice = Number(evento.key) - 1;
  if (indice >= 0 && indice < botoes.length) {
    evento.preventDefault();
    botoes[indice].click();
    return;
  }

  if (!['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'].includes(tecla)) return;
  evento.preventDefault();
  const atual = botoes.indexOf(document.activeElement);
  const avanca = tecla === 'ARROWDOWN' || tecla === 'ARROWRIGHT';
  const proximo = atual < 0 ? 0 : (atual + (avanca ? 1 : -1) + botoes.length) % botoes.length;
  botoes[proximo].focus();
});

atualizarResumoMenu();
