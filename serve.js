// test-add-produto.js
const { Pool } = require("pg");

// Configuração do PostgreSQL
const pool = new Pool({
  user: "neondb_owner",
  host: "ep-nameless-bread-acptp2tf-pooler.sa-east-1.aws.neon.tech",
  database: "neondb",
  password: "npg_ze3wKOsAar4u",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function testInsert() {
  try {
    // Garante que sempre usa o schema correto
    await pool.query("SET search_path TO cardapio_db");

    const nome = "Produto Teste";
    const preco = 12.50;
    const mais_vendido = true;
    const imagem = "produto-teste.jpg";

    const query = `
      INSERT INTO produtos (nome, preco, mais_vendido, imagem)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [nome, preco, mais_vendido, imagem];

    const result = await pool.query(query, values);
    console.log("Produto adicionado com sucesso:", result.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar produto:", err);
  } finally {
    pool.end();
  }
}

testInsert();
