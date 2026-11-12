import{encrypt,decrypt}from'./crypto.mjs';
const context='private-repository-connection';
function checked(value){
 if(value?.format!=='claritypath-repository-connection-v1'||!/^[-A-Za-z0-9_.]+\/[-A-Za-z0-9_.]+$/.test(value.repo)||!Number.isSafeInteger(value.repoId)||value.repoId<=0||typeof value.token!=='string'||!value.token.trim()||typeof value.passphrase!=='string'||value.passphrase.length<12||value.header?.format!=='claritypath-vault-v1'||typeof value.head!=='string'||typeof value.tree!=='string'||typeof value.remoteVaultPresent!=='boolean'||typeof value.scope!=='string'||!/^https?:\/\//.test(value.scope))throw Error('Saved private connection is invalid. Reconnect through Storage & connections.');
 return value;
}
export function captureRepository(store,passphrase,scope){
 return checked({format:'claritypath-repository-connection-v1',scope,repo:store.repo,repoId:store.repoId,token:store.token,passphrase,header:structuredClone(store.header),head:store.head,tree:store.tree,remoteVaultPresent:store.uploaded.has('storage.json')});
}
export async function sealRepository(key,value){return encrypt(key,checked(value),context)}
export async function openRepository(key,envelope){return checked(await decrypt(key,envelope,context))}
export async function restoreRepository(store,value,scope){
 const saved=checked(value);
 if(saved.scope!==scope)throw Error('This saved private connection belongs to a different installation. Reconnection stopped.');
 try{
  const info=await store.connect(saved.repo,saved.token);
  if(info.repoId!==saved.repoId)throw Error('The saved repository identity no longer matches. Reconnection stopped.');
  if(!store.header){
   if(saved.remoteVaultPresent||store.uploaded.has('manifest.enc'))throw Error('The saved remote encryption header is missing. Reconnection stopped; local work is retained.');
   store.header=structuredClone(saved.header);
  }else if(['format','iterations','salt','iv','wrappedKey','workspaceId'].some(name=>store.header[name]!==saved.header[name]))throw Error('The remote encryption identity changed. Reconnection stopped; local work is retained.');
  await store.unlockKey(saved.passphrase);
  const conflict=store.head!==saved.head;
  // Keep the last accepted remote revision. Reconnecting must not turn a stale
  // local copy into permission to overwrite another device's newer save.
  store.head=saved.head;store.tree=saved.tree;
  return{repoId:info.repoId,conflict};
 }catch(error){store.disconnect();throw error}
}
