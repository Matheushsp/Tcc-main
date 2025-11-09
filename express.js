const { Client } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const client = new Client({
  user: "neondb_owner",
  host: "ep-nameless-bread-acptp2tf-pooler.sa-east-1.aws.neon.tech",
  database: "neondb",
  password: "npg_ze3wKOsAar4u",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function importCSV() {
  try {
    await client.connect();
    console.log("✅ Conectado ao banco");

    await client.query('SET search_path TO cardapio_db');

    const filePath = "C:\\Users\\mathe\\Downloads\\Cópia de pedidos_cookie_company_expanded_-_Copia(1).csv";
    const pedidos = [];

    const stream = fs.createReadStream(filePath).pipe(csv({ separator: ";" }));

    stream.on("data", (row) => {
      pedidos.push({
        id: parseInt(row.id) || null,
        cliente_nome: row.cliente_nome || null,
        cliente_telefone: row.cliente_telefone || null,
        itens: row.itens || null,
        total: parseFloat((row.total || "0").replace(",", ".")) || 0,
        endereco: row.endereco || null,
        data_pedido: row.data_pedido || null
      });
    });

    stream.on("end", async () => {
      console.log(`📥 Lidos ${pedidos.length} registros do CSV`);

      for (const pedido of pedidos) {
        try {
          await client.query(
            `INSERT INTO pedido (id, cliente_nome, cliente_telefone, itens, total, endereco, data_pedido)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING`,
            [
              pedido.id,
              pedido.cliente_nome,
              pedido.cliente_telefone,
              pedido.itens,
              pedido.total,
              pedido.endereco,
              pedido.data_pedido
            ]
          );
        } catch (err) {
          console.error("⚠️ Erro ao inserir pedido ID:", pedido.id, err.message);
        }
      }

      console.log("✅ Importação concluída com sucesso!");
      await client.end();
    });

  } catch (err) {
    console.error("❌ Erro geral:", err);
    await client.end();
  }
}

importCSV();