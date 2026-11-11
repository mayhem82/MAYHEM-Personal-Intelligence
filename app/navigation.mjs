import{installLaunchNavigation}from'./startup.mjs?v=3.4.2';
installLaunchNavigation();
// Only public guide section IDs are remembered for this installation and tab.
const file=location.pathname.split('/').pop()||'index.html';
if(['first-aid.html','setup.html','operating.html','build.html','disclaimer.html'].includes(file)){
 const key='claritypath-reading:'+location.pathname;
 const sections=[...document.querySelectorAll('main section[id]')];
 const allowed=new Set(['site-top',...sections.map(section=>section.id)]);
 const valid=id=>typeof id==='string'&&/^[a-z][a-z0-9-]{0,80}$/.test(id)&&allowed.has(id);
 let lastSection=valid(location.hash.slice(1))?location.hash.slice(1):'site-top',scheduled=false;
 function sample(){
  if(document.documentElement.classList.contains('showing-app-home'))return;
  scheduled=false;
  const section=sections.filter(section=>section.getBoundingClientRect().top<=100).at(-1);
  // Moving to the header to use its menu must not erase the reading position.
  if(section&&valid(section.id))lastSection=section.id;
 }
 function remember(){
  sample();
  try{sessionStorage.setItem(key,JSON.stringify({section:lastSection}))}catch{}
 }
 function restore(){
  if(location.hash)return;
  try{
   const saved=JSON.parse(sessionStorage.getItem(key)||'null');
   if(valid(saved?.section))requestAnimationFrame(()=>{
    lastSection=saved.section;document.getElementById(lastSection).scrollIntoView();
    const url=new URL(location.href);url.hash=lastSection;history.replaceState(null,'',url);
   });
  }catch{}
 }
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sample)}},{passive:true});
 addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(valid(id))lastSection=id});
 addEventListener('pagehide',remember);
 addEventListener('pageshow',event=>{if(!event.persisted)restore()});
 for(const link of document.querySelectorAll('.site-nav a[aria-current="page"]'))link.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();lastSection='site-top';document.getElementById('site-top').scrollIntoView();
  const url=new URL(location.href);url.hash='site-top';history.replaceState(null,'',url);
 });
}
