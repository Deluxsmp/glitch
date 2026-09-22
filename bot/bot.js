import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { registerEvents } from './handlers/events.js';
import { loadCommands } from './handlers/commands.js';

export const client = new Client({
  intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,GatewayIntentBits.GuildModeration],
  partials:[Partials.Message,Partials.Channel,Partials.GuildMember]
});
client.commands = new Collection();

export async function startBot() {
  if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is missing from .env');
  await loadCommands(client);
  registerEvents(client);
  await client.login(process.env.DISCORD_TOKEN);
}
