const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function createAdmin() {
  const password = await bcrypt.hash("admin123", 10);

  await pool.query(`
    INSERT INTO users (name, username, password_hash, role)
    VALUES (?, ?, ?, ?)
  `, [
    "Demo Admin",
    "admin@ngo.com",
    password,
    "ngo_super_admin"
  ]);

  console.log("Admin created");
  process.exit();
}

createAdmin();