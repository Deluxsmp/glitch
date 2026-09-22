import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { db, getSettings, setSettings } from '../database/database.js';
import { client } from '../bot/bot.js';

export function createApp(){
 const app=express();
 app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
 app.use(express.json({limit:'100kb'}));
 app.use(rateLimit({windowMs:60_000,max:120,standardHeaders:true,legacyHeaders:false}));
 app.use(session({name:'glitch.sid',secret:process.env.SESSION_SECRET||'development-only-change-me',
  resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:86400000}}));
 app.get('/api/health',(_,res)=>res.json({ok:true,bot:client.isReady(),uptime:process.uptime()}));
 const auth=(req,res,next)=>req.session.user?next():res.status(401).json({error:'Login required'});
 app.get('/auth/login',(req,res)=>{
  const p=new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID,redirect_uri:process.env.DISCORD_REDIRECT_URI,
   response_type:'code',scope:'identify guilds'});
  res.redirect('https://discord.com/oauth2/authorize?'+p);
 });
 app.get('/auth/callback',async(req,res)=>{
  try{
   const tokenRes=await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID,client_secret:process.env.DISCORD_CLIENT_SECRET,
     grant_type:'authorization_code',code:req.query.code,redirect_uri:process.env.DISCORD_REDIRECT_URI})});
   const token=await tokenRes.json(); if(!token.access_token) return res.status(401).send('OAuth failed');
   const u=await fetch('https://discord.com/api/users/@me',{headers:{Authorization:`Bearer ${token.access_token}`}});
   req.session.user=await u.json(); res.redirect(process.env.DASHBOARD_URL||'/');
  }catch(e){console.error(e);res.status(500).send('Authentication failed');}
 });
 app.get('/api/me',auth,(req,res)=>res.json(req.session.user));
 app.post('/auth/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
 app.get('/api/guilds',auth,async(req,res)=>{
  try{
   const r=await fetch('https://discord.com/api/users/@me/guilds',{headers:{Authorization:`Bearer ${req.session.oauthToken}`}});
   const guilds=await r.json();
   res.json(Array.isArray(guilds)?guilds.filter(g=>(Number(g.permissions)&0x20)===0x20 && client.guilds.cache.has(g.id)):[]);
  }catch{res.status(502).json({error:'Could not load servers'});}
 });
 app.get('/api/guilds/:id/settings',auth,(req,res)=>{
  if(!canManage(req,req.params.id)) return res.status(403).json({error:'Manage Server permission required'});
  res.json(getSettings(req.params.id));
 });
 app.put('/api/guilds/:id/settings',auth,(req,res)=>{
  if(!canManage(req,req.params.id)) return res.status(403).json({error:'Manage Server permission required'});
  if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||JSON.stringify(req.body).length>50000) return res.status(400).json({error:'Invalid settings'});
  setSettings(req.params.id,req.body);
  db.prepare('INSERT INTO dashboard_audit(guild_id,actor_id,action,created_at) VALUES(?,?,?,?)')
   .run(req.params.id,req.session.user.id,'settings_updated',Date.now());
  res.json({ok:true});
 });
 function canManage(req,guildId){
  // OAuth guild list is fetched per request; do not trust client-supplied permissions.
  return Boolean(req.session.managedGuilds?.includes(guildId));
 }
 return app;
}
