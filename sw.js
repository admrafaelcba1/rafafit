/* RafaFit 2.3.1: atualizações verificadas online; app e fotos continuam offline. */
const CACHE='rafafit-offline-v2.3.1';
const PHOTO='rafafit-photos-v2.1.0';
const V='2.3.1';
const ASSETS=[
 './','./index.html',
 './styles.css?v='+V,'./guides-pro.css?v='+V,'./workout-sets.css?v='+V,'./rest-timer.css?v='+V,
 './app.js?v='+V,'./guides.js?v='+V,'./guides-pro.js?v='+V,'./workout-sets.js?v='+V,'./rest-timer.js?v='+V,
 './manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-180.png'
];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('rafafit-')&&k!==CACHE&&k!==PHOTO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 const photos=url.hostname==='raw.githubusercontent.com'&&url.pathname.startsWith('/yuhonas/free-exercise-db/main/exercises/');
 if(photos){
  event.respondWith(caches.open(PHOTO).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok||res.type==='opaque')c.put(req,res.clone()).catch(()=>{});return res;}))));
  return;
 }
 if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/version.json')){
  event.respondWith(fetch(req,{cache:'no-store'}));
  return;
 }
 const isDoc=req.mode==='navigate';
 const isAppAsset=/\.(?:js|css|webmanifest|json)$/.test(url.pathname);
 if(isDoc||isAppAsset){
  event.respondWith(
   fetch(req,{cache:'no-store'}).then(res=>{
    if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});
    return res;
   }).catch(async()=>{
    const cached=await caches.match(req);
    if(cached)return cached;
    if(isDoc)return (await caches.match('./index.html')) || Response.error();
    return Response.error();
   })
  );
  return;
 }
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
  if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});
  return res;
 })));
});
