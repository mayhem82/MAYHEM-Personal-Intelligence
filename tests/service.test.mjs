import test from'node:test';
import assert from'node:assert/strict';
import{createService}from'../service/server.mjs';
import{connectAI}from'../app/ai.mjs';

test('AI readiness distinguishes missing host configuration and verifies only capabilities',async()=>{
 const secret='synthetic-service-access-key-123456789';
 for(const configured of [false,true]){
  let providerCalls=0;
  const server=createService({secret,providerKey:'synthetic-key',model:configured?'synthetic-model':' ',origins:['https://example.invalid'],fetch:async()=>{providerCalls++;throw Error('Provider must not be contacted by readiness checks')}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  try{
   const health=await fetch(url+'/healthz');
   assert.equal(health.status,configured?200:503);
   const healthText=await health.text();assert(!healthText.includes(secret));assert(!healthText.includes('synthetic-key'));
   if(configured){const connection=await connectAI(url+'/',secret);assert.equal(connection.url,url);assert.equal(connection.capabilities.configured,true)}
   else await assert.rejects(connectAI(url,secret),/not configured/);
   // Equal JavaScript string length can have a different UTF-8 byte length.
   assert.equal((await fetch(url+'/capabilities',{headers:{Authorization:'Bearer '+'é'.repeat(secret.length)}})).status,401);
   assert.equal((await fetch(url+'/healthz')).status,configured?200:503);
   assert.equal(providerCalls,0);
  }finally{await new Promise(resolve=>server.close(resolve))}
 }
});

test('AI connection rejects unsupported endpoints and redirects before any case transmission',async()=>{
 const secret='synthetic-service-access-key-123456789';let calls=0;
 const request=async(url,options)=>{calls++;assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');assert.equal(options.body,undefined);return new Response(JSON.stringify({version:1,provider:'OpenAI',model:'synthetic-model',configured:false}))};
 await assert.rejects(connectAI('http://example.invalid',secret,request),/HTTPS/);
 await assert.rejects(connectAI('ftp://localhost',secret,request),/HTTPS/);
 await assert.rejects(connectAI('https://example.invalid/?key=secret',secret,request),/query/);
 await assert.rejects(connectAI('https://user:password@example.invalid',secret,request),/credentials/);
 assert.equal(calls,0);
 await assert.rejects(connectAI('https://example.invalid',secret,request),/not configured/);
 await assert.rejects(connectAI('https://example.invalid',secret,async()=>new Response('{}')),/supported ClarityPath/);
 assert.throws(()=>createService({maxRequests:NaN}),/positive safe integer/);
 assert.throws(()=>createService({maxRequests:0}),/positive safe integer/);
});
test('service auth, origin, approval, provider payload, source citation and idempotency',async()=>{let calls=0;const server=createService({secret:'test-service-access-key-123456789',providerKey:'test-not-a-real-key',model:'test-model',origins:['http://localhost:8775'],maxRequests:2,fetch:async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.model,'test-model');assert(body.instructions.includes('Private project specifications are excluded.'));return new Response(JSON.stringify({output:[{type:'message',content:[{type:'output_text',text:'Sourced synthetic draft.',annotations:[]}]}],usage:{input_tokens:1}}),{status:200})}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;const headers={Authorization:'Bearer test-service-access-key-123456789','Content-Type':'application/json',Origin:'http://localhost:8775'};try{assert.equal((await fetch(url+'/capabilities')).status,401);assert.equal((await fetch(url+'/capabilities',{headers:{...headers,Origin:'https://untrusted.invalid'}})).status,403);assert.equal((await fetch(url+'/capabilities',{headers})).status,200);const payload={requestId:'REQ-1',approved:true,task:'summary',question:'Summarise the selected synthetic source',records:[],sources:[]};const first=await fetch(url+'/assist',{method:'POST',headers,body:JSON.stringify(payload)});assert.equal(first.status,200);assert.equal((await first.json()).text,'Sourced synthetic draft.');await fetch(url+'/assist',{method:'POST',headers,body:JSON.stringify(payload)});assert.equal(calls,1);assert.equal((await fetch(url+'/assist',{method:'POST',headers,body:JSON.stringify({...payload,requestId:'REQ-2',approved:false})})).status,400);}finally{await new Promise(r=>server.close(r))}});
