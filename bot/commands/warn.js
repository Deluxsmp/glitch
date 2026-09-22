import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../database/database.js';
export const data=new SlashCommandBuilder().setName('warn').setDescription('Warn a member')
 .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
 .addUserOption(o=>o.setName('user').setDescription('Member to warn').setRequired(true))
 .addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(true).setMaxLength(500));
export async function execute(i) {
 const user=i.options.getUser('user'), reason=i.options.getString('reason');
 if(user.id===i.user.id || user.bot) return i.reply({content:'Choose a valid non-bot member.',ephemeral:true});
 db.prepare('INSERT INTO warnings(guild_id,user_id,moderator_id,reason,created_at) VALUES(?,?,?,?,?)')
  .run(i.guildId,user.id,i.user.id,reason,Date.now());
 db.prepare('INSERT INTO moderation_records(guild_id,user_id,moderator_id,action,reason,created_at) VALUES(?,?,?,?,?,?)')
  .run(i.guildId,user.id,i.user.id,'warn',reason,Date.now());
 await i.reply({content:`Warned ${user.tag}. Reason: ${reason}`,ephemeral:true});
}
