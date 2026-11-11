#!/usr/bin/env node
/* Solera TPV · servidor local (hub)
   Se ejecuta en la tablet de cocina (Termux) o en cualquier ordenador de la red Wi-Fi local.
   - Sirve la app a los móviles: http://IP:8787
   - Reenvía los mensajes barra <-> cocina por WebSocket (sin internet, sin dependencias).
   Uso:  node hub.js [--port 8787] [--code solera-1670]        */
'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0&&process.argv[i+1]?process.argv[i+1]:d};
const ROOT=path.resolve(__dirname,'..'),DATA=path.join(__dirname,'data'),CFG=path.join(DATA,'config.json');
const PORT=+(arg('--port',process.env.PORT||8787));
const cfg=()=>{try{return JSON.parse(fs.readFileSync(CFG,'utf8'))}catch{return{}}};
const CODE=()=>String(arg('--code',process.env.HUB_CODE||cfg().code||'solera'));
const same=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const MIME={'.html':'text/html; charset=utf-8','.json':'application/json','.js':'text/javascript','.png':'image/png'};
const ips=()=>Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address);
const log=(...a)=>console.log(new Date().toLocaleTimeString('es-ES'),...a);

const send=(res,code,body,type='application/json')=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(body)};
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x'),p=u.pathname;
  if(p==='/api/join'){return same(u.searchParams.get('code')||'',CODE())?send(res,200,JSON.stringify({ok:true,event:cfg().event||''})):send(res,401,'{"error":"código incorrecto"}')}
  if(p==='/api/config'){const c=cfg();return send(res,200,JSON.stringify({menu:c.menu||null,goal:c.goal||0,event:c.event||''}))}
  if(p==='/api/info')return send(res,200,JSON.stringify({ips:ips(),port:PORT,clients:[...clients].map(c=>({role:c.role,dev:c.dev}))}));
  if(p==='/api/ping')return send(res,200,'{"ok":true}');
  const m=p.match(/^\/(index\.html|manifest\.json|sw\.js|[\w-]+\.png)?$/);
  if(!m)return send(res,404,'no');
  const f=m[1]||'index.html',file=path.join(ROOT,f);
  fs.readFile(file,(e,buf)=>{
    if(e)return send(res,404,'no');
    if(f==='index.html')buf=Buffer.from(buf.toString().replace('<head>','<head><script>window.HUB=1</script>'));
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(buf);
  });
});

/* ---- WebSocket mínimo (RFC 6455), sin dependencias ---- */
const clients=new Set();let recent=[];            // recent: avisos de cocina para quien se reconecte
const frame=(op,payload)=>{
  const b=Buffer.isBuffer(payload)?payload:Buffer.from(payload),n=b.length;let h;
  if(n<126)h=Buffer.from([0x80|op,n]);else if(n<65536){h=Buffer.alloc(4);h[0]=0x80|op;h[1]=126;h.writeUInt16BE(n,2)}else{h=Buffer.alloc(10);h[0]=0x80|op;h[1]=127;h.writeBigUInt64BE(BigInt(n),2)}
  return Buffer.concat([h,b]);
};
const wsSend=(c,s)=>{try{c.socket.write(frame(1,s))}catch{}};
server.on('upgrade',(req,socket)=>{
  const u=new URL(req.url,'http://x');
  const key=req.headers['sec-websocket-key'];
  if(u.pathname!=='/ws'||!key){socket.destroy();return}
  if(!same(u.searchParams.get('code')||'',CODE())){socket.end('HTTP/1.1 401 Unauthorized\r\n\r\n');return}
  const role=u.searchParams.get('role')==='cocina'?'cocina':'barra',dev=(u.searchParams.get('dev')||'?').slice(0,12);
  const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  socket.setNoDelay(true);socket.setKeepAlive(true,15000);
  const c={socket,role,dev,buf:Buffer.alloc(0),frag:[],alive:Date.now()};
  clients.add(c);log('＋',role,dev,'· conectados:',clients.size);
  if(role==='barra'){const now=Date.now();recent=recent.filter(x=>now-x.t<120000);recent.forEach(x=>wsSend(c,x.raw))}
  const relay=raw=>{
    if(role==='cocina'){try{const m=JSON.parse(raw);if(m.t==='msg'){recent.push({t:Date.now(),raw});recent=recent.slice(-20)}}catch{}}
    clients.forEach(o=>{if(o!==c&&o.role!==role)wsSend(o,raw)});
  };
  const onData=d=>{
    c.buf=Buffer.concat([c.buf,d]);
    for(;;){
      const b=c.buf;if(b.length<2)return;
      const fin=!!(b[0]&0x80),op=b[0]&15,masked=!!(b[1]&0x80);let len=b[1]&0x7f,o=2;
      if(len===126){if(b.length<4)return;len=b.readUInt16BE(2);o=4}else if(len===127){if(b.length<10)return;len=Number(b.readBigUInt64BE(2));o=10}
      if(len>1<<20){socket.destroy();return}
      const mk=masked?4:0;if(b.length<o+mk+len)return;
      let pl=Buffer.from(b.subarray(o+mk,o+mk+len));
      if(masked){const m=b.subarray(o,o+4);for(let i=0;i<pl.length;i++)pl[i]^=m[i&3]}
      c.buf=b.subarray(o+mk+len);c.alive=Date.now();
      if(op===8){try{socket.end(frame(8,Buffer.alloc(0)))}catch{}return}
      if(op===9){try{socket.write(frame(10,pl))}catch{}continue}
      if(op===10)continue;
      if(op===1||op===2||op===0){
        if(op!==0)c.frag=[];c.frag.push(pl);
        if(fin){const raw=Buffer.concat(c.frag).toString();c.frag=[];if(raw)relay(raw)}
      }
    }
  };
  const bye=()=>{if(clients.delete(c))log('－',role,dev,'· conectados:',clients.size)};
  socket.on('data',onData);socket.on('close',bye);socket.on('error',()=>{bye();socket.destroy()});
});
setInterval(()=>{const now=Date.now();clients.forEach(c=>{if(now-c.alive>60000){c.socket.destroy();return}try{c.socket.write(frame(9,'k'))}catch{}})},20000);

server.listen(PORT,'0.0.0.0',()=>{
  console.log('\n  SOLERA TPV · servidor local\n');
  console.log('  Código del evento:',CODE());
  console.log('  Móviles (camareros) →',ips().map(i=>`http://${i}:${PORT}`).join('   ')||'(sin red Wi-Fi todavía)');
  console.log('  Esta tablet (cocina) → http://localhost:'+PORT+'\n');
});
