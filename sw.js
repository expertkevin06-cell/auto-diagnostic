const CACHE_NAME="kev-fusion-v22";
const CORE=["./","./index.html","./manifest.json","./styles.css","./data.js","./enrich.js","./maintenance.js","./app.js","./firebase-config.js","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.hostname.includes("firebase")||u.hostname.includes("googleapis")){e.respondWith(fetch(e.request));return;}
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200){const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(e.request,c));}return r;})
    .catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==="navigate"?caches.match("./index.html"):Response.error()))));
});
self.addEventListener("message",e=>{if(e.data==="SKIP_WAITING")self.skipWaiting();});
