const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const aiTitles = ['Choose the owner’s account', 'Create the public site', 'Connect the private case store', 'Connect required artificial intelligence', 'Test the working system', 'Finish backups and the replication pack'];
const manualTitles = ['Copy the public application', 'Publish your site', 'Connect private storage', 'Connect artificial intelligence', 'Test the workflow', 'Keep your system ready'];

function linesHTML(lines) {
  let html = '', list = '';
  const close = () => { if (list) html += '</' + list + '>'; list = ''; };
  for (const line of lines) {
    const number = line.match(/^(\d+)\) (.+)$/), bullet = line.match(/^- (.+)$/), environment = line.match(/^ENV ([A-Z_]+) = (.+)$/), reference = line.match(/^Reference: (.+) \| (.+)$/);
    if (number || bullet) {
      const kind = number ? 'ol' : 'ul';
      if (list !== kind) { close(); list = kind; html += '<' + kind + (number ? ' start="' + number[1] + '"' : '') + '>'; }
      html += '<li' + (number ? ' value="' + number[1] + '"' : '') + '>' + escape(number ? number[2] : bullet[1]) + '</li>';
    } else if (environment) {
      if (list !== 'dl') { close(); list = 'dl'; html += '<dl class="setup-settings">'; }
      html += '<dt><code>' + escape(environment[1]) + '</code></dt><dd>' + escape(environment[2]) + '</dd>';
    } else {
      close();
      if (reference && /^(https:\/\/|\.\/)/.test(reference[2])) html += '<p><a href="' + escape(reference[2]) + '">' + escape(reference[1]) + '</a></p>';
      else if (line.startsWith('COMMAND ')) html += '<p><code class="setup-command">' + escape(line.slice(8)) + '</code></p>';
      else if (line.startsWith('Check: ')) html += '<p class="notice"><strong>Check:</strong> ' + escape(line.slice(7)) + '</p>';
      else html += '<p>' + escape(line) + '</p>';
    }
  }
  close(); return html;
}

function stepNavigation(prefix,index,step,titles,blocks){
 const link=(href,text)=>'<a href="'+href+'">'+escape(text)+'</a>';
 const all='<a href="#'+(prefix==='start'?'setup-content':prefix==='operating'?'setup-content':prefix+'-setup')+'">All '+(prefix==='manual'?'manual steps':prefix==='ai'?'assisted steps':'instructions')+'</a>';
 let before='',after='';
 if(step&&titles){
  const number=Number(step[1]);
  before=number>1?link('#'+prefix+'-step-'+(number-1),'Previous: '+titles[number-2]):link('#'+prefix+'-setup','Back to '+(prefix==='manual'?'manual':'assisted')+' overview');
  after=number<6?link('#'+prefix+'-step-'+(number+1),'Next: '+titles[number]):link(prefix==='manual'?'./operating.html':'#ai-section-7',prefix==='manual'?'Next: Use ClarityPath':'Next: Publication boundary');
 }else if(prefix==='start'){
  before=index>0?link(index===1?'#before-you-start':'#start-github','Previous step'):'';
  after=index===0?link('#start-github','Next: Set up GitHub'):index===1?link('#connect-ai','Next: Connect a coding assistant'):'';
  if(index>=1)after+=link('#manual-setup','Continue manually')+link('#ai-setup','Continue with an assistant');
 }else if(prefix==='operating'){
  if(index>0)before=link('#operating-section-'+(index-1),'Previous: '+blocks[index-1].split('\n')[0]);
  if(index<blocks.length-1)after=link('#operating-section-'+(index+1),'Next: '+blocks[index+1].split('\n')[0]);
  else after=link('./workspace.html','Open workspace');
 }else if(prefix==='ai'){
  after=index===0?link('#ai-step-1','Start assisted setup'):link('./workspace.html','Open workspace');
 }
 return '<nav class="guide-step-nav" aria-label="Section navigation">'+before+all+after+'</nav>';
}

function documentHTML(text, prefix, titles, level = 3) {
  const blocks=text.trim().split(/\n\s*\n/).slice(1);
  return blocks.map((block, index) => {
    const [heading, ...lines] = block.split('\n'), step = heading.match(/^([1-6])\. /);
    const commonIds = ['before-you-start', 'start-github', 'connect-ai'];
    const commonTitles = ['Before you start', 'First, set up your GitHub account', 'Connect a coding assistant to GitHub'];
    const id = prefix === 'start' ? commonIds[index] : prefix + (step ? '-step-' + step[1] : '-section-' + index);
    const title = prefix === 'start' ? commonTitles[index] : step && titles ? step[1] + '. ' + titles[Number(step[1]) - 1] : heading;
    return '<section id="' + id + '"><h' + level + '>' + escape(title) + '</h' + level + '>' + linesHTML(lines) + stepNavigation(prefix,index,step,titles,blocks) + '</section>';
  }).join('');
}

function shell(title, body) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>ClarityPath · ' + escape(title) + '</title><link rel="stylesheet" href="./app/style.css"><script type="module" src="./app/build-page.mjs"></script></head><body><a class="skip" href="#setup-content">Skip to instructions</a><header class="top"><a class="brand" href="./index.html">ClarityPath</a><nav aria-label="Main"><a href="./workspace.html">Workspace</a><a href="./build.html">Build</a><a href="./setup.html">Setup</a></nav></header><main class="site-main setup-main" id="setup-content">' + body + '</main><footer class="site-main meta">© 2026 Julian Minko · Architect of MAYHEM · ClarityPath · <a href="./disclaimer.html">Disclaimer</a></footer></body></html>';
}

const toc = (titles, prefix) => '<nav class="card setup-toc" aria-label="' + (prefix === 'ai' ? 'assisted' : prefix) + ' steps"><h3>The six setup steps</h3><ol>' + titles.map((title, index) => '<li><a href="#' + prefix + '-step-' + (index + 1) + '">' + escape(title) + '</a></li>').join('') + '</ol></nav>';

export function renderSetup({ start, manual, ai, operating }) {
  start=start.replace(/\r\n?/g,'\n');manual=manual.replace(/\r\n?/g,'\n');ai=ai.replace(/\r\n?/g,'\n');operating=operating.replace(/\r\n?/g,'\n');
  const copyControls = (id, label, file, status) => '<div class="actions"><button id="' + id + '" type="button">' + label + '</button><a class="button secondary" href="./' + file + '" download>Download ' + (id === 'copyManual' ? 'manual' : 'assisted') + ' instructions</a></div><p id="' + status + '" role="status" aria-live="polite"></p>';
  const intro = '<p class="eyebrow">Start from the beginning · Manual or assisted setup</p><h1>Set up your own ClarityPath</h1><p class="lead">Start with your GitHub account, understand the requirements, then follow the manual guide or connect a coding assistant to help.</p><nav class="actions" aria-label="Choose a setup route"><a class="button" href="./workspace.html?view=installation">Start guided installation</a><a class="button" href="#before-you-start">Read before starting</a><a class="button secondary" href="#manual-setup">Manual setup</a><a class="button secondary" href="#ai-setup">Assisted setup</a></nav>';
  const manualSection = '<section id="manual-setup"><p class="eyebrow">Do the work yourself</p><h2>Manual setup guide</h2><p>Complete the account steps above, then follow these numbered instructions. The copy and download include the up-front concerns, GitHub account steps and optional coding assistant connection instructions too.</p>' + copyControls('copyManual', 'Copy manual instructions', 'MANUAL-SETUP.txt', 'manualStatus') + toc(manualTitles, 'manual') + '<div id="manual-steps" class="setup-document">' + documentHTML(manual, 'manual', manualTitles) + '</div></section>';
  const aiSection = '<section id="ai-setup"><p class="eyebrow">Work with a coding assistant</p><h2>Assisted setup guide</h2><p>Read the concerns, set up GitHub and connect your coding assistant using the steps above. Give the assistant these complete instructions together with the source repository or full Build pack. Review its destination, access and results.</p>' + copyControls('copySetup', 'Copy assisted setup instructions', 'AI-SETUP.txt', 'setupStatus') + '<p><a href="./build.html">Open the complete Build pack</a></p>' + toc(aiTitles, 'ai') + '<div id="ai-steps" class="setup-document">' + documentHTML(ai, 'ai', aiTitles) + '</div></section>';
  return {
    page: shell('Manual and assisted setup', intro + documentHTML(start, 'start', null, 2) + manualSection + aiSection + '<p><a href="#setup-content">Back to the beginning</a></p>'),
    manualText: start.trimEnd() + '\n\n' + manual.trimEnd() + '\n',
    aiText: start.trimEnd() + '\n\n' + ai.trimEnd() + '\n',
    operatingPage: shell('Using ClarityPath', '<p class="eyebrow">Operating guide</p><h1>Using your ClarityPath</h1><p><a href="./OPERATING-GUIDE.txt" download>Download operating guide text</a></p>' + documentHTML(operating, 'operating', null, 2))
  };
}
