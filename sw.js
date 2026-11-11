// Only named public application resources enter Cache Storage. Case records,
// credentials, GitHub/API calls, query payloads and external sources never do.
const CACHE='claritypath-public-v3.4.2';
const PUBLIC=['app/home-view.mjs','app/startup.mjs','first-aid.html','app/first-aid.mjs','app/support.mjs','app/public-text.mjs','app/navigation.mjs','setup.html','operating.html','build.html','app/build-page.mjs','AI-SETUP.txt','MANUAL-SETUP.txt','build-pack.txt','claritypath-public-build.txt','index.html','handoff.html','app/handoff-reader.mjs','app/protected-handoff.mjs','workspace.html','disclaimer.html','manifest.webmanifest','app/style.css','app/install.mjs','app/main.mjs','app/ai.mjs','app/core.mjs','app/crypto.mjs','app/github.mjs','app/output.mjs','app/catalogue.mjs','app/library.json','app/nsw-catalogue.json','assets/icon-192.png','assets/icon-512.png','assets/icon-180.png','assets/claritypath-logo.jpg'];
const base=new URL(self.registration.scope),urls=PUBLIC.map(p=>new URL(p,base).href),allowed=new Set(urls);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('claritypath-public-')&&name!==CACHE)await caches.delete(name);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(url.origin===base.origin&&/\/(?:mayhem-canonical-v3\.txt|mayhem-solicitors-advocate\.txt|claritypath-full-spec-v2\.(?:txt|html))$/.test(url.pathname)){event.respondWith(Promise.resolve(new Response('This private build document is not available for public distribution.',{status:410,headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}})));return}
 if(request.method!=='GET'||url.origin!==base.origin||request.headers.has('Authorization'))return;
 url.search='';url.hash='';if(url.href===base.href)url.pathname+='index.html';
 if(!allowed.has(url.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request,{cache:'no-cache'});if(response.ok&&response.type!=='opaque')await cache.put(url.href,response.clone());return response}catch(error){const saved=await cache.match(url.href);if(saved)return saved;throw error}})());
});
