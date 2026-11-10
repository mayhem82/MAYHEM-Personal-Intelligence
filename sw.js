// Only named public application resources enter Cache Storage. Case records,
// credentials, GitHub/API calls, query payloads and external sources never do.
const CACHE='claritypath-public-v3.2.1';
const PUBLIC=['index.html','workspace.html','disclaimer.html','manifest.webmanifest','app/style.css','app/install.mjs','app/main.mjs','app/core.mjs','app/crypto.mjs','app/github.mjs','app/output.mjs','app/catalogue.mjs','app/library.json','app/nsw-catalogue.json','assets/icon-192.png','assets/icon-512.png','assets/icon-180.png','assets/claritypath-logo.jpg'];
const base=new URL(self.registration.scope),urls=PUBLIC.map(p=>new URL(p,base).href),allowed=new Set(urls);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('claritypath-public-')&&name!==CACHE)await caches.delete(name);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==base.origin||request.headers.has('Authorization'))return;
 url.search='';url.hash='';if(url.href===base.href)url.pathname+='index.html';
 if(!allowed.has(url.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok&&response.type!=='opaque')await cache.put(url.href,response.clone());return response}catch(error){const saved=await cache.match(url.href);if(saved)return saved;throw error}})());
});
