/* RafaFit 2.1 — atualiza o app sem apagar os registros locais; fotos cacheadas sob demanda. */
const CACHE='rafafit-offline-v2.3.0';
const PHOTO='rafafit-photos-v2.1.0';
const ASSETS=['./','./index.html','./styles.css','./guides-pro.css','./workout-sets.css','./rest-timer.css','./app.js','./guides.js','./guides-pro.js','./workout-sets.js','./rest-timer.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('rafafit-')&&k!==CACHE&&k!==PHOTO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);
 const fromPhotos=url.hostname==='raw.githubusercontent.com'&&url.pathname.startsWith('/yuhonas/free-exercise-db/main/exercises/');
 if(fromPhotos){
  event.respondWith(caches.open(PHOTO).then(c=>c.match(req).then(old=>old||fetch(req).then(res=>{if(res.ok||res.type==='opaque')c.put(req,res.clone()).catch(()=>{});return res;}))));
  return;
 }
 if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});return res;}).catch(()=>caches.match(req)));
  return;
 }
 event.respondWith(caches.match(req).then(old=>old||fetch(req).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});return res;})));
});