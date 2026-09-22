import { SlashCommandBuilder } from 'discord.js';
export const data=new SlashCommandBuilder().setName('ping').setDescription('Check Glitch latency');
export async function execute(i,client){ await i.reply({content:`Pong! ${client.ws.ping}ms`,ephemeral:true}); }
