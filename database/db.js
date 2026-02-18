const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dbDir, 'anmeldungen.db'));

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS anmeldungen (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      vorname         TEXT NOT NULL,
      nachname        TEXT NOT NULL,
      uebernachtung   TEXT NOT NULL,
      essen_praeferenzen TEXT,
      buffet_beitrag  TEXT NOT NULL,
      erstellt_am     TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
  console.log('Datenbank initialisiert: database/anmeldungen.db');
}

module.exports = { db, initDB };
