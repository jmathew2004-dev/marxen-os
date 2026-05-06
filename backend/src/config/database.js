const { Pool } = require('pg');
const config = require('./env');
const fs = require('fs');
const path = require('path');

const connectionString = config.database.url ||
  `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`;

const pool = new Pool({
  connectionString
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const query = (text, params) => {
  const start = Date.now();
  return pool.query(text, params).then(res => {
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  });
};

const migrate = async () => {
  const client = await pool.connect();
  try {
    const migrationFile = path.join(__dirname, '../migrations/001_init_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    await client.query(sql);
    console.log('Database migration completed');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    client.release();
  }
};

const getClient = () => pool.connect();

const disconnect = () => pool.end();

module.exports = {
  query,
  pool,
  getClient,
  disconnect,
  migrate
};
