/* ═══════════════════════════════════════════════════════════════
   KEV FUSION 2026 — SW v25 (latence minimale)
   · navigation : cache-first avec revalidation arrière-plan
   · assets same-origin : stale-while-revalidate
   · SDK gstatic : cache-first longue durée
   · images : cache-first
   · API Firebase : network uniquement
   ═══════════════════════════════════════════════════════════════ */
const CACHE="kev-fusion-v25";
const IMG_CACHE="kev-fusion-img-v25";
const SDK_CACHE="kev-fusion-sdk-v25";

const CORE=[
  "./","./index.html","./manifest.json","./styles.css",
  "./data.js","./enrich.js","./maintenance.js","./app.js","./perf.js",
  "./firebase-config.js","./icon-192.png","./icon-512.png"
];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE&&k!==IMG_CACHE&&k!==SDK_CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

function put(cacheName,req,res){
  if(!res||(res.status!==200&&res.type!=="opaque"))return;
  caches.open(cacheName).then(c=>c.put(req,res.clone())).catch(()=>{});
}

/* navigation : cache-first ultra-rapide + revalidation silencieuse */
function navigation(e){
  return caches.match(e.request).then(c=>{
    const f=fetch(e.request).then(r=>{put(CACHE,e.request,r);return r;}).catch(()=>c);
    return c||f;
  });
}
/* same-origin statique : stale-while-revalidate */
function swr(e){
  return caches.match(e.request).then(c=>{
    const f=fetch(e.request).then(r=>{put(CACHE,e.request,r);return r;}).catch(()=>c);
    return c||f;
  });
}
/* SDK Firebase : cache-first longue durée */
function sdkFirst(e){
  return caches.match(e.request).then(c=>{
    if(c){fetch(e.request).then(r=>put(SDK_CACHE,e.request,r)).catch(()=>{});return c;}
    return fetch(e.request).then(r=>{put(SDK_CACHE,e.request,r);return r;});
  });
}
/* images : cache-first */
function imgFirst(e){
  return caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{put(IMG_CACHE,e.request,r);return r;}));
}

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  const host=url.hostname;

  /* base de données temps réel : jamais de cache */
  if(host.includes("firebasedatabase")||host.includes("firebaseio")||host.includes("googleapis.com/")){
    e.respondWith(fetch(e.request));return;
  }
  if(e.request.mode==="navigate"){e.respondWith(navigation(e));return;}
  if(host==="www.gstatic.com"||host==="fonts.gstatic.com"){e.respondWith(sdkFirst(e));return;}
  if(host.includes("unsplash")||host.includes("images.")){e.respondWith(imgFirst(e));return;}
  if(url.origin===self.location.origin){e.respondWith(swr(e));return;}
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});

self.addEventListener("message",e=>{
  if(e.data==="SKIP_WAITING")self.skipWaiting();
});
