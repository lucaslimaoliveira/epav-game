import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const nomes = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID'
};

function lerArquivoEnv() {
  try {
    return Object.fromEntries(readFileSync(resolve('.env'), 'utf8')
      .split(/\r?\n/)
      .map(linha => linha.trim())
      .filter(linha => linha && !linha.startsWith('#') && linha.includes('='))
      .map(linha => {
        const separador = linha.indexOf('=');
        const chave = linha.slice(0, separador).trim();
        let valor = linha.slice(separador + 1).trim();
        if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
          valor = valor.slice(1, -1);
        }
        return [chave, valor];
      }));
  } catch (erro) {
    if (erro.code === 'ENOENT') return {};
    throw erro;
  }
}

const arquivoEnv = lerArquivoEnv();
const config = Object.fromEntries(Object.entries(nomes).map(([campo, variavel]) => [
  campo, process.env[variavel] || arquivoEnv[variavel] || ''
]));
const ausentes = Object.entries(nomes).filter(([campo]) => !config[campo]).map(([, variavel]) => variavel);
if (ausentes.length) {
  throw new Error(`Configuração Firebase incompleta: ${ausentes.join(', ')}`);
}

const conteudo = `// Gerado durante o build; não editar nem versionar.\nwindow.EPAV_FIREBASE_CONFIG = ${JSON.stringify(config).replace(/</g, '\\u003c')};\n`;
writeFileSync(resolve('js/firebase-config.js'), conteudo, { encoding: 'utf8', flag: 'w' });
console.log('Configuração pública do Firebase gerada para o site.');
