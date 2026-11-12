export class InstallationSession{
 constructor(){this.route='manual';this.reset()}
 reset(){this.owner={};this.repoId=null;this.repositoryLive=false;this.savedRevision=null;this.loaded=false;this.serviceReady=false;this.serviceEpoch=(this.serviceEpoch||0)+1;this.providerReply=false;this.backupPrepared=null;this.backupVerified=null;this.handoffPrepared=null}
 confirm(name,value){this.owner[name]=value===true}
 beginRepository(){this.repositoryLive=false}
 connectedRepository(id){if(this.repoId!==id){this.savedRevision=null;this.loaded=false;this.backupPrepared=this.backupVerified=this.handoffPrepared=null;this.owner.reopenedContents=this.owner.backupStored=this.owner.recipientChecked=false}this.repoId=id;this.repositoryLive=true}
 repositoryDisconnected(){this.repositoryLive=false}
 beginSave(){this.savedRevision=null}
 beginRead(){this.loaded=false;this.owner.reopenedContents=false}
 beginProviderRequest(epoch){if(epoch===this.serviceEpoch)this.providerReply=false}
 beginBackupCheck(){this.backupVerified=null}
 saved(revision){this.savedRevision=revision}
 reopened(){this.loaded=true;this.owner.reopenedContents=false}
 beginService(){this.serviceReady=false;this.providerReply=false;return ++this.serviceEpoch}
 configuredService(){this.serviceReady=true}
 receivedReply(epoch){if(epoch===this.serviceEpoch&&this.serviceReady)this.providerReply=true}
 preparedBackup(revision){this.backupPrepared=revision;this.backupVerified=null;this.owner.backupStored=false}
 checkedBackup(revision){this.backupVerified=revision}
 preparedHandoff(revision){this.handoffPrepared=revision;this.owner.recipientChecked=false}
 result(current){
 const repository=current.repositoryConnected&&this.repositoryLive&&current.repoId===this.repoId;
 const service=current.serviceConnected&&this.serviceReady;
 const revision=typeof current.revision==='string'&&current.revision.length>0;
 const rows=[],add=(id,stage,label,done,kind='verified')=>rows.push({id,stage,label,done:!!done,kind});
 add('requirements',0,'Accounts, costs, permissions, privacy and recovery reviewed',this.owner.requirements,'owner');
 add('accountControl',1,'Ownership of the public site, private repository, host and provider confirmed',this.owner.accountControl,'owner');
 add('testMaterial',1,'Clearly labelled test material chosen for installation checks',this.owner.testMaterial,'owner');
 add('sample',2,'A record and an attached file are available',current.recordCount>0&&current.attachmentCount>0);
 add('repository',2,'Private repository identity and visibility checked',repository);
 add('encryption',2,'Private repository encryption is unlocked',repository&&current.repositoryUnlocked);
 add('save',2,'Current workspace save and remote readback verified',repository&&revision&&this.savedRevision===current.revision);
 add('load',2,'Encrypted workspace loaded and validated this session',repository&&this.loaded);
 add('reopenedContents',2,'Reopened record and original file compared with the saved test material',repository&&this.loaded&&this.owner.reopenedContents,'owner');
 add('remembered',2,'Private repository connection encrypted for reopening on this device',repository&&current.rememberedRepository);
 add('service',3,'Required service configuration checked without case transmission',service);
 add('provider',3,'Separately approved service request returned a validated response',service&&this.providerReply);
 add('backupPrepared',4,'Encrypted backup prepared for download',revision&&this.backupPrepared===current.revision,'prepared');
 add('backup',4,'Encrypted backup reopened and matched against current work',revision&&this.backupVerified===current.revision);
 add('backupStored',4,'Independent backup location confirmed',this.owner.backupStored&&revision&&this.backupPrepared===current.revision,'owner');
 add('recovery',4,'Passphrases and account recovery methods kept privately',this.owner.recovery,'owner');
 add('handoff',4,'Protected selected handoff prepared for download',revision&&this.handoffPrepared===current.revision,'prepared');
 add('recipient',4,'Protected handoff opened independently and its selection checked',this.owner.recipientChecked&&revision&&this.handoffPrepared===current.revision,'owner');
 return{rows,complete:rows.every(r=>r.done),next:rows.find(r=>!r.done)?.id||'finish',nextStage:rows.find(r=>!r.done)?.stage??5,verified:rows.filter(r=>r.done&&r.kind==='verified').length,confirmed:rows.filter(r=>r.done&&r.kind==='owner').length,remaining:rows.filter(r=>!r.done).length};
 }
}
