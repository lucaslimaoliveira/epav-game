# Fechando Negócio — Missão EPAV

Jogo de atendimento consultivo com progresso e histórico locais. O ranking online é opcional: terminar uma partida **não** a publica automaticamente.

## Rodar localmente

1. Copie `.env.example` para `.env` e preencha os dados do app Web do Firebase. O `.env` local deste projeto já contém a configuração informada para `epav-99b70` e não entra no Git.
2. Execute `node scripts/build-firebase-config.mjs` na raiz do projeto.
3. Sirva a pasta por HTTP, por exemplo com `python -m http.server 8000`, e abra `http://localhost:8000`.

O arquivo gerado `js/firebase-config.js` é ignorado pelo Git. Configuração de app Web do Firebase contém identificadores **públicos**, mesmo quando fornecida via GitHub Secrets; no site publicado ela sempre será visível ao navegador. A proteção real depende de Authentication e das regras do Firestore.

## Preparar o Firebase na conta do responsável

O projeto `epav-99b70` já foi informado. Na [console do Firebase](https://console.firebase.google.com/), com a conta que será dona da entrega:

1. Confirme que o projeto e o app Web `epav-99b70` pertencem a essa conta.
2. Em **Authentication → Sign-in method**, habilite **E-mail/senha**. Em **Settings → Authorized domains**, inclua o domínio de publicação, normalmente `lucaslimaoliveira.github.io`, e `localhost` para testes locais, se necessário.
3. Em **Firestore Database**, crie o banco **`(default)`**, se ainda não existir. Escolha a região com cuidado; ela não pode ser alterada depois.
4. Publique as regras e o índice de desempate deste repositório: `firebase deploy --only firestore --project epav-99b70` após autenticar o Firebase CLI na conta proprietária. Aguarde o índice ficar pronto antes de abrir o ranking. Não deixe o banco em modo de teste aberto.

O cadastro e login usam e-mail e senha, sem etapa de verificação por e-mail. As regras permitem listar até 25 resultados e escrever somente na posição do próprio usuário autenticado. Cada conta ocupa uma posição; uma nova publicação substitui a anterior. O e-mail nunca é gravado no ranking.

O tempo é contado enquanto a missão está ativa (escritório, diálogo e resumo de atendimento), pausando no menu, em modais e quando a aba fica em segundo plano. Ele é salvo junto com a partida e continua de onde parou quando ela é retomada. O ranking ordena por **mais pontos** e, em empate, por **menos tempo**. Partidas antigas, que não têm tempo registrado, continuam no histórico local, mas precisam ser jogadas novamente para publicação nesta versão. Registros antigos do Firestore sem o campo de tempo não aparecem na nova consulta até serem substituídos por uma publicação atualizada.

## Publicar com GitHub Actions

O workflow `.github/workflows/deploy-pages.yml` monta o site estático no GitHub Pages. Configure estes seis **Repository secrets** no GitHub com os valores do `.env`:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

O build falha se algum valor faltar, evitando publicar um ranking parcialmente configurado. Não coloque senha de usuário, chave de conta de serviço ou credencial de administrador nesses secrets destinados ao navegador.

## Configurar o tempo de atendimento

No repositório do GitHub, acesse **Settings → Secrets and variables → Actions → Variables → New repository variable** e crie `TEMPO_ATENDIMENTO_SEGUNDOS` com um número inteiro positivo em segundos. Por exemplo, `140` corresponde a **2 minutos e 20 segundos** para cada cliente.

Após mudar o valor, execute novamente o workflow de publicação para atualizar o site. Se a variável não estiver definida, o limite padrão é `140` segundos. Os avisos de demora e a expulsão do atendimento acompanham esse limite.

Para testar localmente, adicione `TEMPO_ATENDIMENTO_SEGUNDOS=140` ao `.env` e execute novamente `node scripts/build-firebase-config.mjs`.

## Limite de segurança do ranking

O site é estático e calcula pontos e tempo no navegador. As regras validam login, dono do registro, formato e faixas numéricas, mas **não conseguem comprovar que o jogador realmente fez aquelas escolhas ou levou aquele tempo**. Portanto, um usuário técnico ainda pode falsificar seu resultado. Para um ranking competitivo ou com premiação, será necessário validar partidas em um servidor confiável ou Cloud Functions antes de aceitar os resultados.
