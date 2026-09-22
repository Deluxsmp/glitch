import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs/promises';
const commands=[];
for(const f of await fs.readdir('./bot/commands')) if(f.endsWith('.js')) {
 const m=await import(new URL(`./commands/${f}`,import.meta.url)); if(m.data) commands.push(m.data.toJSON());
}
if(!process.env.DISCORD_TOKEN||!process.env.DISCORD_CLIENT_ID) throw new Error('Set DISCORD_TOKEN and DISCORD_CLIENT_ID');
const rest=new REST({version:'10'}).setToken(process.env.DISCORD_TOKEN);
await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),{body:commands});
console.log(`Registered ${commands.length} slash commands.`);
