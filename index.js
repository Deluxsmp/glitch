import 'dotenv/config';
import { startBot } from './bot/bot.js';
import { createApp } from './api/app.js';
import { initDatabase } from './database/database.js';

initDatabase();
await startBot();
const app = createApp();
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`[API] Glitch listening on :${port}`));
