const estado = {
  indiceClienteAtual: 0,
  clienteAtual: null,
  noAtual: null,
  satisfacao: 0,
  pontuacaoAtendimento: 0,
  pontuacaoTotal: 0,
  erros: 0,
  primeiraEntradaEscritorio: true,
  clientesLiberados: new Set(),
  temporizadores: new Map(),
  momentoInadequado: false
};

const tabelaPontuacao = {
  observacao:  { excelente: 100, boa: 60, neutra: 0, ruim: -100, muitoRuim: -200 },
  abordagem:   { excelente: 200, boa: 120, neutra: 0, ruim: -100, muitoRuim: -200 },
  pergunta:    { excelente: 250, boa: 150, neutra: 0, ruim: -80, muitoRuim: -150 },
  necessidade: { excelente: 400, boa: 240, neutra: 0, ruim: -125, muitoRuim: -250 },
  objecao:     { excelente: 500, boa: 300, neutra: 0, ruim: -150, muitoRuim: -300 },
  oferta:      { excelente: 400, boa: 240, neutra: 0, ruim: -100, muitoRuim: -200 },
  fechamento:  { excelente: 700, boa: 420, neutra: 0, ruim: -150, muitoRuim: -300 }
};

const framesAndando = [1, 2, 3, 4].map(numero => `assets/images/vendedor-andando-${numero}.png`);

function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
  const destino = document.getElementById(id);
  if (destino) destino.classList.add('ativa');
  if (id === 'tela-menu') atualizarResumoMenu();
}

function iniciarJogo() {
  estado.temporizadores.forEach(clearTimeout);
  Object.assign(estado, {
    indiceClienteAtual: 0,
    clienteAtual: null,
    noAtual: null,
    satisfacao: 0,
    pontuacaoAtendimento: 0,
    pontuacaoTotal: 0,
    erros: 0,
    primeiraEntradaEscritorio: true,
    clientesLiberados: new Set(),
    temporizadores: new Map(),
    momentoInadequado: false
  });
  mostrarEscritorio();
}

function mostrarEscritorio() {
  mostrarTela('tela-escritorio');
  const sprite = document.getElementById('vendedor-sprite');
  sprite.style.top = '';
  if (estado.primeiraEntradaEscritorio) {
    animarChegada();
    estado.primeiraEntradaEscritorio = false;
  } else {
    sprite.style.transition = 'none';
    sprite.style.left = '3%';
    sprite.src = 'assets/images/vendedor-parado.png';
  }
  renderizarMarcadores();
}

function animarChegada() {
  const sprite = document.getElementById('vendedor-sprite');
  sprite.style.transition = 'none';
  sprite.style.left = '-18%';
  let frameAtual = 0;
  const intervalo = setInterval(() => {
    sprite.src = framesAndando[frameAtual % framesAndando.length];
    frameAtual += 1;
  }, 145);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sprite.style.transition = 'left 1.7s cubic-bezier(.2,.8,.2,1)';
    sprite.style.left = '3%';
  }));
  setTimeout(() => {
    clearInterval(intervalo);
    sprite.src = 'assets/images/vendedor-parado.png';
  }, 1750);
}

function renderizarMarcadores() {
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
  vendedor.src = framesAndando[0];
  vendedor.style.transition = 'left .9s ease, top .9s ease';
  vendedor.style.left = `${cliente.x}%`;
  vendedor.style.top = `${Math.min(cliente.y + 18, 72)}%`;
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
  estado.noAtual = cliente.noInicial;
  if (estado.momentoInadequado) {
    estado.satisfacao = Math.max(0, estado.satisfacao - 18);
    estado.pontuacaoAtendimento -= 200;
    estado.erros += 1;
  }
  const retrato = document.getElementById('cliente-retrato');
  retrato.src = `assets/images/${cliente.id}.png`;
  retrato.alt = `Retrato de ${cliente.nome}`;
  document.getElementById('vendedor-dialogo').src = 'assets/images/vendedor-parado.png';
  document.getElementById('nome-falante').textContent = cliente.nome.toUpperCase();
  document.getElementById('feedback-decisao').textContent = estado.momentoInadequado
    ? '−200 · MOMENTO INADEQUADO — Observe o contexto antes de abordar.' : '';
  mostrarTela('tela-dialogo');
  renderizarNo();
  if (estado.momentoInadequado) {
    document.getElementById('vendedor-dialogo').src = 'assets/images/vendedor-surpreso.png';
  }
}

function renderizarNo() {
  const no = estado.clienteAtual.dialogo[estado.noAtual];
  if (!no) return finalizarAtendimento();
  document.getElementById('texto-cliente').textContent = no.texto;
  document.getElementById('vendedor-dialogo').src = 'assets/images/vendedor-parado.png';
  document.getElementById('nome-falante').textContent = estado.clienteAtual.nome.toUpperCase();
  atualizarBarraSatisfacao();
  document.getElementById('pontos-dialogo').textContent = estado.pontuacaoAtendimento;
  const container = document.getElementById('opcoes-resposta');
  container.innerHTML = '';
  no.opcoes.forEach((opcao, indice) => {
    const botao = document.createElement('button');
    botao.dataset.letra = String.fromCharCode(65 + indice);
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
    pontos = tabelaPontuacao[opcao.categoria][opcao.qualidade];
    estado.pontuacaoAtendimento += pontos;
    if (pontos < 0) estado.erros += 1;
    mostrarPontosFlutuantes(pontos, botao);
  }
  const vendedor = document.getElementById('vendedor-dialogo');
  if (pontos < 0) vendedor.src = 'assets/images/vendedor-frustrado.png';
  else if (opcao.categoria === 'pergunta' || opcao.categoria === 'necessidade') vendedor.src = 'assets/images/vendedor-pensando.png';
  else if (pontos >= 400) vendedor.src = 'assets/images/vendedor-feliz.png';
  else vendedor.src = 'assets/images/vendedor-falando.png';
  document.getElementById('feedback-decisao').textContent = opcao.feedback || '';
  atualizarBarraSatisfacao();
  document.getElementById('pontos-dialogo').textContent = estado.pontuacaoAtendimento;
  estado.noAtual = typeof opcao.proximoNo === 'function' ? opcao.proximoNo(estado) : opcao.proximoNo;
  setTimeout(renderizarNo, 1150);
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
  const bonus = estado.satisfacao >= 80 ? 300 : estado.satisfacao >= 65 ? 150 : 0;
  estado.pontuacaoAtendimento += bonus;
  estado.pontuacaoTotal += estado.pontuacaoAtendimento;
  const titulo = estado.satisfacao >= 80 ? 'Conexão excelente!' : estado.satisfacao >= 60 ? 'Boa conversa!' : 'Há espaço para melhorar';
  document.getElementById('titulo-resultado').textContent = titulo;
  document.getElementById('resumo-atendimento').textContent = `${estado.clienteAtual.nome}: ${estado.pontuacaoAtendimento} pontos · satisfação ${estado.satisfacao}% ${emojiSatisfacao(estado.satisfacao)}${bonus ? ` · bônus +${bonus}` : ''}`;
  document.getElementById('licao-atendimento').textContent = estado.clienteAtual.licao;
  mostrarTela('tela-resultado');
}

function continuarAposResultado() {
  estado.indiceClienteAtual += 1;
  estado.momentoInadequado = false;
  if (estado.indiceClienteAtual < clientes.length) mostrarEscritorio();
  else finalizarJogo();
}

function calcularClassificacao(pontuacao) {
  if (pontuacao >= 9600) return 'Mestre do EPAV';
  if (pontuacao >= 7600) return 'Vendedor Destaque';
  if (pontuacao >= 5200) return 'Bom Vendedor';
  return 'Vendedor em Formação';
}

function finalizarJogo() {
  const classificacao = calcularClassificacao(estado.pontuacaoTotal);
  document.getElementById('classificacao-final').textContent = classificacao;
  document.getElementById('pontuacao-final').textContent = `${estado.pontuacaoTotal.toLocaleString('pt-BR')} pontos · ${estado.erros} decisões a revisar`;
  document.getElementById('vendedor-final').src = classificacao === 'Mestre do EPAV'
    ? 'assets/images/vendedor-comemorando.png' : 'assets/images/vendedor-feliz.png';
  salvarTentativa(classificacao);
  mostrarTela('tela-final');
  if (classificacao === 'Mestre do EPAV') document.querySelector('.trofeu').animate([{ transform: 'scale(.5) rotate(-12deg)' }, { transform: 'scale(1.2) rotate(8deg)' }, { transform: 'scale(1)' }], { duration: 900 });
}

function salvarTentativa(classificacao) {
  const historico = lerHistorico();
  historico.push({
    data: new Date().toISOString(), pontuacao: estado.pontuacaoTotal, classificacao,
    clientes: clientes.length, erros: estado.erros
  });
  localStorage.setItem('historicoEpav', JSON.stringify(historico));
}

function lerHistorico() {
  try { return JSON.parse(localStorage.getItem('historicoEpav') || '[]'); }
  catch { return []; }
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
      item.innerHTML = `<strong>Tentativa ${numero}</strong><strong>${tentativa.pontuacao.toLocaleString('pt-BR')} pts</strong><span>${tentativa.classificacao}</span><span>${data}</span><small>${tentativa.clientes || 5}/5 clientes · ${tentativa.erros ?? 0} decisões a revisar</small>`;
      container.appendChild(item);
    });
  }
  mostrarTela('tela-historico');
}

function atualizarResumoMenu() {
  const historico = lerHistorico();
  const resumo = document.getElementById('resumo-menu');
  if (!resumo) return;
  if (!historico.length) resumo.textContent = 'Nenhuma missão concluída. Sua primeira negociação começa agora.';
  else {
    const melhor = historico.reduce((a, b) => b.pontuacao > a.pontuacao ? b : a);
    resumo.textContent = `Melhor resultado: ${melhor.pontuacao.toLocaleString('pt-BR')} pontos · ${melhor.classificacao} · ${historico.length} partida(s)`;
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
  abrirModal('SAIR DO ATENDIMENTO?', 'O progresso desta partida será perdido.', 'Sair', () => {
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
  if (evento.key === 'Escape' && !document.getElementById('modal').hidden) fecharModal();
});

atualizarResumoMenu();
