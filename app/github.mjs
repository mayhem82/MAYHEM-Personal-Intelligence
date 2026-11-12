import{b64,utf8,decode,unb64,id,validate,digest}from'./core.mjs';
import{createVault,unlockVault,encrypt,decrypt}from'./crypto.mjs';
export function repositoryName(value){
 let name=typeof value==='string'?value.trim():'',cloneAddress=false;
 if(/^git@github\.com:/i.test(name)){name=name.replace(/^git@github\.com:/i,'');cloneAddress=true;}
 else if(/^https?:\/\//i.test(name)||/^github\.com\//i.test(name)){
  let address;try{address=new URL(/^github\.com\//i.test(name)?'https://'+name:name)}catch{throw Error('Enter a GitHub repository link or owner/repository.')}
  if(address.protocol!=='https:'||address.hostname.toLowerCase()!=='github.com'||address.port||address.username||address.password)throw Error('Use a repository link on github.com without embedded credentials.');
  name=address.pathname.replace(/^\//,'');cloneAddress=true;
 }
 name=name.replace(/\/+$/,'');if(cloneAddress)name=name.replace(/\.git$/,'');
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(name)||name.split('/').some(part=>part==='.'||part==='..'))throw Error(name?'Enter a GitHub repository link or owner/repository.':'Enter your private repository name or GitHub link.');
 return name;
}
export function repositoryConnectionInput(repo,token){
 const fields={};let name;
 try{name=repositoryName(repo)}catch(error){fields.repo=error.message}
 const key=typeof token==='string'?token.trim():'';
 if(!key)fields.token='Enter the restricted access token created in GitHub. Your encryption passphrase belongs in the next step.';
 if(Object.keys(fields).length)throw Object.assign(Error('Complete the highlighted connection fields. Nothing was sent to GitHub.'),{fields});
 return{repo:name,token:key};
}
export class GitHubStore{
 constructor(){this.token='';this.repo='';this.branch='';this.repoId=null;this.head=null;this.tree=null;this.header=null;this.key=null;this.saving=false;this.uploaded=new Map()}
 async api(path,options={}){const r=await fetch('https://api.github.com'+path,{...options,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+this.token,'X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})},body:options.body?JSON.stringify(options.body):undefined});if(!r.ok){const err=Error(r.status===401?'GitHub access expired or invalid':r.status===403?'GitHub permission denied or rate limit reached':r.status===409||r.status===422?'Remote changes conflict with this save. Reload or preserve an encrypted backup before merging.':'GitHub request failed ('+r.status+')');err.status=r.status;throw err}return r.status===204?null:r.json()}
 path(s){return'/repos/'+this.repo+s}
 async verify(){const repo=await this.api(this.path(''));if(!repo.private)throw Error('The case repository must be private. Connection refused.');if(this.repoId&&repo.id!==this.repoId)throw Error('Repository identity changed');this.repoId=repo.id;return repo}
 async connect(repo,token){const input=repositoryConnectionInput(repo,token);this.disconnect();this.repo=input.repo;this.token=input.token;try{const data=await this.verify();this.branch=data.default_branch;await this.refreshHead();const tree=await this.api(this.path('/git/trees/'+this.tree+'?recursive=1'));if(tree.truncated)throw Error('Repository tree is truncated; cannot load safely');this.uploaded=new Map(tree.tree.filter(x=>x.type==='blob').map(x=>[x.path,x.sha]));if(this.uploaded.has('storage.json'))this.header=JSON.parse(await this.readPath('storage.json'));return{repoId:data.id,branch:this.branch,hasVault:!!this.header}}catch(e){this.disconnect();throw e}}
 async refreshHead(){const ref=await this.api(this.path('/git/ref/heads/'+encodeURIComponent(this.branch)));this.head=ref.object.sha;const commit=await this.api(this.path('/git/commits/'+this.head));this.tree=commit.tree.sha}
 async readPath(path){const sha=this.uploaded.get(path);if(!sha)throw Error('Missing private object: '+path);const obj=await this.api(this.path('/git/blobs/'+sha));return decode.decode(unb64(obj.content.replace(/\s/g,'')))}
 async unlockKey(pass){if(!this.header)throw Error('No encrypted workspace in repository');const header=this.header;this.key=null;const key=await unlockVault(header,pass);if(this.header!==header||!this.token)throw Error('Private connection changed while unlocking.');this.key=key}
 async unlock(pass){await this.unlockKey(pass);return this.load()}
 async initialise(pass){if(this.header)throw Error('A remote vault already exists. Unlock it.');const identity=this.repoId,vault=await createVault(pass);if(this.repoId!==identity||!this.token)throw Error('Private connection changed while setting up encryption.');this.header={...vault.header,workspaceId:id('WS')};this.key=vault.key}
 async load(){if(!this.key)throw Error('Unlock the private store');const manifestObj=JSON.parse(await this.readPath('manifest.enc'));const manifest=await decrypt(this.key,manifestObj,'workspace-manifest');const state=manifest.state;state.attachments=[];for(const file of manifest.files){const chunks=[];for(const chunk of file.storageChunks){const obj=JSON.parse(await this.readPath(chunk.path));const raw=await decrypt(this.key,obj,'attachment:'+file.id+':'+chunk.index,true);if(await digest(raw)!==chunk.digest)throw Error('Attachment chunk checksum failed');chunks.push(b64(raw))}const {storageChunks,...metadata}=file;state.attachments.push({...metadata,chunks})}await validate(state);return state}
 async save(state){if(this.saving)throw Error('A save is already running');if(!this.key||!this.header)throw Error('Connect and unlock private storage first');this.saving=true;try{await validate(state);await this.verify();const ref=await this.api(this.path('/git/ref/heads/'+encodeURIComponent(this.branch)));if(ref.object.sha!==this.head)throw Error('Remote workspace changed. Save an encrypted backup and reload before merging; nothing was overwritten.');const entries=[];const put=async(path,content)=>{const blob=await this.api(this.path('/git/blobs'),{method:'POST',body:{content:b64(utf8.encode(content)),encoding:'base64'}});entries.push({path,mode:'100644',type:'blob',sha:blob.sha});return blob.sha};
 const files=[];for(const file of state.attachments){const storageChunks=[];for(let i=0;i<file.chunks.length;i++){const raw=unb64(file.chunks[i]);const path='originals/'+file.id+'-'+i+'.enc';if(!this.uploaded.has(path))await put(path,JSON.stringify(await encrypt(this.key,raw,'attachment:'+file.id+':'+i)));storageChunks.push({path,index:i,digest:await digest(raw)})}const {chunks,...metadata}=file;files.push({...metadata,storageChunks})}
 const {attachments,...without}=state;const manifest={state:{...without,attachments:[]},files,operationId:id('SAVE')};await put('storage.json',JSON.stringify(this.header));const manifestSha=await put('manifest.enc',JSON.stringify(await encrypt(this.key,manifest,'workspace-manifest')));
 const tree=await this.api(this.path('/git/trees'),{method:'POST',body:{base_tree:this.tree,tree:entries}});const commit=await this.api(this.path('/git/commits'),{method:'POST',body:{message:'Save encrypted ClarityPath workspace',tree:tree.sha,parents:[this.head]}});
 try{await this.api(this.path('/git/refs/heads/'+encodeURIComponent(this.branch)),{method:'PATCH',body:{sha:commit.sha,force:false}})}catch(e){const check=await this.api(this.path('/git/ref/heads/'+encodeURIComponent(this.branch)));if(check.object.sha!==commit.sha)throw e}
 const check=await this.api(this.path('/git/commits/'+commit.sha));if(check.tree.sha!==tree.sha)throw Error('Remote save verification failed');const verifyTree=await this.api(this.path('/git/trees/'+tree.sha));if(!verifyTree.tree.some(x=>x.path==='manifest.enc'&&x.sha===manifestSha))throw Error('Manifest readback verification failed');this.head=commit.sha;this.tree=tree.sha;entries.forEach(x=>this.uploaded.set(x.path,x.sha));return this.head;
 }finally{this.saving=false}}
 disconnect(){this.token='';this.key=null;this.header=null;this.repoId=null;this.head=null;this.tree=null;this.uploaded.clear();this.repo='';this.branch=''}
}
