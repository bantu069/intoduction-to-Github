import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export const DATA_DIR = path.join(__dirname, '..', 'data');
export const DB_PATH = path.join(DATA_DIR, 'nwu.db');
export const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

export let db: Database.Database;

function ensureDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function applyMigrations(database: Database.Database): void {
  database.exec('PRAGMA foreign_keys = ON;');
  database.exec(
    'CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL);'
  );

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  const appliedStmt = database.prepare(
    'SELECT name FROM migrations WHERE name = ? LIMIT 1'
  );
  const insertStmt = database.prepare(
    'INSERT INTO migrations (name, applied_at) VALUES (?, datetime("now"))'
  );

  for (const fileName of migrationFiles) {
    const alreadyApplied = appliedStmt.get(fileName) as { name?: string } | undefined;
    if (alreadyApplied && alreadyApplied.name) {
      continue;
    }
    const absolutePath = path.join(MIGRATIONS_DIR, fileName);
    const sql = fs.readFileSync(absolutePath, 'utf8');

    const run = database.transaction(() => {
      database.exec(sql);
      insertStmt.run(fileName);
    });

    run();
    // eslint-disable-next-line no-console
    console.log(`[db] Applied migration: ${fileName}`);
  }
}

export function initializeDatabase(): void {
  ensureDirectories();
  db = new Database(DB_PATH);
  applyMigrations(db);
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}
