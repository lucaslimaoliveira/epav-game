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
  clientesObservados: new Set(),
  temporizadores: new Map(),
  momentoInadequado: false,
  bonusAtendimento: 0,
  fatosDescobertos: [],
  ultimaQualidade: 'neutra',
  desempenhoCategorias: {},
  desempenhoAtendimento: {},
  saldoQualidade: 0,
  clienteRecemLiberado: null,
  tempoJogadoMs: 0,
  tempoAtendimentoMs: 0,
  penalidadesTempo: 0,
  atendimentoExpulso: false,
  etapa: 'menu'
};

const CHAVE_PROGRESSO = 'progressoEpavV5';
const CHAVES_PROGRESSO_ANTIGAS = ['progressoEpavV4', 'progressoEpavV3'];
const CHAVE_PERFIL = 'perfilVendedorEpav';
let temporizadoresCutscene = [];
let temporizadorDigitacao = null;
let elementoDigitacao = null;
let concluirDigitacaoAtual = null;
let temporizadorAvancoDialogo = null;
let temporizadorInsight = null;
let ultimaTentativaId = null;
let inicioTrechoJogoMs = null;
let intervaloTempoJogo = null;
let partidaConcluida = false;
let inicioTrechoAtendimentoMs = null;
let intervaloTempoAtendimento = null;

const INICIO_DEMORA_PERCENTUAL = 0.6;
const INTERVALO_PENALIDADE_DEMORA_MS = 20000;

function tempoJogadoAtualMs() {
  const trecho = inicioTrechoJogoMs === null ? 0 : performance.now() - inicioTrechoJogoMs;
  return Math.max(0, Math.round(estado.tempoJogadoMs + trecho));
}

function pausarTempoJogo() {
  clearInterval(intervaloTempoJogo);
  intervaloTempoJogo = null;
  if (inicioTrechoJogoMs === null) return;
  estado.tempoJogadoMs = tempoJogadoAtualMs();
  inicioTrechoJogoMs = null;
  atualizarTempoEscritorio();
}

function atualizarTempoEscritorio() {
  const indicador = document.getElementById('tempo-jogo-escritorio');
  if (indicador) indicador.textContent = formatarTempoJogo(tempoJogadoAtualMs()).split(',')[0];
}

function sincronizarCronometro() {
  const tela = document.querySelector('.tela.ativa')?.id;
  const jogando = ['tela-escritorio', 'tela-dialogo', 'tela-resultado'].includes(tela)
    && !document.hidden && document.getElementById('modal').hidden && !partidaConcluida;
  if (jogando && inicioTrechoJogoMs === null) inicioTrechoJogoMs = performance.now();
  if (jogando && intervaloTempoJogo === null) {
    intervaloTempoJogo = setInterval(atualizarTempoEscritorio, 250);
  }
  if (!jogando) pausarTempoJogo();
  atualizarTempoEscritorio();
  sincronizarTempoAtendimento();
}

function formatarTempoJogo(milissegundos) {
  const totalCentessimos = Math.floor(Math.max(0, Number(milissegundos) || 0) / 10);
  const segundos = Math.floor(totalCentessimos / 100);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const parteSegundos = String(segundos % 60).padStart(2, '0');
  const parteCentessimos = String(totalCentessimos % 100).padStart(2, '0');
  return horas
    ? `${horas}:${String(minutos % 60).padStart(2, '0')}:${parteSegundos},${parteCentessimos}`
    : `${String(minutos).padStart(2, '0')}:${parteSegundos},${parteCentessimos}`;
}

function formatarTempoAtendimento(milissegundos) {
  const segundos = Math.max(0, Math.ceil((Number(milissegundos) || 0) / 1000));
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
}

function obterLimiteTempoAtendimentoMs() {
  const segundos = window.EPAV_GAME_CONFIG?.tempoAtendimentoSegundos;
  return Number.isSafeInteger(segundos * 1000) && segundos > 0 ? segundos * 1000 : 140000;
}

function tempoAtendimentoAtualMs() {
  const trecho = inicioTrechoAtendimentoMs === null ? 0 : performance.now() - inicioTrechoAtendimentoMs;
  return Math.max(0, Math.round(estado.tempoAtendimentoMs + trecho));
}

function pausarTempoAtendimento() {
  if (inicioTrechoAtendimentoMs !== null) {
    estado.tempoAtendimentoMs = tempoAtendimentoAtualMs();
    inicioTrechoAtendimentoMs = null;
  }
  clearInterval(intervaloTempoAtendimento);
  intervaloTempoAtendimento = null;
}

function deveContarTempoAtendimento() {
  return document.querySelector('.tela.ativa')?.id === 'tela-dialogo'
    && !document.hidden
    && document.getElementById('modal').hidden
    && Boolean(estado.clienteAtual)
    && !estado.atendimentoExpulso;
}

function sincronizarTempoAtendimento() {
  if (!deveContarTempoAtendimento()) return pausarTempoAtendimento();
  if (inicioTrechoAtendimentoMs === null) inicioTrechoAtendimentoMs = performance.now();
  if (!intervaloTempoAtendimento) {
    intervaloTempoAtendimento = setInterval(atualizarTemporizadorAtendimento, 250);
  }
  atualizarTemporizadorAtendimento();
}

function atualizarTemporizadorAtendimento() {
  const cliente = estado.clienteAtual;
  if (!cliente || estado.atendimentoExpulso) return;
  const limite = obterLimiteTempoAtendimentoMs();
  const decorrido = tempoAtendimentoAtualMs();
  const restante = Math.max(0, limite - decorrido);
  const indicador = document.getElementById('temporizador-atendimento');
  const texto = document.getElementById('tempo-atendimento');
  const barra = document.getElementById('barra-tempo-atendimento');
  const percentual = (restante / limite) * 100;
  if (texto) texto.textContent = formatarTempoAtendimento(restante);
  if (barra) barra.style.width = `${percentual}%`;
  if (indicador) {
    indicador.classList.toggle('alerta', percentual <= 40 && percentual > 20);
    indicador.classList.toggle('critico', percentual <= 20);
    indicador.setAttribute('aria-label', `Tempo restante: ${formatarTempoAtendimento(restante)}`);
  }

  const inicioDemora = limite * INICIO_DEMORA_PERCENTUAL;
  const penalidadesEsperadas = decorrido < inicioDemora ? 0
    : Math.floor((decorrido - inicioDemora) / INTERVALO_PENALIDADE_DEMORA_MS) + 1;
  if (penalidadesEsperadas > estado.penalidadesTempo && decorrido < limite) {
    const novasPenalidades = penalidadesEsperadas - estado.penalidadesTempo;
    const perda = novasPenalidades * 5;
    estado.penalidadesTempo = penalidadesEsperadas;
    estado.satisfacao = Math.max(0, estado.satisfacao - perda);
    estado.ultimaQualidade = 'ruim';
    atualizarBarraSatisfacao();
    atualizarEstadoConversa();
    mostrarReacaoCliente('negativa');
    exibirFeedbackDecisao(-perda, `${cliente.nome} está perdendo a paciência com a demora. Responda com mais agilidade.`, 'SATISFAÇÃO');
    salvarProgresso();
  }
  if (decorrido >= limite) expulsarAtendimentoPorDemora();
}

function expulsarAtendimentoPorDemora() {
  if (estado.atendimentoExpulso || !estado.clienteAtual) return;
  const cliente = estado.clienteAtual;
  const limite = obterLimiteTempoAtendimentoMs();
  pausarTempoAtendimento();
  estado.tempoAtendimentoMs = limite;
  estado.atendimentoExpulso = true;
  estado.satisfacao = 0;
  estado.pontuacaoAtendimento = 0;
  estado.erros += 1;
  estado.ultimaQualidade = 'muitoRuim';
  cancelarDigitacao();
  clearTimeout(temporizadorAvancoDialogo);
  document.getElementById('opcoes-resposta').hidden = true;
  document.getElementById('balao-vendedor').hidden = true;
  document.getElementById('nome-falante').textContent = cliente.nome.toUpperCase();
  document.getElementById('texto-cliente').textContent = `${cliente.nome}: Não posso esperar mais. Vou encerrar este atendimento.`;
  document.getElementById('vendedor-dialogo').src = imagemVendedor('frustrado');
  mostrarReacaoCliente('negativa');
  atualizarBarraSatisfacao();
  atualizarEstadoConversa();
  document.getElementById('pontos-dialogo').textContent = '0';
  exibirFeedbackDecisao(-10, 'Tempo esgotado: o cliente encerrou o atendimento por demora.', 'ATENDIMENTO');
  salvarProgresso();
  setTimeout(() => finalizarAtendimento(true), 1700);
}

const nomesCategorias = {
  observacao: 'Leitura do contexto',
  abordagem: 'Abordagem sem pressão',
  pergunta: 'Perguntas de descoberta',
  necessidade: 'Escuta das necessidades',
  objecao: 'Tratamento de objeções',
  oferta: 'Recomendação personalizada',
  fechamento: 'Fechamento consultivo'
};

const fasesConversa = {
  observacao: 'Lendo o contexto',
  abordagem: 'Iniciando a abordagem',
  pergunta: 'Descobrindo a necessidade',
  necessidade: 'Entendendo prioridades',
  objecao: 'Tratando uma objeção',
  oferta: 'Construindo a solução',
  fechamento: 'Confirmando a decisão'
};

function nivelReceptividade() {
  if (estado.ultimaQualidade === 'excelente') return 'receptivo';
  if (estado.ultimaQualidade === 'ruim' || estado.ultimaQualidade === 'muitoRuim') return 'fechado';
  if (estado.satisfacao >= 65) return 'receptivo';
  if (estado.satisfacao < 38) return 'fechado';
  return 'cauteloso';
}

function registrarDescoberta(descoberta) {
  if (!descoberta || estado.fatosDescobertos.some(fato => fato.chave === descoberta.chave)) return;
  estado.fatosDescobertos.push({ ...descoberta });
  atualizarFichaEscuta(true);
  mostrarInsightDescoberta(descoberta.rotulo);
}

function mostrarInsightDescoberta(texto) {
  const insight = document.getElementById('insight-descoberta');
  const rotulo = document.getElementById('texto-insight-descoberta');
  if (!insight || !rotulo) return;
  clearTimeout(temporizadorInsight);
  rotulo.textContent = texto;
  insight.hidden = false;
  insight.classList.remove('ativo');
  void insight.offsetWidth;
  insight.classList.add('ativo');
  temporizadorInsight = setTimeout(() => {
    insight.classList.remove('ativo');
    insight.hidden = true;
  }, 2600);
}

function atualizarFichaEscuta(animar = false) {
  const container = document.getElementById('fatos-descobertos');
  if (!container) return;
  container.innerHTML = '';
  if (!estado.fatosDescobertos.length) {
    container.innerHTML = '<span class="fato-vazio">Escute para descobrir necessidades.</span>';
    return;
  }
  estado.fatosDescobertos.forEach((fato, indice) => {
    const item = document.createElement('span');
    item.className = `fato-descoberto${animar && indice === estado.fatosDescobertos.length - 1 ? ' novo' : ''}`;
    item.textContent = `✓ ${fato.rotulo}`;
    container.appendChild(item);
  });
}

function atualizarEstadoConversa() {
  const elemento = document.getElementById('estado-conversa');
  if (!elemento) return;
  const nivel = nivelReceptividade();
  const textos = { receptivo: 'CLIENTE RECEPTIVO', cauteloso: 'CLIENTE CAUTELOSO', fechado: 'CLIENTE FECHADO' };
  elemento.className = `estado-conversa ${nivel}`;
  elemento.innerHTML = `<span>●</span> ${textos[nivel]}`;
}

function temFato(chave) {
  return estado.fatosDescobertos.some(fato => fato.chave === chave);
}

function prepararNo(no) {
  registrarDescoberta(no.descoberta);
  const retornoAtivo = no.retorno && temFato(no.retorno.chave);
  let texto = no.texto;
  if (estado.ultimaQualidade === 'ruim') {
    texto = `${estado.clienteAtual.nome} fica mais reservado e responde com cautela.\n\n${texto}`;
  } else if (estado.ultimaQualidade === 'excelente') {
    texto = `${estado.clienteAtual.nome} demonstra mais confiança e acrescenta um detalhe.\n\n${texto}`;
  }
  if (retornoAtivo) texto += `\n\n${estado.clienteAtual.nome.toUpperCase()}: ${no.retorno.texto}`;

  const opcoes = no.opcoes.map(opcao => ({ ...opcao }));
  if (retornoAtivo) {
    const excelente = opcoes.find(opcao => opcao.qualidade === 'excelente');
    if (excelente) {
      excelente.texto = no.retorno.opcaoExcelente;
      excelente.feedback = no.retorno.feedback;
      excelente.usouMemoria = true;
    }
  }
  if (nivelReceptividade() === 'fechado') {
    const excelente = opcoes.find(opcao => opcao.qualidade === 'excelente');
    if (excelente) excelente.texto = `Quero retomar com cuidado. ${excelente.texto}`;
    const fraca = [...opcoes].reverse().find(opcao => opcao.qualidade === 'ruim');
    if (fraca) {
      fraca.texto = 'Posso voltar um passo, ouvir melhor e só então continuar.';
      fraca.qualidade = 'boa';
      fraca.pesoQualidade = 1;
      fraca.pontos = 5;
      fraca.correta = false;
      fraca.efeitoSatisfacao = 5;
      fraca.feedback = 'Você percebeu a perda de confiança e abriu espaço para recuperar a conversa.';
      fraca.resposta = 'Tudo bem. Pode continuar, mas quero que você considere o que eu disser.';
    }
  }
  return { texto, opcoes };
}

function registrarDesempenho(opcao, pontos) {
  if (!opcao.categoria) return;
  const atual = estado.desempenhoCategorias[opcao.categoria] || { pontos: 0, maximo: 0, respostas: 0, acertos: 0 };
  atual.pontos += Math.max(0, pontos);
  atual.maximo += 10;
  atual.respostas += 1;
  if (opcao.correta) atual.acertos += 1;
  estado.desempenhoCategorias[opcao.categoria] = atual;
  const atendimento = estado.desempenhoAtendimento[opcao.categoria] || { pontos: 0, maximo: 0, respostas: 0, acertos: 0 };
  atendimento.pontos += Math.max(0, pontos);
  atendimento.maximo += 10;
  atendimento.respostas += 1;
  if (opcao.correta) atendimento.acertos += 1;
  estado.desempenhoAtendimento[opcao.categoria] = atendimento;
}

function atualizarFaseAtendimento(categoria) {
  const fase = document.getElementById('fase-atendimento');
  if (fase) fase.textContent = fasesConversa[categoria] || 'Conduzindo a conversa';
}

function tocarSomFeedback(positivo) {
  try {
    const ContextoAudio = window.AudioContext || window.webkitAudioContext;
    if (!ContextoAudio) return;
    const audio = new ContextoAudio();
    const oscilador = audio.createOscillator();
    const ganho = audio.createGain();
    oscilador.type = positivo ? 'sine' : 'triangle';
    oscilador.frequency.setValueAtTime(positivo ? 520 : 210, audio.currentTime);
    if (positivo) oscilador.frequency.exponentialRampToValueAtTime(760, audio.currentTime + .12);
    ganho.gain.setValueAtTime(.045, audio.currentTime);
    ganho.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .18);
    oscilador.connect(ganho).connect(audio.destination);
    oscilador.start();
    oscilador.stop(audio.currentTime + .18);
    oscilador.onended = () => audio.close();
  } catch { /* O jogo continua normalmente quando áudio não estiver disponível. */ }
}

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

function imagemCliente(cliente, reacao = 'neutra') {
  const arquivoReacao = reacao !== 'neutra' ? cliente.reacoes?.[reacao] : null;
  return `assets/images/${arquivoReacao || cliente.imagem || `${cliente.id}.png`}`;
}

function precarregarReacoesCliente(cliente) {
  Object.values(cliente.reacoes || {}).forEach(arquivo => {
    const imagem = new Image();
    imagem.src = `assets/images/${arquivo}`;
  });
}

function mostrarReacaoCliente(reacao = 'neutra', animar = true) {
  const cliente = estado.clienteAtual;
  const retrato = document.getElementById('cliente-retrato');
  if (!cliente || !retrato) return;
  retrato.src = imagemCliente(cliente, reacao);
  retrato.dataset.reacao = reacao;
  retrato.alt = reacao === 'positiva'
    ? `${cliente.nome} reagindo com satisfação`
    : reacao === 'negativa'
      ? `${cliente.nome} reagindo com descontentamento`
      : `Retrato de ${cliente.nome}`;
  retrato.classList.remove('reacao-ativa');
  if (animar) {
    void retrato.offsetWidth;
    retrato.classList.add('reacao-ativa');
  }
}

function personalizarTexto(texto = '') {
  const feminino = estado.sexoVendedor === 'feminino';
  return texto
    .replaceAll('[VENDEDOR]', estado.nomeVendedor)
    .replaceAll('[OBJETIVO]', feminino ? 'objetiva' : 'objetivo')
    .replaceAll('[RAPIDO]', feminino ? 'rápida' : 'rápido');
}

function cancelarDigitacao() {
  clearTimeout(temporizadorDigitacao);
  temporizadorDigitacao = null;
  if (elementoDigitacao) elementoDigitacao.classList.remove('digitando');
  elementoDigitacao = null;
  concluirDigitacaoAtual = null;
}

function concluirDigitacao() {
  if (!concluirDigitacaoAtual) return false;
  concluirDigitacaoAtual();
  return true;
}

function digitarTexto(elemento, texto, aoConcluir = () => {}) {
  cancelarDigitacao();
  const completo = personalizarTexto(texto);
  let indice = 0;
  let concluido = false;
  elementoDigitacao = elemento;
  elemento.textContent = '';
  elemento.scrollTop = 0;
  elemento.classList.add('digitando');

  const finalizar = () => {
    if (concluido) return;
    concluido = true;
    clearTimeout(temporizadorDigitacao);
    elemento.textContent = completo;
    elemento.classList.remove('digitando');
    temporizadorDigitacao = null;
    elementoDigitacao = null;
    concluirDigitacaoAtual = null;
    aoConcluir();
  };

  concluirDigitacaoAtual = finalizar;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !completo) return finalizar();

  const escrever = () => {
    indice += 1;
    elemento.textContent = completo.slice(0, indice);
    elemento.scrollTop = elemento.scrollHeight;
    if (indice >= completo.length) return finalizar();
    const caractere = completo[indice - 1];
    const pausa = /[.!?]/.test(caractere) ? 75 : /[,;:]/.test(caractere) ? 38 : 13;
    temporizadorDigitacao = setTimeout(escrever, pausa);
  };
  escrever();
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
  const telaAnterior = document.querySelector('.tela.ativa')?.id;
  if (['tela-escritorio', 'tela-dialogo', 'tela-resultado'].includes(telaAnterior)
      && !['tela-escritorio', 'tela-dialogo', 'tela-resultado'].includes(id)) {
    pausarTempoJogo();
    if (!partidaConcluida) salvarProgresso();
  }
  if (id !== 'tela-dialogo') {
    cancelarDigitacao();
    clearTimeout(temporizadorAvancoDialogo);
    clearTimeout(temporizadorInsight);
    const insight = document.getElementById('insight-descoberta');
    if (insight) insight.hidden = true;
  }
  document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
  const destino = document.getElementById(id);
  if (destino) destino.classList.add('ativa');
  sincronizarCronometro();
  if (id === 'tela-menu') atualizarResumoMenu();
}

function iniciarJogo() {
  pausarTempoJogo();
  pausarTempoAtendimento();
  partidaConcluida = false;
  ultimaTentativaId = null;
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
    clientesObservados: new Set(),
    temporizadores: new Map(),
    momentoInadequado: false,
    bonusAtendimento: 0,
    fatosDescobertos: [],
    ultimaQualidade: 'neutra',
    desempenhoCategorias: {},
    desempenhoAtendimento: {},
    saldoQualidade: 0,
    clienteRecemLiberado: null,
    tempoJogadoMs: 0,
    tempoAtendimentoMs: 0,
    penalidadesTempo: 0,
    atendimentoExpulso: false,
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
    sprite.style.transform = 'translateX(-50%)';
    sprite.style.left = '50%';
    sprite.src = imagemVendedor('parado');
  }
  renderizarMarcadores();
  salvarProgresso();
}

function atualizarProgressoMissao(emAtendimento = false) {
  const total = clientes.length;
  const atual = Math.min(estado.indiceClienteAtual + 1, total);
  const concluidos = Math.min(estado.indiceClienteAtual, total);
  const percentual = ((emAtendimento ? atual : concluidos) / total) * 100;
  const rotuloEscritorio = document.getElementById('rotulo-progresso-escritorio');
  const progressoEscritorio = document.getElementById('progresso-escritorio');
  const barraEscritorio = document.getElementById('barra-progresso-escritorio');
  const progressoDialogo = document.getElementById('progresso-dialogo');
  const barraDialogo = document.getElementById('barra-progresso-dialogo');
  if (rotuloEscritorio) rotuloEscritorio.textContent = `CLIENTE ${atual}/${total}`;
  if (progressoEscritorio) progressoEscritorio.textContent = `${concluidos}/${total}`;
  if (barraEscritorio) barraEscritorio.style.width = `${(concluidos / total) * 100}%`;
  if (progressoDialogo) progressoDialogo.textContent = `ATENDIMENTO ${atual}/${total}`;
  if (barraDialogo) barraDialogo.style.width = `${percentual}%`;
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
  atualizarProgressoMissao(false);
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
    marcador.dataset.situacao = cliente.situacao || 'livre';
    const popup = document.createElement('div');
    popup.className = 'popup-cliente';
    const observado = estado.clientesObservados.has(cliente.id);
    const rotuloContexto = cliente.rotuloSituacao || (cliente.tempoOcupadoInicial ? 'OCUPADO' : 'DISPONÍVEL');

    if (indice < estado.indiceClienteAtual) {
      marcador.classList.add('concluido');
      popup.innerHTML = `<span class="status">CONCLUÍDO</span><h4>${cliente.nome}</h4><p>Atendimento finalizado.</p>`;
    } else if (indice > estado.indiceClienteAtual) {
      marcador.classList.add('bloqueado');
      popup.innerHTML = `<span class="status contexto-${cliente.situacao || 'livre'}">${rotuloContexto}</span><h4>${cliente.nome}</h4><p>${cliente.status}. Observe o ambiente agora; o atendimento será liberado na ordem da missão.</p>`;
    } else {
      const ocupado = cliente.tempoOcupadoInicial && !estado.clientesLiberados.has(cliente.id);
      marcador.classList.add('atual');
      if (observado) marcador.classList.add('observado');
      if (estado.clienteRecemLiberado === cliente.id) marcador.classList.add('recem-liberado');
      if (ocupado) {
        marcador.classList.add('ocupado');
        popup.innerHTML = `<span class="status contexto-${cliente.situacao || 'ocupado'}">${rotuloContexto}</span><h4>${cliente.nome}</h4><p>${cliente.motivoOcupado}</p><div class="acoes-contexto"><button class="observar">${observado ? '✓ Contexto observado' : 'Observar e aguardar'}</button><button class="interromper">Interromper mesmo assim</button></div>`;
        popup.querySelector('.observar').onclick = () => observarCliente(cliente.id);
        popup.querySelector('.interromper').onclick = () => irParaAtendimento(indice, true);
        if (!estado.temporizadores.has(cliente.id)) {
          const timer = setTimeout(() => {
            estado.clientesLiberados.add(cliente.id);
            estado.clienteRecemLiberado = cliente.id;
            estado.temporizadores.delete(cliente.id);
            salvarProgresso();
            renderizarMarcadores();
          }, cliente.tempoOcupadoInicial);
          estado.temporizadores.set(cliente.id, timer);
        }
      } else if (!observado) {
        popup.innerHTML = `<span class="status contexto-livre">${rotuloContexto}</span><h4>${cliente.nome}</h4><p><strong>${cliente.area}</strong><br>${cliente.status}. Observe antes de iniciar.</p><button class="observar">Observar contexto</button>`;
        popup.querySelector('.observar').onclick = () => observarCliente(cliente.id);
      } else {
        popup.innerHTML = `<span class="status contexto-livre">DISPONÍVEL · OBSERVADO</span><h4>${cliente.nome}</h4><p><strong>${cliente.area}</strong><br>${cliente.perfil}</p><button>Atender agora</button>`;
        popup.querySelector('button').onclick = () => irParaAtendimento(indice, false);
      }
    }
    marcador.appendChild(popup);
    container.appendChild(marcador);
  });
}

function observarCliente(clienteId) {
  estado.clientesObservados.add(clienteId);
  estado.clienteRecemLiberado = null;
  salvarProgresso();
  renderizarMarcadores();
}

function irParaAtendimento(indice, momentoInadequado = false) {
  const vendedor = document.getElementById('vendedor-sprite');
  const cliente = clientes[indice];
  if (!momentoInadequado && !estado.clientesObservados.has(cliente.id)) return observarCliente(cliente.id);
  precarregarReacoesCliente(cliente);
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
  pausarTempoAtendimento();
  estado.clienteAtual = cliente;
  estado.satisfacao = cliente.satisfacaoInicial;
  estado.pontuacaoAtendimento = 0;
  estado.bonusAtendimento = 0;
  estado.fatosDescobertos = [];
  estado.ultimaQualidade = 'neutra';
  estado.desempenhoAtendimento = {};
  estado.tempoAtendimentoMs = 0;
  estado.penalidadesTempo = 0;
  estado.atendimentoExpulso = false;
  estado.noAtual = cliente.noInicial;
  estado.etapa = 'dialogo';
  if (estado.momentoInadequado) {
    estado.satisfacao = Math.max(0, estado.satisfacao - 18);
    estado.erros += 1;
  }
  mostrarReacaoCliente('neutra', false);
  document.getElementById('vendedor-dialogo').src = imagemVendedor('parado');
  document.getElementById('nome-falante').textContent = cliente.nome.toUpperCase();
  atualizarFichaEscuta();
  atualizarEstadoConversa();
  atualizarProgressoMissao(true);
  exibirFeedbackDecisao(
    estado.momentoInadequado ? -10 : null,
    estado.momentoInadequado ? 'Você interrompeu o cliente antes do momento adequado. Ele começa a conversa menos receptivo.' : ''
  );
  mostrarTela('tela-dialogo');
  sincronizarTempoAtendimento();
  salvarProgresso();
  renderizarNo();
  if (estado.momentoInadequado) {
    document.getElementById('vendedor-dialogo').src = imagemVendedor('surpreso');
  }
}

function renderizarNo() {
  if (estado.atendimentoExpulso) return;
  clearTimeout(temporizadorAvancoDialogo);
  const no = estado.clienteAtual.dialogo[estado.noAtual];
  if (!no) return finalizarAtendimento();
  const noPreparado = prepararNo(no);
  atualizarFaseAtendimento(no.opcoes[0]?.categoria);
  const balaoVendedor = document.getElementById('balao-vendedor');
  balaoVendedor.hidden = true;
  mostrarReacaoCliente(nivelReceptividade() === 'receptivo' ? 'positiva' : nivelReceptividade() === 'fechado' ? 'negativa' : 'neutra', false);
  document.getElementById('vendedor-dialogo').src = imagemVendedor('parado');
  document.getElementById('nome-falante').textContent = estado.clienteAtual.nome.toUpperCase();
  atualizarBarraSatisfacao();
  atualizarEstadoConversa();
  atualizarFichaEscuta();
  document.getElementById('pontos-dialogo').textContent = estado.pontuacaoAtendimento;
  const container = document.getElementById('opcoes-resposta');
  container.innerHTML = '';
  container.hidden = true;
  digitarTexto(document.getElementById('texto-cliente'), noPreparado.texto, () => renderizarOpcoes({ ...no, opcoes: noPreparado.opcoes }));
}

function renderizarOpcoes(no) {
  const container = document.getElementById('opcoes-resposta');
  container.hidden = false;
  embaralharOpcoes(no.opcoes).forEach((opcao, indice) => {
    const botao = document.createElement('button');
    const letra = String.fromCharCode(65 + indice);
    const numero = String(indice + 1);
    botao.dataset.letra = letra;
    botao.dataset.atalho = numero;
    botao.dataset.qualidade = opcao.qualidade;
    botao.dataset.pesoQualidade = String(opcao.pesoQualidade ?? 0);
    botao.title = `Atalho: ${letra} ou ${numero}`;
    botao.setAttribute('aria-keyshortcuts', `${letra} ${numero}`);
    botao.textContent = personalizarTexto(opcao.texto);
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
  if (estado.atendimentoExpulso) return;
  cancelarDigitacao();
  document.querySelectorAll('#opcoes-resposta button').forEach(item => item.disabled = true);
  estado.satisfacao = Math.max(0, Math.min(100, estado.satisfacao + opcao.efeitoSatisfacao));
  let pontos = 0;
  if (opcao.categoria && opcao.qualidade) {
    pontos = Number.isFinite(opcao.pontos) ? opcao.pontos : tabelaPontuacao[opcao.categoria][opcao.qualidade];
    estado.pontuacaoAtendimento = Math.max(0, estado.pontuacaoAtendimento + pontos);
    estado.decisoesRespondidas += 1;
    if (opcao.correta) estado.acertos += 1;
    else if (pontos < 0) estado.erros += 1;
    if (opcao.categoria === 'objecao') {
      estado.objecoesRespondidas += 1;
      if (opcao.correta) estado.objecoesCorretas += 1;
    }
    registrarDesempenho(opcao, pontos);
    estado.saldoQualidade += Number.isFinite(opcao.pesoQualidade)
      ? opcao.pesoQualidade
      : ({ excelente: 2, boa: 1, neutra: 0, ruim: -1, muitoRuim: -2 }[opcao.qualidade] || 0);
  }
  estado.ultimaQualidade = opcao.qualidade;
  const vendedor = document.getElementById('vendedor-dialogo');
  if (pontos < 0) vendedor.src = imagemVendedor('frustrado');
  else if (opcao.categoria === 'pergunta' || opcao.categoria === 'necessidade') vendedor.src = imagemVendedor('pensando');
  else if (pontos >= 10) vendedor.src = imagemVendedor('feliz');
  else vendedor.src = imagemVendedor('falando');
  const reacaoCliente = opcao.qualidade === 'excelente' || opcao.qualidade === 'boa'
    ? 'positiva'
    : opcao.qualidade === 'ruim' || opcao.qualidade === 'muitoRuim'
      ? 'negativa'
      : 'neutra';
  mostrarReacaoCliente(reacaoCliente);
  exibirFeedbackDecisao(pontos, opcao.feedback || 'Observe como essa escolha alterou a confiança do cliente.');
  tocarSomFeedback(pontos > 0);
  atualizarBarraSatisfacao();
  atualizarEstadoConversa();
  document.getElementById('pontos-dialogo').textContent = estado.pontuacaoAtendimento;
  estado.noAtual = typeof opcao.proximoNo === 'function' ? opcao.proximoNo(estado) : opcao.proximoNo;
  salvarProgresso();

  const container = document.getElementById('opcoes-resposta');
  const balaoVendedor = document.getElementById('balao-vendedor');
  container.hidden = true;
  balaoVendedor.hidden = false;
  document.getElementById('nome-vendedor-fala').textContent = estado.nomeVendedor.toUpperCase();
  mostrarPontosFlutuantes(pontos, balaoVendedor);
  digitarTexto(document.getElementById('texto-vendedor-fala'), opcao.texto, () => {
    temporizadorAvancoDialogo = setTimeout(() => {
      if (!opcao.resposta) return renderizarNo();
      digitarTexto(document.getElementById('texto-cliente'), opcao.resposta, () => {
        temporizadorAvancoDialogo = setTimeout(renderizarNo, 850);
      });
    }, 600);
  });
}

function exibirFeedbackDecisao(pontos, texto, rotulo = 'PONTOS') {
  const feedback = document.getElementById('feedback-decisao');
  const pontosElemento = document.getElementById('feedback-pontos');
  const textoElemento = document.getElementById('feedback-texto');
  if (!feedback || !pontosElemento || !textoElemento) return;
  if (pontos === null || pontos === undefined || !texto) {
    feedback.hidden = true;
    return;
  }
  const positivo = pontos > 0;
  const neutro = pontos === 0;
  feedback.hidden = false;
  feedback.className = `feedback-decisao ${positivo ? 'positivo' : neutro ? 'neutro' : 'negativo'}`;
  pontosElemento.textContent = `${pontos > 0 ? '+' : ''}${pontos} ${rotulo}`;
  textoElemento.textContent = texto;
  feedback.animate(
    [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 260 }
  );
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
  const emoji = document.getElementById('emoji-satisfacao');
  const novoEmoji = emojiSatisfacao(estado.satisfacao);
  const mudou = emoji.textContent !== novoEmoji;
  preenchimento.style.width = `${estado.satisfacao}%`;
  preenchimento.style.background = estado.satisfacao >= 65 ? '#58b957' : estado.satisfacao >= 40 ? '#f2b84b' : '#cf4554';
  emoji.textContent = novoEmoji;
  emoji.setAttribute('aria-label', `Satisfação ${estado.satisfacao} de 100`);
  if (mudou) emoji.animate(
    [{ transform: 'scale(.65) rotate(-8deg)' }, { transform: 'scale(1.28) rotate(5deg)' }, { transform: 'scale(1)' }],
    { duration: 380, easing: 'cubic-bezier(.2,.9,.25,1)' }
  );
}

function emojiSatisfacao(valor, reagirUltimaEscolha = true) {
  if (reagirUltimaEscolha && estado.ultimaQualidade === 'muitoRuim') return '😠';
  if (reagirUltimaEscolha && estado.ultimaQualidade === 'ruim') return '😕';
  if (reagirUltimaEscolha && estado.ultimaQualidade === 'excelente') return valor >= 75 ? '😄' : '🙂';
  if (reagirUltimaEscolha && estado.ultimaQualidade === 'boa') return valor >= 85 ? '😄' : '🙂';
  if (valor >= 80) return '😄';
  if (valor >= 60) return '🙂';
  if (valor >= 40) return '😐';
  if (valor >= 20) return '😕';
  return '😠';
}

function finalizarAtendimento(expulso = false) {
  pausarTempoAtendimento();
  estado.bonusAtendimento = 0;
  if (expulso) estado.pontuacaoAtendimento = 0;
  estado.pontuacaoTotal += estado.pontuacaoAtendimento;
  estado.satisfacaoAcumulada += estado.satisfacao;
  estado.etapa = 'resultado';
  salvarProgresso();
  mostrarResultadoAtendimento();
}

function mostrarResultadoAtendimento() {
  const expulso = estado.atendimentoExpulso;
  const titulo = estado.satisfacao >= 80 ? 'Conexão excelente!' : estado.satisfacao >= 60 ? 'Boa conversa!' : 'Há espaço para melhorar';
  const avaliacao = avaliarCompetencias(estado.desempenhoAtendimento);
  document.getElementById('sobretitulo-resultado').textContent = expulso ? 'ATENDIMENTO ENCERRADO' : 'ATENDIMENTO CONCLUÍDO';
  document.getElementById('selo-resultado').textContent = expulso ? '!' : '✓';
  document.getElementById('selo-resultado').classList.toggle('encerrado', expulso);
  document.getElementById('titulo-resultado').textContent = expulso ? 'Cliente perdeu a paciência' : titulo;
  const pontosAtendimento = document.getElementById('pontos-atendimento');
  pontosAtendimento.textContent = expulso ? '0 pontos · tempo esgotado' : `+${estado.pontuacaoAtendimento} pontos`;
  pontosAtendimento.classList.toggle('encerrado', expulso);
  document.getElementById('forte-atendimento').textContent = avaliacao.forte;
  document.getElementById('cuidado-atendimento').textContent = avaliacao.melhoria;
  document.getElementById('resumo-atendimento').textContent = `${estado.satisfacao}% ${emojiSatisfacao(estado.satisfacao, false)}`;
  const fatos = estado.fatosDescobertos.map(fato => fato.rotulo).join(' · ');
  document.getElementById('licao-atendimento').textContent = expulso
    ? `${estado.clienteAtual.nome} encerrou a conversa porque o tempo acabou. Leia o ritmo do cliente e avance com objetividade.`
    : fatos
    ? `${estado.clienteAtual.licao} Ficha de escuta: ${fatos}.`
    : estado.clienteAtual.licao;
  mostrarTela('tela-resultado');
  document.querySelector('.selo-resultado')?.animate(
    [{ transform: 'scale(.4) rotate(-14deg)' }, { transform: 'scale(1.15) rotate(4deg)' }, { transform: 'scale(1)' }],
    { duration: 620, easing: 'cubic-bezier(.2,.9,.25,1)' }
  );
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
  if (pontuacao >= 341) return feminino ? 'Mestra do EPAV' : 'Mestre do EPAV';
  if (pontuacao >= 241) return feminino ? 'Vendedora Destaque' : 'Vendedor Destaque';
  if (pontuacao >= 121) return feminino ? 'Boa Vendedora' : 'Bom Vendedor';
  return feminino ? 'Vendedora Iniciante' : 'Vendedor Iniciante';
}

function mensagemClassificacao(pontuacao) {
  if (pontuacao >= 341) return 'Você dominou o atendimento. Soube ouvir, argumentar, lidar com objeções e criar valor para o cliente.';
  if (pontuacao >= 241) return 'Você soube ouvir, entender as necessidades e lidar bem com diferentes situações.';
  if (pontuacao >= 121) return 'Você conseguiu entender boa parte das necessidades dos clientes e tomar boas decisões.';
  return 'Você começou a entender como funciona um bom atendimento. Agora é hora de praticar mais.';
}

function avaliarCompetencias(mapa = estado.desempenhoCategorias) {
  const entradas = Object.entries(mapa)
    .filter(([, dados]) => dados.respostas > 0)
    .map(([categoria, dados]) => ({
      categoria,
      percentual: dados.maximo ? Math.round((dados.pontos / dados.maximo) * 100) : 0
    }));
  if (!entradas.length) {
    return { forte: 'Escuta e identificação das necessidades.', melhoria: 'Pratique mais atendimentos para receber uma análise detalhada.' };
  }
  entradas.sort((a, b) => b.percentual - a.percentual);
  const melhor = entradas[0];
  const pior = entradas[entradas.length - 1];
  return {
    forte: `${nomesCategorias[melhor.categoria] || melhor.categoria} · ${melhor.percentual}% de aproveitamento.`,
    melhoria: pior.percentual >= 100
      ? 'Nenhum ponto crítico. Mantenha a consistência em todos os critérios.'
      : `${nomesCategorias[pior.categoria] || pior.categoria} · ${pior.percentual}% de aproveitamento.`
  };
}

function finalizarJogo() {
  if (partidaConcluida) return;
  pausarTempoJogo();
  partidaConcluida = true;
  const classificacao = calcularClassificacao(estado.pontuacaoTotal);
  const totalDecisoes = clientes.reduce((total, cliente) => total + cliente.decisoes, 0);
  const satisfacaoMedia = Math.round(estado.satisfacaoAcumulada / clientes.length);
  const desempenhoObjecoes = estado.objecoesRespondidas
    ? Math.round((estado.objecoesCorretas / estado.objecoesRespondidas) * 100) : 0;
  document.getElementById('classificacao-final').textContent = classificacao;
  document.getElementById('mensagem-final').textContent = mensagemClassificacao(estado.pontuacaoTotal);
  document.getElementById('clientes-final').textContent = `${clientes.length}/${clientes.length}`;
  const indiceQualidade = Math.max(0, Math.min(totalDecisoes, (estado.saldoQualidade + (estado.decisoesRespondidas * 2)) / 4));
  const indiceFormatado = Number.isInteger(indiceQualidade)
    ? String(indiceQualidade)
    : indiceQualidade.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  document.getElementById('decisoes-final').textContent = `${indiceFormatado}/${totalDecisoes}`;
  document.getElementById('satisfacao-final').textContent = `${satisfacaoMedia}%`;
  document.getElementById('objecoes-final').textContent = `${desempenhoObjecoes}%`;
  const avaliacao = avaliarCompetencias();
  document.getElementById('ponto-forte-final').textContent = avaliacao.forte;
  document.getElementById('melhoria-final').textContent = avaliacao.melhoria;
  document.getElementById('pontuacao-final').textContent = `${estado.pontuacaoTotal}/400 pontos · ${estado.erros} decisões a revisar · tempo ${formatarTempoJogo(estado.tempoJogadoMs)}`;
  document.getElementById('vendedor-final').src = estado.pontuacaoTotal >= 241
    ? imagemVendedor('comemorando') : imagemVendedor('feliz');
  atualizarIdentidadeVendedor();
  salvarTentativa(classificacao, indiceQualidade);
  localStorage.removeItem(CHAVE_PROGRESSO);
  if (estado.pontuacaoTotal >= 400) iniciarCutscene('sucesso');
  else if (estado.pontuacaoTotal <= 0) iniciarCutscene('fracasso');
  else mostrarResultadoFinal();
}

function iniciarCutscene(tipo) {
  temporizadoresCutscene.forEach(clearTimeout);
  temporizadoresCutscene = [];
  const sucesso = tipo === 'sucesso';
  const feminino = estado.sexoVendedor === 'feminino';
  const cenario = document.getElementById('cutscene-cenario');
  cenario.className = sucesso ? 'sucesso' : 'fracasso';
  document.getElementById('cutscene-selo').textContent = sucesso ? 'FINAL PERFEITO DESBLOQUEADO' : 'PONTUAÇÃO MÍNIMA · 0/400';
  document.getElementById('cutscene-titulo').textContent = sucesso
    ? `${estado.sexoVendedor === 'feminino' ? 'Mestra' : 'Mestre'} do EPAV · 400/400`
    : 'Fim da linha!';
  document.getElementById('cutscene-narracao').textContent = sucesso
    ? 'Você não vendeu apenas produtos. Você entendeu pessoas.'
    : `Os clientes perderam a confiança e decidiram expulsar ${estado.nomeVendedor}.`;
  document.getElementById('cutscene-vendedor').src = sucesso
    ? imagemVendedor('comemorando')
    : imagemVendedor('frustrado');
  document.getElementById('cutscene-vendedor').alt = sucesso
    ? `${feminino ? 'Vendedora' : 'Vendedor'} EPAV comemorando com os clientes`
    : `${feminino ? 'Vendedora EPAV sendo expulsa' : 'Vendedor EPAV sendo expulso'} pelos clientes`;

  const container = document.getElementById('cutscene-clientes');
  container.innerHTML = clientes.map((cliente, indice) =>
    '<div class="cutscene-cliente" style="--atraso: ' + (indice * 90) + 'ms">' +
      '<img src="' + imagemCliente(cliente) + '" alt="' + cliente.nome + '">' +
      '<span>' + cliente.nome + '</span>' +
    '</div>'
  ).join('');

  const falas = sucesso
    ? [
        'Lucas: “Esse atendimento foi muito bom.”',
        'Marina: “Você realmente entendeu o que eu precisava.”',
        'Rafael: “Agora eu sei onde vou procurar da próxima vez.”',
        `Camila: “${feminino ? 'Rápida, objetiva' : 'Rápido, objetivo'} e ainda conseguiu me ajudar.”`,
        `André: “Pode colocar ${feminino ? 'essa vendedora' : 'esse vendedor'} na equipe!”`,
        `Narrador: ${feminino ? 'MESTRA' : 'MESTRE'} DO EPAV · 400/400 — Você não vendeu apenas produtos. Você entendeu pessoas.`
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

function salvarTentativa(classificacao, indiceQualidade = null) {
  const historico = lerHistorico();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  historico.push({
    id,
    data: new Date().toISOString(), pontuacao: estado.pontuacaoTotal, classificacao,
    clientes: clientes.length, erros: estado.erros, acertos: estado.acertos, maximo: 400, versao: 6,
    nomeVendedor: estado.nomeVendedor, sexoVendedor: estado.sexoVendedor,
    tempoJogadoMs: estado.tempoJogadoMs,
    indiceQualidade,
    satisfacaoMedia: Math.round(estado.satisfacaoAcumulada / clientes.length),
    desempenhoCategorias: estado.desempenhoCategorias
  });
  localStorage.setItem('historicoEpav', JSON.stringify(historico));
  ultimaTentativaId = id;
}

function lerHistorico() {
  try { return JSON.parse(localStorage.getItem('historicoEpav') || '[]'); }
  catch { return []; }
}

function obterTentativaParaRanking(id = ultimaTentativaId) {
  if (!id) return null;
  const tentativa = lerHistorico().find(item => item.id === id);
  if (!tentativa || tentativa.versao < 6 || tentativa.maximo !== 400
      || !Number.isInteger(tentativa.tempoJogadoMs) || tentativa.tempoJogadoMs < 0) return null;
  return {
    id: tentativa.id,
    nome: String(tentativa.nomeVendedor || 'Vendedor').trim().slice(0, 20),
    pontos: tentativa.pontuacao,
    qualidadeQuartos: Math.round((tentativa.indiceQualidade || 0) * 4),
    satisfacao: Math.round(tentativa.satisfacaoMedia || 0),
    classificacao: String(tentativa.classificacao || '').slice(0, 40),
    tempoJogadoMs: tentativa.tempoJogadoMs,
    publicadoPor: tentativa.publicadoPor || null
  };
}

function marcarTentativaPublicada(id, uid) {
  const historico = lerHistorico();
  const tentativa = historico.find(item => item.id === id);
  if (!tentativa) return;
  tentativa.publicadoPor = uid;
  localStorage.setItem('historicoEpav', JSON.stringify(historico));
  if (document.getElementById('tela-historico').classList.contains('ativa')) mostrarHistorico();
}

function salvarProgresso() {
  if (estado.etapa === 'menu' || estado.indiceClienteAtual >= clientes.length) return;
  const progresso = {
    versao: 6,
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
    clientesObservados: [...estado.clientesObservados],
    momentoInadequado: estado.momentoInadequado,
    bonusAtendimento: estado.bonusAtendimento,
    fatosDescobertos: estado.fatosDescobertos,
    ultimaQualidade: estado.ultimaQualidade,
    desempenhoCategorias: estado.desempenhoCategorias,
    desempenhoAtendimento: estado.desempenhoAtendimento,
    saldoQualidade: estado.saldoQualidade,
    tempoJogadoMs: tempoJogadoAtualMs(),
    tempoAtendimentoMs: tempoAtendimentoAtualMs(),
    penalidadesTempo: estado.penalidadesTempo,
    atendimentoExpulso: estado.atendimentoExpulso,
    clienteRecemLiberado: estado.clienteRecemLiberado
  };
  localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso));
  CHAVES_PROGRESSO_ANTIGAS.forEach(chave => localStorage.removeItem(chave));
}

function lerProgresso() {
  try {
    const bruto = localStorage.getItem(CHAVE_PROGRESSO)
      || CHAVES_PROGRESSO_ANTIGAS.map(chave => localStorage.getItem(chave)).find(Boolean)
      || 'null';
    const progresso = JSON.parse(bruto);
    const etapasValidas = ['escritorio', 'dialogo', 'resultado'];
    if (!progresso || ![3, 4, 5, 6].includes(progresso.versao) || !etapasValidas.includes(progresso.etapa)) return null;
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

  pausarTempoJogo();
  pausarTempoAtendimento();
  partidaConcluida = false;
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
    clientesObservados: new Set(Array.isArray(progresso.clientesObservados) ? progresso.clientesObservados : []),
    temporizadores: new Map(),
    momentoInadequado: Boolean(progresso.momentoInadequado),
    bonusAtendimento: Number(progresso.bonusAtendimento) || 0,
    fatosDescobertos: Array.isArray(progresso.fatosDescobertos) ? progresso.fatosDescobertos : [],
    ultimaQualidade: progresso.ultimaQualidade || 'neutra',
    desempenhoCategorias: progresso.desempenhoCategorias && typeof progresso.desempenhoCategorias === 'object' ? progresso.desempenhoCategorias : {},
    desempenhoAtendimento: progresso.desempenhoAtendimento && typeof progresso.desempenhoAtendimento === 'object' ? progresso.desempenhoAtendimento : {},
    saldoQualidade: Number(progresso.saldoQualidade) || 0,
    tempoJogadoMs: Number.isFinite(progresso.tempoJogadoMs) && progresso.tempoJogadoMs >= 0
      ? Math.round(progresso.tempoJogadoMs) : 0,
    tempoAtendimentoMs: Number.isFinite(progresso.tempoAtendimentoMs) && progresso.tempoAtendimentoMs >= 0
      ? Math.round(progresso.tempoAtendimentoMs) : 0,
    penalidadesTempo: Number.isInteger(progresso.penalidadesTempo) && progresso.penalidadesTempo >= 0
      ? progresso.penalidadesTempo : 0,
    atendimentoExpulso: Boolean(progresso.atendimentoExpulso),
    clienteRecemLiberado: progresso.clienteRecemLiberado || null,
    etapa: progresso.etapa
  });
  atualizarIdentidadeVendedor();

  if (estado.etapa === 'escritorio') return mostrarEscritorio();
  if (estado.etapa === 'resultado') return mostrarResultadoAtendimento();
  restaurarAtendimento();
}

function restaurarAtendimento() {
  const cliente = estado.clienteAtual;
  if (estado.atendimentoExpulso) return finalizarAtendimento(true);
  precarregarReacoesCliente(cliente);
  mostrarReacaoCliente('neutra', false);
  document.getElementById('vendedor-dialogo').src = imagemVendedor('parado');
  document.getElementById('nome-falante').textContent = cliente.nome.toUpperCase();
  atualizarFichaEscuta();
  atualizarEstadoConversa();
  atualizarProgressoMissao(true);
  exibirFeedbackDecisao(0, 'Partida restaurada. Continue de onde parou.');
  mostrarTela('tela-dialogo');
  sincronizarTempoAtendimento();
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
      const resumoQualidade = Number.isFinite(tentativa.indiceQualidade)
        ? ` · qualidade ${tentativa.indiceQualidade.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/40`
        : Number.isInteger(tentativa.acertos) ? ` · ${tentativa.acertos}/40 corretas` : ' · versão anterior';
      const vendedor = tentativa.nomeVendedor ? `${tentativa.nomeVendedor} · ` : '';
      const campos = [
        ['strong', `Tentativa ${numero}`],
        ['strong', pontuacao],
        ['span', String(tentativa.classificacao || '')],
        ['span', data],
        ['small', `${vendedor}${tentativa.clientes || 5}/5 clientes${resumoQualidade} · ${tentativa.erros ?? 0} decisões a revisar${Number.isInteger(tentativa.tempoJogadoMs) ? ` · tempo ${formatarTempoJogo(tentativa.tempoJogadoMs)}` : ''}`]
      ];
      campos.forEach(([tag, texto]) => {
        const campo = document.createElement(tag);
        campo.textContent = texto;
        item.appendChild(campo);
      });
      if (tentativa.id && tentativa.versao >= 6 && tentativa.maximo === 400) {
        const publicar = document.createElement('button');
        publicar.type = 'button';
        publicar.className = 'botao publicar-historico';
        publicar.textContent = tentativa.publicadoPor ? '✓ Publicada no ranking' : 'Publicar no ranking';
        publicar.disabled = Boolean(tentativa.publicadoPor);
        publicar.onclick = () => window.EpavRanking.publicarTentativa(tentativa.id);
        item.appendChild(publicar);
      }
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
    const tempoSalvo = Number.isFinite(progresso.tempoJogadoMs)
      ? ` · tempo ${formatarTempoJogo(progresso.tempoJogadoMs)}` : '';
    resumo.textContent = `Partida salva · ${nome}cliente ${cliente}/${clientes.length} · ${pontosSalvos.toLocaleString('pt-BR')} pontos${tempoSalvo}`;
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
  pausarTempoJogo();
  pausarTempoAtendimento();
  salvarProgresso();
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
  sincronizarCronometro();
  sincronizarTempoAtendimento();
}

document.addEventListener('visibilitychange', () => {
  sincronizarCronometro();
  sincronizarTempoAtendimento();
  if (document.hidden) salvarProgresso();
});
window.addEventListener('pagehide', () => {
  pausarTempoJogo();
  pausarTempoAtendimento();
  salvarProgresso();
});

document.addEventListener('keydown', evento => {
  const modalAberto = !document.getElementById('modal').hidden;
  if (evento.key === 'Escape' && modalAberto) {
    fecharModal();
    return;
  }
  if (modalAberto || evento.repeat || !document.getElementById('tela-dialogo').classList.contains('ativa')) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

  const botoes = [...document.querySelectorAll('#opcoes-resposta button:not(:disabled)')];
  if (!botoes.length) {
    if ((evento.key === 'Enter' || evento.key === ' ') && concluirDigitacao()) evento.preventDefault();
    return;
  }
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

document.getElementById('balao-fala').addEventListener('click', concluirDigitacao);
document.getElementById('balao-vendedor').addEventListener('click', concluirDigitacao);

atualizarResumoMenu();
