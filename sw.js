// Sube el número cuando cambies index.html para forzar la actualización en los móviles
const V='zmb-v17',FILES=['./','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png'];
// Safari/Chrome rechazan servir desde un service worker una respuesta que venga de una redirección
// (p. ej. Cloudflare redirige /index.html -> /). Se devuelve siempre una copia "limpia".
const clean=async r=>{
  if(!r.redirected)return r;
  const b=await r.blob();
  return new Response(b,{status:200,statusText:'OK',headers:{'Content-Type':r.headers.get('Content-Type')||'text/html'}});
};
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    for(const f of FILES){try{const r=await fetch(f,{cache:'reload'});if(r.ok)await c.put(f,await clean(r))}catch{}}
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin!==location.origin||u.pathname.startsWith('/admin')||u.pathname.startsWith('/api')||u.pathname.startsWith('/ws'))return; // API de Supabase y panel admin: siempre red, sin caché
  const key=req.mode==='navigate'?'./':req; // cualquier navegación sirve la app (index) sin redirecciones
  e.respondWith((async()=>{
    try{
      const r=await fetch(key);const c=await clean(r);
      if(r.ok)(await caches.open(V)).put(key,c.clone());
      return c;
    }catch{
      return (await caches.match(key,{ignoreSearch:true}))||Response.error();
    }
  })());
});
