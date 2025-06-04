const bcrypt = require('bcrypt');
const { Client } = require('pg');

const client = new Client({
  user: "neondb_owner",
  host: "ep-nameless-bread-acptp2tf-pooler.sa-east-1.aws.neon.tech",
  database: "neondb",
  password: "npg_ze3wKOsAar4u",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();
  await client.query('SET search_path TO cardapio_db');

  const senhaCriptografada = await bcrypt.hash('123', 10);

  const result = await client.query('SELECT username FROM usuario');
  for (const row of result.rows) {
    await client.query(
      'UPDATE usuario SET senha = $1 WHERE username = $2',
      [senhaCriptografada, row.username]
    );
    console.log(`✅ Senha atualizada para: ${row.username}`);
  }

  await client.end();
})();
