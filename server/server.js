const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./epav.db');
db.run(`CREATE TABLE IF NOT EXISTS tentativas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jogador TEXT,
  pontuacao INTEGER,
  classificacao TEXT,
  data TEXT
)`);

app.post('/tentativas', (req, res) => {
  const { jogador, pontuacao, classificacao } = req.body;
  db.run(
    'INSERT INTO tentativas (jogador, pontuacao, classificacao, data) VALUES (?, ?, ?, ?)',
    [jogador, pontuacao, classificacao, new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.get('/tentativas/:jogador', (req, res) => {
  db.all('SELECT * FROM tentativas WHERE jogador = ? ORDER BY data DESC', [req.params.jogador], (err, linhas) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(linhas);
  });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));