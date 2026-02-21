require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eventflow_db',
  });
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(
    "INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@omnibook.com', ?, 'admin') ON DUPLICATE KEY UPDATE password = ?",
    [hash, hash]
  );
  console.log('Admin user created: username=admin, password=admin123');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
