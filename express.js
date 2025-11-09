const express = require("express");
const cors = require("cors");
const pg = require("pg");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new pg.Pool({
  user: "neondb_owner",
  host: "ep-nameless-bread-acptp2tf-pooler.sa-east-1.aws.neon.tech",
  database: "neondb",
  password: "npg_ze3wKOsAar4u",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// garante que usa o schema
pool.query(`SET search_path TO cardapio_db`);

// ====================== LOGIN ======================
app.post("/login", async (req,res)=>{
  const {username, senha} = req.body;

  const r = await pool.query(`SELECT * FROM usuario WHERE username=$1`, [username]);
  if(r.rowCount === 0) return res.status(401).json({erro: "Usuário não encontrado"});

  const user = r.rows[0];
  const senhaOk = await bcrypt.compare(senha, user.senha);
  if(!senhaOk) return res.status(401).json({erro: "Senha incorreta"});

  res.json({ok:true})
});


// ====================== PRODUTOS ======================

// listar
app.get("/produtos", async (req,res)=>{
  const r = await pool.query("SELECT * FROM produtos ORDER BY id");
  res.json(r.rows);
});

// atualizar
app.put("/produtos/:id", async (req,res)=>{
  const {id} = req.params;
  const {nome,preco,mais_vendido} = req.body;

  await pool.query(
    "UPDATE produtos SET nome=$1, preco=$2, mais_vendido=$3 WHERE id=$4",
    [nome,preco,mais_vendido,id]
  );

  res.json({ok:true});
});

// rota que o site usa pra listar produtos
app.get("/api/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nome, preco, mais_vendido FROM produtos ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "erro ao buscar produtos" });
  }
});


app.listen(3000, ()=> console.log("API rodando em http://localhost:3000"));
