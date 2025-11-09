import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// LISTAR
app.get("/api/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({erro:"erro ao listar"});
  }
});

// ATUALIZAR
app.put("/produtos/:id", async (req,res)=>{
  const { id } = req.params;
  const { nome, preco, mais_vendido, imagem } = req.body;

  try {
    await pool.query(
      "UPDATE produtos SET nome=$1, preco=$2, mais_vendido=$3, imagem=$4 WHERE id=$5",
      [nome, preco, mais_vendido, imagem, id]
    );
    res.json({ok:true});
  } catch(err){
    res.status(500).json({erro:"erro ao atualizar"});
  }
});

// ADICIONAR
app.post("/produtos", async(req,res)=>{
  const { nome, preco, mais_vendido, imagem } = req.body;

  try {
    await pool.query(
      "INSERT INTO produtos (nome, preco, mais_vendido, imagem) VALUES ($1,$2,$3,$4)",
      [nome, preco, mais_vendido, imagem]
    );
    res.json({ok:true});
  } catch(err){
    res.status(500).json({erro:"erro ao adicionar"});
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("API rodando");
});
