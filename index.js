require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

async function testDBConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST_NAME,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE_NAME,
      port: process.env.MYSQL_PORT,
    });

    console.log('Connected to InfinityFree MySQL database!');
    await connection.end();
  } catch (error) {
    console.error('Unable to connect to database:', error.message);
  }
}

app.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST_NAME,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE_NAME,
      port: process.env.MYSQL_PORT,
    });

    const [rows] = await connection.query('SHOW TABLES');
    await connection.end();
    res.send({ message: 'DB Connected!', tables: rows });
  } catch (error) {
    res.status(500).send({ message: 'DB connection failed', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  testDBConnection();
});
