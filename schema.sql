-- Card Studio D1 schema.
-- Run once in the Cloudflare Dashboard: Storage & Databases -> D1 -> (your database) -> Console tab.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,          -- Clerk user id, e.g. "user_2abc..."
  email         TEXT,                       -- convenience cache; Clerk remains the source of truth
  created_at    INTEGER NOT NULL,           -- epoch ms, first-seen
  last_seen_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT DEFAULT '',
  name          TEXT DEFAULT '',
  surname       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  phone2        TEXT DEFAULT '',
  email         TEXT DEFAULT '',
  company       TEXT DEFAULT '',
  website       TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  tagline       TEXT DEFAULT '',
  theme         INTEGER DEFAULT 0,          -- 0-2 = built-in presets, 3 = custom (see custom_* columns)
  custom_bg     TEXT,
  custom_text   TEXT,
  custom_accent TEXT,
  logo_src      TEXT,                       -- base64 dataURL, size-capped both client- and server-side
  offices       TEXT DEFAULT '[]',          -- JSON array of strings
  hubs          TEXT DEFAULT '[]',          -- JSON array of strings
  disclaimer    TEXT DEFAULT '',
  updated_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
