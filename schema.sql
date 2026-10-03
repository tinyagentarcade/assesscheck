CREATE TABLE IF NOT EXISTS subs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  county TEXT NOT NULL,
  token TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  confirmed_at TEXT,
  unsub_at TEXT,
  last_sent_at TEXT
);
