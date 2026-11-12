for(const config of [
 {button:'copyPack',status:'buildStatus',file:'build-pack.txt',loading:'Loading the complete build pack…',success:'Public application pack copied. Private MAYHEM specifications are excluded.',failure:'Clipboard copy is unavailable. Download the complete build pack and open/copy that text file.'},
 {button:'copySetup',status:'setupStatus',file:'AI-SETUP.txt',loading:'Loading the complete assisted setup instructions…',success:'Complete assisted setup instructions copied.',failure:'Clipboard copy is unavailable. Download the assisted instructions instead.'},
 {button:'copyTrusted',status:'trustedStatus',file:'TRUSTED-BUILDER-SETUP.txt',loading:'Loading the complete trusted-person setup instructions…',success:'Complete trusted-person instructions copied.',failure:'Clipboard copy is unavailable. Download the trusted-person instructions instead.'},
 {button:'copyManual',status:'manualStatus',file:'MANUAL-SETUP.txt',loading:'Loading the complete manual instructions…',success:'Complete manual instructions copied.',failure:'Clipboard copy is unavailable. Download the manual instructions instead.'}
]){
 const button=document.getElementById(config.button),status=document.getElementById(config.status);if(!button||!status)continue;
 button.onclick=async()=>{button.disabled=true;status.textContent=config.loading;try{const response=await fetch('./'+config.file,{cache:'no-store'});if(!response.ok)throw Error('Download unavailable');await navigator.clipboard.writeText(await response.text());status.textContent=config.success}catch{status.textContent=config.failure}finally{button.disabled=false}};
}
