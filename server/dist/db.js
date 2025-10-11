"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.MIGRATIONS_DIR = exports.DB_PATH = exports.DATA_DIR = void 0;
exports.initializeDatabase = initializeDatabase;
exports.getDb = getDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.DATA_DIR = path_1.default.join(__dirname, '..', 'data');
exports.DB_PATH = path_1.default.join(exports.DATA_DIR, 'nwu.db');
exports.MIGRATIONS_DIR = path_1.default.join(__dirname, '..', 'migrations');
function ensureDirectories() {
    if (!fs_1.default.existsSync(exports.DATA_DIR)) {
        fs_1.default.mkdirSync(exports.DATA_DIR, { recursive: true });
    }
}
function applyMigrations(database) {
    database.exec('PRAGMA foreign_keys = ON;');
    database.exec('CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL);');
    const migrationFiles = fs_1.default
        .readdirSync(exports.MIGRATIONS_DIR)
        .filter((fileName) => fileName.endsWith('.sql'))
        .sort();
    const appliedStmt = database.prepare('SELECT name FROM migrations WHERE name = ? LIMIT 1');
    const insertStmt = database.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, datetime("now"))');
    for (const fileName of migrationFiles) {
        const alreadyApplied = appliedStmt.get(fileName);
        if (alreadyApplied && alreadyApplied.name) {
            continue;
        }
        const absolutePath = path_1.default.join(exports.MIGRATIONS_DIR, fileName);
        const sql = fs_1.default.readFileSync(absolutePath, 'utf8');
        const run = database.transaction(() => {
            database.exec(sql);
            insertStmt.run(fileName);
        });
        run();
        // eslint-disable-next-line no-console
        console.log(`[db] Applied migration: ${fileName}`);
    }
}
function initializeDatabase() {
    ensureDirectories();
    exports.db = new better_sqlite3_1.default(exports.DB_PATH);
    applyMigrations(exports.db);
}
function getDb() {
    if (!exports.db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return exports.db;
}
