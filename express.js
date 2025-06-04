const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

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

// Middleware
app.use(cors());
app.use(express.json());

// Conectar no banco e definir schema padrão
client.connect()
  .then(async () => {
    console.log('✅ Conectado ao banco de dados');
    await client.query('SET search_path TO cardapio_db');
  })
  .catch(err => console.error('❌ Erro de conexão:', err));

// Rotas de pedido (exemplo, mantidas)
app.get('/pedido', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM pedido');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

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

// Rota de login ajustada para campo "senha"
app.post('/login', async (req, res) => {
  const { username, senha } = req.body; // usa "senha" para bater com o front e banco

  if (!username || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  try {
    const result = await client.query(
      'SELECT * FROM usuario WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const user = result.rows[0];

    // Compara a senha recebida (em texto) com o hash armazenado
    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    res.json({ message: 'Login realizado com sucesso', username: user.username });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Inicia servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
