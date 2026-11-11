#!/usr/bin/env node
/* Descarga la carta, el objetivo y el código del evento desde la nube (hace falta internet y la cuenta admin).
   Uso:  node pull.js admin@voldenstudio.com CONTRASEÑA
   Después arranca el servidor: node hub.js                                                           */
'use strict';
const fs=require('fs'),path=require('path');
const URL_=process.env.SUPABASE_URL||'https://trvpotojljatuoyegbbu.supabase.co',KEY='sb_publishable_fQ20fycMsWe3PHCXSNV1kQ_BCdh9P9W';
const [email,password]=process.argv.slice(2);
if(!email||!password){console.log('Uso: node pull.js correo contraseña');process.exit(1)}
const H=t=>({apikey:KEY,'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})});
(async()=>{
  const r=await fetch(URL_+'/auth/v1/token?grant_type=password',{method:'POST',headers:H(),body:JSON.stringify({email,password})});
  const j=await r.json();if(!r.ok){console.log('No se pudo entrar:',j.error_description||j.msg||r.status);process.exit(1)}
  const get=async p=>{const x=await fetch(URL_+p,{headers:H(j.access_token)});if(!x.ok)throw new Error(p+' '+x.status);return x.json()};
  const rows=await get('/rest/v1/menu_items?select=category,name,price,sort,station&active=eq.true&order=sort.asc');
  const st=await get('/rest/v1/settings?select=key,value');const S=Object.fromEntries(st.map(x=>[x.key,x.value]));
  const menu=[],idx=new Map();
  rows.forEach(x=>{let c=idx.get(x.category);if(!c){c={name:x.category,items:[]};idx.set(x.category,c);menu.push(c)}c.items.push({n:x.name,p:Number(x.price),k:x.station==='barra'?'b':'c'})});
  fs.mkdirSync(path.join(__dirname,'data'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,'data','config.json'),JSON.stringify({menu,goal:Number(S.goal)||0,event:S.event_name||'',code:S.access_code||''},null,2));
  console.log(`✔ Guardado: ${rows.length} productos · objetivo ${S.goal||0} € · código ${S.access_code||'(sin código)'}`);
})().catch(e=>{console.log('Error:',e.message);process.exit(1)});
