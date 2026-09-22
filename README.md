# GLITCH — Discord Bot + Dashboard

A modular Discord.js v14 / Express / React starter with persistent SQLite storage, OAuth entry point, slash-command deployment, warning records, basic AutoMod, and a responsive dashboard shell.

## Requirements
- Node.js 20 LTS or newer
- A Discord application and bot
- Hosting with persistent disk for `DATABASE_PATH`

## Setup
1. Install Node.js from the official Node.js website.
2. In the Discord Developer Portal, create an application, add a bot, and copy its token.
3. Enable **Server Members Intent** and **Message Content Intent** when needed. Keep the bot token private.
4. Under OAuth2, add redirect URL exactly matching `DISCORD_REDIRECT_URI`, e.g. `http://localhost:3000/auth/callback`.
5. Copy `.env.example` to `.env`; fill token, client ID, client secret, redirect URI, and a long random session secret.
6. Install root dependencies: `npm install`.
7. Install dashboard dependencies: `cd dashboard && npm install && cd ..`.
8. Register slash commands: `npm run commands`.
9. Start bot + API: `npm start`.
10. In another terminal, run dashboard: `npm run dashboard:dev`; open `http://localhost:5173`.

## Production
Set `NODE_ENV=production`, use HTTPS, set a strong `SESSION_SECRET`, configure the public dashboard URL and OAuth redirect URI, and mount persistent storage for the SQLite file. Use a persistent session store in production; the default Express MemoryStore is development-only. Keep `.env` out of version control.

## Important implementation status
This delivery is a **working foundation, not the entire requested production specification**. Implemented: bot startup, command loader, `/ping`, `/serverinfo`, persistent `/warn` and `/warnings`, basic bad-word AutoMod hook, SQLite schema initialization, health endpoint, OAuth login/callback skeleton, and dashboard shell.

Not yet implemented/verified: complete OAuth token/session persistence and guild authorization flow, all moderation commands, full anti-nuke, complete ticket workflows/transcripts, welcome/leveling/giveaways/role panels, backup/restore, all dashboard pages, WebSocket updates, production session store, and comprehensive automated tests. Do not expose this deployment publicly until OAuth guild authorization and production session storage are completed. Discord API cannot restore deleted messages or inaccessible files. Backup restore must be tested and explicitly confirmed.

## Troubleshooting
- `DISCORD_TOKEN missing`: ensure `.env` exists in project root.
- Slash commands missing: run `npm run commands` and verify client ID/token.
- Bot cannot moderate: check its role position and required permissions.
- SQLite native install issue: use a compatible Node LTS release and hosting environment; `better-sqlite3` may require a prebuilt binary/toolchain.
