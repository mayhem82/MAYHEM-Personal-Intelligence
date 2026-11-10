const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../site'),prefix='/cloned/',base='http://127.0.0.1:8780'+prefix;
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{try{const url=new URL(req.url,base);if(!url.pathname.startsWith(prefix))throw Error('Not found');const relative=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html',file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||relative.split('/').some(part=>part.startsWith('.')))throw Error('Not public');const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(data)}catch{res.writeHead(404);res.end()}});
(async()=>{
 await new Promise(resolve=>server.listen(8780,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
  const context=await browser.newContext({viewport:{width:360,height:800}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const pages=[['index.html','Home'],['first-aid.html','Psychological First Aid'],['workspace.html','Workspace'],['setup.html','Setup'],['operating.html','Guide'],['build.html','Build'],['handoff.html','Handoff'],['disclaimer.html','Disclaimer']];
  for(const [file,title]of pages){
   await page.goto(base+file);
   const menu=page.getByRole('navigation',{name:'Main',exact:true}),footer=page.getByRole('navigation',{name:'Footer',exact:true});
   assert.deepEqual(await menu.locator('a').allTextContents(),pages.map(item=>item[1]));
   assert.deepEqual(await footer.locator('a').allTextContents(),pages.map(item=>item[1]));
   assert.deepEqual(await menu.locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),pages.map(item=>'./'+item[0]));
   assert.equal(await menu.locator('a[aria-current=page]').textContent(),title);
   assert.equal(await menu.locator('a[aria-current=page]').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,file+' overflows');
   assert((await menu.locator('a').evaluateAll(links=>links.map(link=>link.getBoundingClientRect().height))).every(height=>height>=44));
  }
  await page.goto(base+'setup.html#manual-step-3');
  await page.locator('#manual-step-3 .guide-step-nav a[href="#manual-step-4"]').click();
  assert.equal(new URL(page.url()).hash,'#manual-step-4');
  await page.locator('#manual-step-4 .guide-step-nav a[href="#manual-step-3"]').click();
  await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Build',exact:true}).click();
  await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Setup',exact:true}).click();
  await page.waitForFunction(()=>location.hash==='#manual-step-3');
  await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Setup',exact:true}).click();
  assert.equal(new URL(page.url()).hash,'#site-top');
  const broken=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(link=>!document.getElementById(link.getAttribute('href').slice(1))).map(link=>link.getAttribute('href')));assert.deepEqual(broken,[]);
  fs.mkdirSync(path.join(root,'../test-results'),{recursive:true});await page.screenshot({path:path.join(root,'../test-results/navigation-mobile.png')});
  await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Workspace',exact:true}).click();
  await page.waitForFunction(()=>typeof claritypathStatus==='function');
  await page.locator('#newCase').click();await page.locator('#caseForm-title').fill('Synthetic private navigation canary');await page.locator('#caseForm button[type=submit]').click();await page.waitForFunction(()=>claritypathStatus().caseCount===1);
  const dialogue=page.waitForEvent('dialog'),click=page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Setup',exact:true}).click({noWaitAfter:true});
  const warning=await dialogue;assert.equal(warning.type(),'beforeunload');await warning.dismiss();await click;
  assert(new URL(page.url()).pathname.endsWith('/workspace.html'));assert.equal(await page.evaluate(()=>claritypathStatus().caseCount),1);
  const saved=await page.evaluate(()=>Object.fromEntries(Object.entries(sessionStorage).filter(([key])=>key.startsWith('claritypath-reading:'))));
  assert(!JSON.stringify(saved).includes('Synthetic private navigation canary'));assert(!Object.keys(saved).some(key=>key.includes('workspace')));
  for(const entry of Object.values(saved))assert.deepEqual(Object.keys(JSON.parse(entry)),['section']);
  assert.deepEqual(errors,[]);await context.close();
  console.log(JSON.stringify({eightConsistentPages:true,currentPageMarkers:true,mobileTouchTargets:true,noMobileOverflow:true,previousNextSteps:true,publicReadingPositionRestored:true,currentPageReturnsToTop:true,privateWorkspaceGuardPreserved:true,publicPositionContainsNoCaseData:true,browserErrors:errors}));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error(error);process.exitCode=1});
