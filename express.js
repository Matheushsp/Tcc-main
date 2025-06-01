const express = require('express');
const { Client } = require('pg');
const app = express();
const cors = require('cors');
app.use(cors());
const port = 3000;

// Permitir leitura de JSON no body das requisições
app.use(express.json());

// Configuração da conexão com o PostgreSQL (Neon)
const client = new Client({
  user: "neondb_owner",
  host: "ep-nameless-bread-acptp2tf-pooler.sa-east-1.aws.neon.tech",
  database: "neondb",
  password: "npg_ze3wKOsAar4u",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Conexão com o banco e definição do schema padrão
client.connect()
  .then(async () => {
    console.log('✅ Conectado ao banco de dados');
    await client.query('SET search_path TO cardapio_db'); // usa o schema correto
  })
  .catch(err => console.error('❌ Erro de conexão:', err));

// GET /pedidos → lista todos os pedidos
app.get('/pedido', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM pedido');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// POST /pedidos → salva um novo pedido
app.post('/pedido', async (req, res) => {
  const { cliente_nome, cliente_telefone, itens, total, endereco } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO pedido (cliente_nome, cliente_telefone, itens, total, endereco)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cliente_nome, cliente_telefone, JSON.stringify(itens), total, endereco]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    res.status(500).json({ error: 'Erro ao salvar pedido' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
