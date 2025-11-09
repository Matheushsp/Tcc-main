const express = require("express");
const cors = require("cors");
const pg = require("pg");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do PostgreSQL (Neon)
const pool = new pg.Pool({
  user: "neondb_owner",
  host: "ep-nameless-bread-acptp2tf-pooler.sa-east-1.aws.neon.tech",
  database: "neondb",
  password: "npg_ze3wKOsAar4u",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// Garante que sempre usa o schema cardapio_db
pool.query(`SET search_path TO cardapio_db`);

// ====================== LOGIN ======================
app.post("/login", async (req, res) => {
  const { username, senha } = req.body;

  if (!username || !senha) return res.status(400).json({ erro: "Usuário e senha obrigatórios" });

  try {
    const r = await pool.query("SELECT * FROM usuario WHERE username=$1", [username]);
    if (r.rowCount === 0) return res.status(401).json({ erro: "Usuário não encontrado" });

    const user = r.rows[0];
    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) return res.status(401).json({ erro: "Senha incorreta" });

    res.json({ ok: true, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ====================== PRODUTOS ======================

// Listar todos os produtos
app.get("/produtos", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM produtos ORDER BY id");
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

// Atualizar produto
app.put("/produtos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, preco, mais_vendido } = req.body;

  try {
    await pool.query(
      "UPDATE produtos SET nome=$1, preco=$2, mais_vendido=$3 WHERE id=$4",
      [nome, preco, mais_vendido, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar produto" });
  }
});

// Rota compatível com front
app.get("/api/produtos", async (req, res) => {
  try {
    const r = await pool.query("SELECT id, nome, preco, mais_vendido FROM produtos ORDER BY id");
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

// ====================== PEDIDO ======================

// Listar pedidos
app.get("/pedido", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM pedido ORDER BY id DESC");
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
});

// Criar pedido
app.post("/pedido", async (req, res) => {
  const { cliente_nome, cliente_telefone, itens, total, endereco } = req.body;

  if (!cliente_nome || !cliente_telefone || !itens || !total || !endereco) {
    return res.status(400).json({ erro: "Dados do pedido incompletos" });
  }

  try {
    const r = await pool.query(
      `INSERT INTO pedido (cliente_nome, cliente_telefone, itens, total, endereco)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cliente_nome, cliente_telefone, JSON.stringify(itens), total, endereco]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar pedido" });
  }
});

app.post('https://tcc-uh9r.onrender.com/api/produtos', async (req, res) => {
  const { nome, preco, mais_vendido, imagem } = req.body;
  // código para inserir no banco
});


// ====================== INÍCIO DO SERVIDOR ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
