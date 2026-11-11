// Public launch routing. The Home view never reads or copies private records.
import{homeMarkup,homeTitle}from'./home-view.mjs';
const home=new URL('../index.html',import.meta.url),workspace=new URL('../workspace.html',import.meta.url),scope=new URL('../',import.meta.url);
const original=new URL(location.href);original.searchParams.delete('open');
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let homeView=null,homeVisible=false,previousTitle='',previousScroll=0,previousMarkers=[],wasHidden=false,filePicker=false,fileReturnUntil=0,previousSkip=null;
export function prepareWorkspaceEntry(){
 if(!installed()||location.pathname!==workspace.pathname)return true;
 const current=new URL(location.href),intent=current.searchParams.get('open')==='workspace';
 if(intent||current.searchParams.has('area')||current.searchParams.has('situation')){
  if(intent){current.searchParams.delete('open');try{history.replaceState(history.state,'',current)}catch{}}
  return true;
 }
 location.replace(home.href);return false;
}
function showHome(){
 if(document.querySelector('dialog[open]'))return;
 if(homeVisible||original.pathname===home.pathname||original.pathname===scope.pathname){scrollTo(0,0);return;}
 if(!homeView){homeView=document.createElement('main');homeView.id='appHome';homeView.className='site-main';homeView.hidden=true;homeView.innerHTML=homeMarkup;for(const id of ['installApp','installedApp','installHelp'])homeView.querySelector('#'+id)?.remove();document.querySelector('header').after(homeView)}
 previousTitle=document.title;previousScroll=scrollY;previousMarkers=[...document.querySelectorAll('.site-nav a')].map(anchor=>[anchor,anchor.getAttribute('aria-current')]);
 for(const[anchor]of previousMarkers){const target=new URL(anchor.href);if(target.pathname===home.pathname)anchor.setAttribute('aria-current','page');else anchor.removeAttribute('aria-current')}
 const skip=document.querySelector('a.skip');if(skip){previousSkip=[skip,skip.getAttribute('href'),skip.textContent];skip.href='#appHome';skip.textContent='Skip to Home'}
 homeVisible=true;document.documentElement.classList.add('showing-app-home');homeView.hidden=false;document.title=homeTitle;
 history.replaceState(history.state,'',home);scrollTo(0,0);const title=homeView.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});
}
function restorePage(){
 homeVisible=false;homeView.hidden=true;document.documentElement.classList.remove('showing-app-home');document.title=previousTitle;
 for(const[anchor,value]of previousMarkers){if(value===null)anchor.removeAttribute('aria-current');else anchor.setAttribute('aria-current',value)}
 if(previousSkip){previousSkip[0].setAttribute('href',previousSkip[1]);previousSkip[0].textContent=previousSkip[2]}
 history.replaceState(history.state,'',original);scrollTo(0,previousScroll);
}
export function installLaunchNavigation(){
 if(!installed())return;
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0)return;
  if(event.target.matches?.('input[type=file]')){
   filePicker=true;const finish=()=>{filePicker=false;fileReturnUntil=performance.now()+1500};event.target.addEventListener('change',finish,{once:true});event.target.addEventListener('cancel',finish,{once:true});
  }
  const anchor=event.target.closest?.('a[href]');if(!anchor||anchor.hasAttribute('download')||anchor.getAttribute('href').startsWith('#'))return;
  const target=new URL(anchor.href,location.href);if(target.origin!==home.origin)return;
  if(homeVisible&&target.pathname===original.pathname&&target.pathname!==home.pathname){event.preventDefault();event.stopImmediatePropagation();restorePage();return}
  if(target.pathname===home.pathname||target.pathname===scope.pathname){event.preventDefault();event.stopImmediatePropagation();showHome();return}
  if(target.pathname===workspace.pathname){target.searchParams.set('open','workspace');anchor.href=target.href}
 },{capture:true});
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){wasHidden=true;return}
  if(!wasHidden)return;wasHidden=false;
  if(filePicker||performance.now()<fileReturnUntil)return;
  showHome();
 });
 if(window.launchQueue?.setConsumer)window.launchQueue.setConsumer(params=>{
  if(!params?.targetURL)return;let target;try{target=new URL(params.targetURL)}catch{return}
  if(target.origin===home.origin&&target.pathname.startsWith(scope.pathname))showHome();
 });
}
