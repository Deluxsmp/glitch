import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../database/database.js';
export const data=new SlashCommandBuilder().setName('warnings').setDescription('View a member’s warnings')
 .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
 .addUserOption(o=>o.setName('user').setDescription('Member').setRequired(true));
export async function execute(i) {
 const u=i.options.getUser('user');
 const rows=db.prepare('SELECT reason,moderator_id,created_at FROM warnings WHERE guild_id=? AND user_id=? ORDER BY id DESC LIMIT 10').all(i.guildId,u.id);
 await i.reply({content:rows.length?rows.map((r,n)=>`${n+1}. ${r.reason} — <@${r.moderator_id}> (<t:${Math.floor(r.created_at/1000)}:R>)`).join('\n'):'No warnings found.',ephemeral:true});
}
