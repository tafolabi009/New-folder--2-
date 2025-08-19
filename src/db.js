/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_DB_PATH = path.join(DATA_DIR, 'results.json');

let pool = null;
let isFileFallback = false;

function createPoolFromEnv() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  const sslEnabled = process.env.PGSSLMODE === 'require' || process.env.RENDER === 'true' || process.env.HEROKU === 'true';

  return new Pool({
    connectionString: databaseUrl,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false
  });
}

async function ensureTable() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload JSONB NOT NULL
    );
  `);
}

function ensureFileDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_DB_PATH)) {
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify([]), 'utf8');
  }
}

async function initDbIfNeeded() {
  pool = createPoolFromEnv();
  if (pool) {
    try {
      await pool.query('SELECT 1');
      await ensureTable();
      isFileFallback = false;
      console.log('Connected to PostgreSQL');
      return;
    } catch (err) {
      console.warn('PostgreSQL connection failed, falling back to file DB:', err.message);
    }
  }
  ensureFileDb();
  isFileFallback = true;
  console.log('Using file-based DB at', FILE_DB_PATH);
}

function getDb() {
  return { pool, isFileFallback, FILE_DB_PATH };
}

async function insertResult(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('payload must be an object');
  }
  if (isFileFallback || !pool) {
    ensureFileDb();
    const now = new Date().toISOString();
    const existing = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
    existing.push({ id: existing.length + 1, created_at: now, payload });
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(existing, null, 2));
    return { id: existing.length, created_at: now, payload };
  }
  try {
    const result = await pool.query(
      'INSERT INTO results (payload) VALUES ($1) RETURNING id, created_at, payload',
      [payload]
    );
    return result.rows[0];
  } catch (err) {
    console.warn('PostgreSQL insert failed, falling back to file DB:', err.message);
    ensureFileDb();
    isFileFallback = true;
    const now = new Date().toISOString();
    const existing = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
    existing.push({ id: existing.length + 1, created_at: now, payload });
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(existing, null, 2));
    return { id: existing.length, created_at: now, payload };
  }
}

async function listResults(limit = 50, offset = 0) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);
  if (isFileFallback || !pool) {
    ensureFileDb();
    const all = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
    return all.slice().reverse().slice(safeOffset, safeOffset + safeLimit);
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, created_at, payload FROM results ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [safeLimit, safeOffset]
    );
    return rows;
  } catch (err) {
    console.warn('PostgreSQL select failed, falling back to file DB:', err.message);
    ensureFileDb();
    isFileFallback = true;
    const all = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
    return all.slice().reverse().slice(safeOffset, safeOffset + safeLimit);
  }
}

module.exports = {
  initDbIfNeeded,
  getDb,
  insertResult,
  listResults
};


