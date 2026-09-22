import { SlashCommandBuilder } from 'discord.js';
export const data=new SlashCommandBuilder().setName('serverinfo').setDescription('Show server information');
export async function execute(i){const g=i.guild; await i.reply({embeds:[{title:g.name,thumbnail:{url:g.iconURL()||''},fields:[{name:'Members',value:String(g.memberCount),inline:true},{name:'Created',value:`<t:${Math.floor(g.createdTimestamp/1000)}:D>`,inline:true}],color:0x5865f2}]});}
