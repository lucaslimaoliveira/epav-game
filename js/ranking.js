/* Ranking opcional. Nenhuma partida é enviada sem confirmação do jogador. */
(() => {
  'use strict';

  const versaoSdk = '12.18.0';
  let servicosPromise = null;
  let usuario = null;
  let tentativaPendente = null;
  let publicando = false;

  const elemento = id => document.getElementById(id);

  function mensagemErro(erro, contexto = 'conta') {
    const mensagens = {
      'auth/invalid-email': 'Confira o endereço de e-mail.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/wrong-password': 'E-mail ou senha incorretos.',
      'auth/email-already-in-use': 'Este e-mail já possui conta. Use Entrar.',
      'auth/weak-password': 'Use uma senha com pelo menos 6 caracteres.',
      'auth/operation-not-allowed': 'Ative E-mail/senha em Firebase Authentication → Sign-in method.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
      'auth/network-request-failed': 'Não foi possível conectar. Confira sua internet e tente novamente.',
      'auth/unauthorized-domain': 'O domínio deste site precisa ser autorizado no Firebase Authentication.',
      'failed-precondition': 'O banco Firestore (default) ainda não está pronto.',
      'unavailable': 'O Firestore está indisponível no momento. Tente novamente mais tarde.'
    };
    if (erro?.message === 'CONFIG_AUSENTE') return 'Configuração do Firebase não gerada. Consulte o README.';
    if (erro?.code === 'permission-denied') return contexto === 'ranking'
      ? 'As regras atuais do Firestore não permitem ler o ranking. Publique firestore.rules no projeto epav-99b70.'
      : 'O Firestore recusou a publicação. Confira as regras do banco.';
    if (erro?.code === 'failed-precondition' && contexto === 'ranking')
      return 'O Firestore ou o índice de desempate ainda não está pronto. Confira o banco e publique os índices.';
    if (erro?.code && mensagens[erro.code]) return mensagens[erro.code];
    if (!navigator.onLine) return 'Sem conexão. O jogo local continua disponível; tente novamente quando estiver online.';
    return 'Não foi possível conectar ao ranking. Confira a configuração do Firebase e tente novamente.';
  }

  function statusConta(texto, tipo = '') {
    const destino = elemento('conta-status');
    destino.textContent = texto;
    destino.className = `conta-status ${tipo}`.trim();
  }

  async function carregarServicos() {
    if (servicosPromise) return servicosPromise;
    servicosPromise = (async () => {
      const config = window.EPAV_FIREBASE_CONFIG;
      if (!config || !config.apiKey || !config.projectId || !config.appId) throw new Error('CONFIG_AUSENTE');
      const base = `https://www.gstatic.com/firebasejs/${versaoSdk}`;
      const [appSdk, authSdk, firestoreSdk] = await Promise.all([
        import(`${base}/firebase-app.js`),
        import(`${base}/firebase-auth.js`),
        import(`${base}/firebase-firestore.js`)
      ]);
      const app = appSdk.initializeApp(config);
      const auth = authSdk.getAuth(app);
      auth.languageCode = 'pt';
      const db = firestoreSdk.getFirestore(app); // Banco (default).
      await new Promise((resolve, reject) => {
        let primeiraResposta = true;
        authSdk.onAuthStateChanged(auth, pessoa => {
          usuario = pessoa;
          atualizarContaUI();
          if (primeiraResposta) {
            primeiraResposta = false;
            resolve();
          }
        }, reject);
      });
      return { auth, db, authSdk, firestoreSdk };
    })().catch(erro => {
      servicosPromise = null;
      throw erro;
    });
    return servicosPromise;
  }

  function atualizarContaUI() {
    elemento('conta-formulario').hidden = Boolean(usuario);
    elemento('conta-logada').hidden = !usuario;
    elemento('conta-email-logado').textContent = usuario?.email || '';
    elemento('conta-publicacao').hidden = !tentativaPendente;
    elemento('conta-publicar').disabled = !tentativaPendente || !usuario || publicando;
    const tentativa = tentativaPendente ? obterTentativaParaRanking(tentativaPendente) : null;
    elemento('conta-publicacao-resumo').textContent = tentativa
      ? `${tentativa.nome} · ${tentativa.pontos}/400 pontos · tempo ${formatarTempoJogo(tentativa.tempoJogadoMs)}`
      : '';
    elemento('ranking-conta-texto').textContent = usuario
      ? `${usuario.email} · conta conectada`
      : 'Entre por e-mail para publicar uma partida.';
    elemento('ranking-conta-botao').textContent = usuario ? 'Minha conta' : 'Entrar';
    const tentativaAtual = obterTentativaParaRanking();
    const botaoFinal = elemento('botao-publicar-ranking');
    if (botaoFinal) {
      botaoFinal.textContent = tentativaAtual?.publicadoPor
        ? '✓ Publicado no ranking'
        : '★ Publicar no ranking';
      botaoFinal.disabled = Boolean(tentativaAtual?.publicadoPor);
    }
  }

  async function abrirConta() {
    elemento('modal-conta').hidden = false;
    statusConta('Conectando à conta…');
    elemento('conta-email').focus();
    try {
      await carregarServicos();
      statusConta(usuario ? 'Conta pronta. Você já pode publicar sua partida.' : 'Entre ou crie uma conta por e-mail e senha.');
    } catch (erro) {
      statusConta(mensagemErro(erro), 'erro');
    }
  }

  function fecharConta() {
    elemento('modal-conta').hidden = true;
    tentativaPendente = null;
    atualizarContaUI();
  }

  async function entrar(evento) {
    evento.preventDefault();
    if (!elemento('conta-formulario').reportValidity()) return;
    statusConta('Entrando…');
    try {
      const { auth, authSdk } = await carregarServicos();
      await authSdk.signInWithEmailAndPassword(auth, elemento('conta-email').value.trim(), elemento('conta-senha').value);
      elemento('conta-senha').value = '';
      statusConta('Login realizado.', 'sucesso');
    } catch (erro) {
      statusConta(mensagemErro(erro), 'erro');
    }
  }

  async function criarConta() {
    if (!elemento('conta-formulario').reportValidity()) return;
    statusConta('Criando conta…');
    try {
      const { auth, authSdk } = await carregarServicos();
      await authSdk.createUserWithEmailAndPassword(auth, elemento('conta-email').value.trim(), elemento('conta-senha').value);
      elemento('conta-senha').value = '';
      statusConta('Conta criada. Você já pode publicar sua partida.', 'sucesso');
    } catch (erro) {
      statusConta(mensagemErro(erro), 'erro');
    }
  }

  async function recuperarSenha() {
    const campo = elemento('conta-email');
    if (!campo.value || !campo.checkValidity()) {
      campo.focus();
      campo.reportValidity();
      return;
    }
    statusConta('Enviando instruções…');
    try {
      const { auth, authSdk } = await carregarServicos();
      await authSdk.sendPasswordResetEmail(auth, campo.value.trim());
      statusConta('Se a conta existir, enviaremos instruções para esse e-mail.', 'sucesso');
    } catch (erro) {
      statusConta(mensagemErro(erro), 'erro');
    }
  }

  async function sair() {
    try {
      const { auth, authSdk } = await carregarServicos();
      await authSdk.signOut(auth);
      statusConta('Você saiu da conta.', 'sucesso');
    } catch (erro) {
      statusConta(mensagemErro(erro), 'erro');
    }
  }

  function publicarTentativa(id) {
    const tentativa = obterTentativaParaRanking(id);
    if (!tentativa) {
      const aviso = elemento('ranking-status');
      if (aviso) aviso.textContent = 'Conclua uma nova partida para publicá-la no ranking.';
      return;
    }
    if (tentativa.publicadoPor) {
      const aviso = elemento('ranking-status');
      if (aviso) aviso.textContent = 'Esta partida já foi publicada. Termine outra para atualizar sua posição.';
      return;
    }
    tentativaPendente = tentativa.id;
    atualizarContaUI();
    abrirConta();
  }

  async function confirmarPublicacao() {
    const tentativa = obterTentativaParaRanking(tentativaPendente);
    if (!tentativa || !usuario || publicando) return;
    publicando = true;
    atualizarContaUI();
    statusConta('Publicando sua partida…');
    try {
      const { db, firestoreSdk } = await carregarServicos();
      await firestoreSdk.setDoc(firestoreSdk.doc(db, 'ranking', usuario.uid), {
        uid: usuario.uid,
        nome: tentativa.nome,
        pontos: tentativa.pontos,
        qualidadeQuartos: tentativa.qualidadeQuartos,
        satisfacao: tentativa.satisfacao,
        classificacao: tentativa.classificacao,
        tempoJogadoMs: tentativa.tempoJogadoMs,
        publicadoEm: firestoreSdk.serverTimestamp(),
        versao: 2
      });
      marcarTentativaPublicada(tentativa.id, usuario.uid);
      tentativaPendente = null;
      elemento('modal-conta').hidden = true;
      atualizarContaUI();
      if (elemento('tela-ranking').classList.contains('ativa')) carregarRanking();
    } catch (erro) {
      statusConta(mensagemErro(erro), 'erro');
    } finally {
      publicando = false;
      atualizarContaUI();
    }
  }

  async function abrirRanking() {
    mostrarTela('tela-ranking');
    await carregarRanking();
  }

  async function carregarRanking() {
    const lista = elemento('ranking-lista');
    const status = elemento('ranking-status');
    lista.replaceChildren();
    status.textContent = 'Carregando resultados…';
    try {
      const { db, firestoreSdk } = await carregarServicos();
      const consulta = firestoreSdk.query(
        firestoreSdk.collection(db, 'ranking'),
        firestoreSdk.orderBy('pontos', 'desc'),
        firestoreSdk.orderBy('tempoJogadoMs', 'asc'),
        firestoreSdk.limit(20)
      );
      const resultados = await firestoreSdk.getDocs(consulta);
      if (resultados.empty) {
        status.textContent = 'Ainda não há partidas publicadas. Você pode inaugurar o ranking!';
        return;
      }
      resultados.docs.forEach((documento, indice) => {
        const dados = documento.data();
        const item = document.createElement('li');
        item.className = 'ranking-item';
        const posicao = document.createElement('span');
        posicao.className = 'ranking-posicao';
        posicao.textContent = `#${String(indice + 1).padStart(2, '0')}`;
        const jogador = document.createElement('div');
        jogador.className = 'ranking-jogador';
        const nome = document.createElement('strong');
        nome.textContent = String(dados.nome || 'Vendedor').slice(0, 20);
        const detalhes = document.createElement('small');
        detalhes.textContent = `Tempo ${formatarTempoJogo(dados.tempoJogadoMs)} · qualidade ${(Number(dados.qualidadeQuartos) / 4).toLocaleString('pt-BR')}/40 · satisfação ${Number(dados.satisfacao) || 0}%`;
        jogador.append(nome, detalhes);
        const pontos = document.createElement('span');
        pontos.className = 'ranking-pontos';
        pontos.textContent = String(dados.pontos ?? 0);
        const rotulo = document.createElement('small');
        rotulo.textContent = 'PONTOS';
        pontos.append(rotulo);
        item.append(posicao, jogador, pontos);
        lista.append(item);
      });
      status.textContent = `${resultados.size} resultado(s) · maior pontuação, depois menor tempo`;
    } catch (erro) {
      status.textContent = mensagemErro(erro, 'ranking');
    }
  }

  elemento('conta-formulario').addEventListener('submit', entrar);
  elemento('conta-criar').addEventListener('click', criarConta);
  elemento('conta-recuperar').addEventListener('click', recuperarSenha);
  elemento('conta-sair').addEventListener('click', sair);
  elemento('conta-publicar').addEventListener('click', confirmarPublicacao);
  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && !elemento('modal-conta').hidden) fecharConta();
  });

  window.EpavRanking = { abrirRanking, carregarRanking, abrirConta, fecharConta, publicarTentativa };
  atualizarContaUI();
})();
