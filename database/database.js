import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const filename = process.env.DATABASE_PATH || './data/glitch.sqlite';
fs.mkdirSync(path.dirname(path.resolve(filename)), {recursive:true});
export const db = new Database(filename);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY, settings TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT NOT NULL, user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings(guild_id,user_id);
  CREATE TABLE IF NOT EXISTS moderation_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT NOT NULL, user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL, action TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS dashboard_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT NOT NULL, actor_id TEXT NOT NULL,
    action TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', claimed_by TEXT, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS giveaways (
    message_id TEXT PRIMARY KEY, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL,
    ends_at INTEGER NOT NULL, prize TEXT NOT NULL, winners INTEGER NOT NULL, ended INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS levels (
    guild_id TEXT NOT NULL, user_id TEXT NOT NULL, xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0, last_xp_at INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(guild_id,user_id)
  );
  CREATE TABLE IF NOT EXISTS automod_rules (
    guild_id TEXT PRIMARY KEY, config TEXT NOT NULL DEFAULT '{}'
  );
  `);
}
export function getSettings(guildId) {
  const row=db.prepare('SELECT settings FROM guild_settings WHERE guild_id=?').get(guildId);
  return row ? JSON.parse(row.settings) : {};
}
export function setSettings(guildId, settings) {
  db.prepare(`INSERT INTO guild_settings(guild_id,settings,updated_at) VALUES(?,?,?)
    ON CONFLICT(guild_id) DO UPDATE SET settings=excluded.settings,updated_at=excluded.updated_at`)
    .run(guildId,JSON.stringify(settings),Date.now());
}
