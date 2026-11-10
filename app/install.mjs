let promptEvent=null;
const button=document.getElementById('installApp'),help=document.getElementById('installHelp'),instructions=document.getElementById('installInstructions');
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function installed(){if(button){button.hidden=true;document.getElementById('installedApp').hidden=false}if(help)help.hidden=true}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;if(button){button.hidden=false;button.dataset.ready='true'}if(instructions)instructions.textContent='Your browser is ready. Choose Install app to open its installation prompt.'});
window.addEventListener('appinstalled',()=>{promptEvent=null;installed()});
if(standalone())installed();
if(button)button.addEventListener('click',async()=>{
 if(standalone()){location.href='./index.html';return}
 if(promptEvent){const event=promptEvent;promptEvent=null;button.disabled=true;try{await event.prompt();const result=await event.userChoice;if(result.outcome==='accepted'){instructions.textContent='Installation accepted. Your browser will complete the installation.'}else instructions.textContent='Installation dismissed. You can choose Install app again later.';help.hidden=false;button.setAttribute('aria-expanded','true')}catch{showInstructions()}finally{button.disabled=false;delete button.dataset.ready}return}
 showInstructions();
});
function showInstructions(){const apple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);instructions.textContent=apple?'On iPhone or iPad, open this page in Safari, choose Share, then Add to Home Screen.':'Use a normal browser tab; private browsing may disable installation. Open your browser menu and choose Install app or Add to Home screen. On desktop, look for the install icon in the address bar or the browser’s Apps menu. If the option is unavailable, open this page directly in Chrome, Edge, Safari or Samsung Internet and try again.';help.hidden=false;button.setAttribute('aria-expanded','true')}
if('serviceWorker'in navigator&&window.isSecureContext){navigator.serviceWorker.register(new URL('../sw.js',import.meta.url),{scope:new URL('../',import.meta.url).pathname}).catch(()=>{if(instructions)instructions.textContent='Offline setup is unavailable in this browser. You can still use ClarityPath online and check your browser menu for installation.'})}
