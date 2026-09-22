import { Events, PermissionsBitField } from 'discord.js';
import { db, getSettings } from '../../database/database.js';

export function registerEvents(client) {
  client.once(Events.ClientReady, c => console.log(`[BOT] Logged in as ${c.user.tag}`));
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command=client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction,client); }
    catch(err) {
      console.error(err);
      const msg='Command failed. Check bot permissions and try again.';
      if (interaction.deferred || interaction.replied) await interaction.followUp({content:msg,ephemeral:true}).catch(()=>{});
      else await interaction.reply({content:msg,ephemeral:true}).catch(()=>{});
    }
  });
  client.on(Events.MessageCreate, async message => {
    if (!message.guild || message.author.bot || !message.member) return;
    const cfg=getSettings(message.guild.id).automod || {};
    const ignored=(cfg.ignoredChannels||[]).includes(message.channel.id);
    if (ignored || message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
    const bad=(cfg.badWords||[]).map(x=>String(x).toLowerCase()).filter(Boolean);
    if (bad.some(word=>message.content.toLowerCase().includes(word))) {
      await message.delete().catch(()=>{});
      await message.channel.send(`${message.author}, your message was removed by AutoMod.`).catch(()=>{});
    }
  });
}
