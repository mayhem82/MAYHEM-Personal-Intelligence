const pages=[
 ['index.html','Home'],['first-aid.html','Psychological First Aid'],['workspace.html','Workspace'],['setup.html','Setup'],['operating.html','Guide'],['build.html','Build'],['handoff.html','Handoff'],['disclaimer.html','Disclaimer']
];
const menu=(current,label)=>'<nav class="site-nav" aria-label="'+label+'">'+pages.map(([file,title])=>'<a href="./'+file+'"'+(current===file?' aria-current="page"':'')+'>'+title+'</a>').join('')+'</nav>';
export function applySiteLayout(html,current,version){
 const old=html.match(/<header\b[^>]*>[\s\S]*?<\/header>/);
 if(!old)throw Error('Missing page header: '+current);
 let tools='';
 if(current==='workspace.html'&&old[0].includes('id="connectionState"')){
  const connection=old[0].match(/<div id="connectionState">[\s\S]*?<\/div>/)?.[0];
  const save=old[0].match(/<button id="saveRemote"[^>]*>[\s\S]*?<\/button>/)?.[0];
  const lock=old[0].match(/<button id="lock"[^>]*>[\s\S]*?<\/button>/)?.[0];
  if(!connection||!save||!lock)throw Error('Workspace controls must be preserved');
  tools='<div class="workspace-tools" role="region" aria-label="Workspace storage">'+connection+'<div class="actions">'+save+lock+'</div></div>';
 }
 const header='<header class="top site-header" id="site-top"><a class="brand" href="./index.html" aria-label="ClarityPath home">ClarityPath</a>'+menu(current,'Main')+'</header>';
 const footer='<footer class="site-main site-footer">'+menu(current,'Footer')+'<p><a href="#site-top">Back to top</a></p><p class="meta">© 2026 Julian Minko · Architect of MAYHEM · ClarityPath. External sources retain their attribution.</p></footer>';
 html=html.replace(old[0],header+tools).replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/,footer);
 html=html.replace(/<script\b[^>]*src="\.\/app\/navigation\.mjs[^"]*"[^>]*><\/script>/g,'');
 html=html.replace('</head>','<script type="module" src="./app/navigation.mjs?v='+version+'"></script></head>');
 return html.replace('href="./OPERATING-GUIDE.txt">the operating guide','href="./operating.html">the operating guide');
}
