const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'wellness.db');

let db;

async function getDb() {
    if (db) return db;

    const SQL = await initSqlJs();

    try {
        if (fs.existsSync(DB_PATH)) {
            const buffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(buffer);
        } else {
            db = new SQL.Database();
        }
    } catch (err) {
        console.log('Creating new database...');
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'parent')),
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood TEXT NOT NULL,
      stress INTEGER NOT NULL CHECK(stress BETWEEN 1 AND 5),
      energy INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 5),
      journal TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS linked_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(parent_id, student_id)
    )
  `);

    // Create indexes (ignore if already exist)
    try { db.run('CREATE INDEX idx_mood_user_date ON mood_entries(user_id, date)'); } catch (e) { }
    try { db.run('CREATE INDEX idx_linked_parent ON linked_accounts(parent_id)'); } catch (e) { }

    saveDb();
    return db;
}

function saveDb() {
    if (db) {
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
}

// Auto-save every 30 seconds
setInterval(saveDb, 30000);

// Helper to run a query and return results as array of objects
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

function queryOne(sql, params = []) {
    const results = queryAll(sql, params);
    return results.length > 0 ? results[0] : null;
}

function runSql(sql, params = []) {
    if (params.length) {
        db.run(sql, params);
    } else {
        db.run(sql);
    }
    const changes = db.getRowsModified();
    const result = db.exec('SELECT last_insert_rowid()');
    const lastId = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : 0;
    saveDb();
    return { lastInsertRowid: lastId, changes };
}

module.exports = { getDb, queryAll, queryOne, runSql, saveDb };
