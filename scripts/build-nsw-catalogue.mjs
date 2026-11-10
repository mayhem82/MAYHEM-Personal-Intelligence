import{readFile,writeFile}from'node:fs/promises';
const index=JSON.parse(await readFile('sources/public/nsw-source-index.json','utf8'));
const institutions=JSON.parse(await readFile('sources/public/nsw-institutions-checked.json','utf8'));
const law=(title,id)=>({title,id,url:'https://legislation.nsw.gov.au/view/html/inforce/current/'+id});
const laws=[...index.laws,law('Crimes Act 1900','act-1900-040'),law('Criminal Procedure Act 1986','act-1986-209'),law('Law Enforcement (Powers and Responsibilities) Act 2002','act-2002-103'),law('Bail Act 2013','act-2013-026'),law('Road Transport Act 2013','act-2013-018'),law('Succession Act 2006','act-2006-080'),law('Mental Health Act 2007','act-2007-008'),{id:'fair-work',title:'Fair Work Act 2009 and workplace legislation (Commonwealth)',url:'https://www.fairwork.gov.au/about-us/legislation'},{id:'family-law',title:'Family law legislation and court rules (Commonwealth)',url:'https://www.fcfcoa.gov.au/resources/legislation'}];
const groups=index.situations.filter(s=>s.path.split('/').length===3).map(s=>({id:s.group,title:s.title,source:s.url}));
const mapping={
 'a-criminal-charge':[['act-1900-040','act-1986-209','act-2002-103','act-2013-026'],['local-court','police','lecc']],
 'apprehended-violence-order-avo':[[],['local-court','police']],
 'my-car-or-a-driving-offence':[['act-2013-018','act-2017-010'],['local-court','sira','afca']],
 'consumer-claims':[['act-1987-068','act-1989-147','act-2013-107'],['ncat']],
 'cyber-safety':[['act-1998-133','act-2002-071'],['esafety','ipc','police']],
 'disasters':[[],['legal-aid','afca']],
 'discrimination':[['act-1977-048'],['anti-discrimination','ncat']],
 'my-family-or-relationship':[['family-law','act-1998-157','act-2000-075'],['family-court','services-australia']],
 'fines':[['act-1996-099','act-2018-011'],['revenue','local-court']],
 'government-benefits':[[],['services-australia','art']],
 'mental-health':[['act-2007-008','act-1987-257','act-1993-105'],['mental-health','hccc','ncat']],
 'my-money':[['act-1980-016','act-1987-068'],['local-court','afca','afsa']],
 'my-housing':[['act-2010-042','act-2013-097','act-1995-068'],['ncat']],
 'my-neighbour':[['act-1991-072','act-2015-050','act-2021-007'],['ncat','land-environment']],
 'planning-ahead':[['act-2003-053','act-1987-257','act-2006-080'],['ncat','supreme-court']],
 'someone-who-died':[['act-2006-080','act-2009-049'],['supreme-court']],
 'victims-rights':[['act-2013-037'],['police','legal-aid']],
 'visas-and-immigration':[[],['home-affairs','art']],
 'my-job':[['fair-work','act-2011-010','act-1998-086'],['fair-work-ombudsman','fair-work-commission','industrial-relations','safe-work','sira','iro']],
 'i-have-a-different-problem':[[],['legal-aid']],
 'my-right-as-a':[['act-1983-042'],['legal-aid']]
};
const pathways=[];
function route(id,title,scope,steps,exceptions){pathways.push({id,title,scope,steps,exceptions,checkedAt:'2026-11-10'})}
const step=(body,requirement,action,before,evidence,timing,source)=>({body,requirement,action,before,evidence,timing,source});
const strata='https://ncat.nsw.gov.au/case-types/housing-and-property/strata-and-community-living/strata-schemes.html';
route('strata','Strata and community scheme disputes','Choose the particular order first: mediation requirements depend on the order sought.',[
 step('NSW Fair Trading','Mandatory unless exempt','Attempt strata mediation.','Before lodging an NCAT application for an order requiring mediation.','Mediation certificate or evidence supporting the specific exemption.','Check the time limit for the particular order.',strata),
 step('NCAT','Conditional','Apply for an order within NCAT’s jurisdiction.','You must be an eligible applicant, identify the order and statutory provision, and satisfy mediation or an exemption.','Application, scheme details, relevant records and mediation evidence.','Order-specific limits apply; consult the orders table.','https://ncat.nsw.gov.au/case-types/housing-and-property/strata-and-community-living/strata-schemes/strata-schemes-orders.html')
 ],'Some orders bypass mediation, including specified appointment, access, penalty and records orders. The statutory exemptions and orders table control; urgent circumstances must be assessed under the actual rule.');
const admin='https://ncat.nsw.gov.au/case-types/administrative-review-and-regulation/reviews-of-other-government-agency-decisions.html';
route('administrative','NSW administrative decision review','Only decisions made reviewable by an enabling law can be reviewed by NCAT.',[
 step('Original NSW decision-maker','Generally required; exceptions apply','Request internal review of the decision.','Before NCAT administrative review where the enabling law requires it.','Decision, notification date, request, reasons and supporting material.','Generally request internal review within 28 days of being told of the original decision; check the specific law.',admin),
 step('NCAT','Conditional','Apply for administrative review.','A reviewable decision, standing and internal review or an applicable exception are required.','Original and internal-review decisions, proof of dates, relevant evidence and requested outcome.','Generally 28 days after notification of the internal-review decision; check exceptions and extensions.',admin)
 ],'The particular enabling law may exempt internal review. NCAT is not a general appeal body for every government action.');
const privacy='https://www.ipc.nsw.gov.au/resources/fact-sheet-privacy-complaints-your-review-rights';
route('privacy','Privacy: NSW public sector agency → NCAT','This is the NSW public-sector internal-review route, not the private-sector or Commonwealth privacy route.',[
 step('NSW agency concerned','Mandatory for this NCAT route','Make a valid written privacy internal-review application.','NCAT requires a valid internal-review application to the agency first.','Conduct complained of, when you became aware, supporting material and Australian postal/email address.','Normally within 6 months of awareness; agency may accept a later application.',privacy),
 step('NCAT','Conditional','Seek review of the conduct covered by the internal-review application.','Internal-review outcome received, or review not completed within 60 days of receipt.','Application, proof of receipt, outcome or evidence of elapsed time.','Apply within 28 days of the report, or within 28 days after the 60-day period ends if unfinished.',privacy)
 ],'A complaint to the Privacy Commissioner does not itself provide this NCAT review right. Later conduct may need a separate application.');
const gipa='https://www.ipc.nsw.gov.au/resources/fact-sheet-your-review-rights-under-gipa-act';
route('gipa','Government information: alternative review routes','Internal review, Information Commissioner review and NCAT review are alternatives with conditions, not a compulsory three-stage ladder.',[
 step('Agency / Information Commissioner / NCAT','Choose an available route','Identify a reviewable GIPA decision and your status as applicant or third party.','The original access applicant can often approach IPC or NCAT without internal review; third-party requirements differ.','Access application, decision, notification date and reasons for disagreement.','IPC: 40 working days; NCAT generally 40 working days, or 20 working days following IPC review outcome. Check the source for the chosen route.',gipa)
 ],'Third parties must seek internal review before NCAT where available. IPC cannot review its own access decision; special Supreme Court leave requirements affect NCAT review of IPC decisions. Parallel/completed NCAT review restricts IPC review.');
const discrimination='https://ncat.nsw.gov.au/case-types/anti-discrimination/anti-discrimination-complaints.html';
route('discrimination','NSW discrimination complaint → referral → NCAT','NSW Anti-Discrimination Act pathway; Commonwealth discrimination procedures are separate.',[
 step('Anti-Discrimination NSW','Required for this referral route','Lodge a complaint within the agency’s legal coverage.','The agency assesses, investigates and may conciliate the complaint.','Account of events, relevant dates, parties, protected ground and area of public life.','Check complaint acceptance time limits and any discretion.','https://antidiscrimination.nsw.gov.au/need-help/frequently-asked-questions.html'),
 step('NCAT','Referral required','Participate in the referred complaint proceeding.','The complaint must be referred through the statutory Anti-Discrimination NSW process.','Referral letter, President’s Report, response and supporting evidence.','Follow NCAT’s case-conference notice and directions.',discrimination)
 ],'Not every unfair action falls within discrimination law. A declined complaint has its own statutory process; do not treat every complaint as directly fileable in NCAT.');
const centrelink='https://www.servicesaustralia.gov.au/explanations-and-formal-reviews-centrelink-decision?context=64107';
route('centrelink','Centrelink decision → formal review → ART','Review of a Centrelink decision is different from a service complaint.',[
 step('Services Australia Authorised Review Officer','Usually required before ART','Request formal review of the decision.','Identify the particular decision and review rights.','Decision, date received, reasons and supporting documents.','Check the decision-specific time limit and effects on back payment.',centrelink),
 step('Administrative Review Tribunal','Conditional','Apply to review the ARO decision.','ART usually requires an ARO review first; the particular decision must be reviewable.','ARO decision, original decision and supporting evidence.','Check the applicable ART deadline on the decision and source.',centrelink)
 ],'An informal explanation or general complaint is not the same as an ARO review. Some decisions have different review rules.');
const ndis='https://www.ndis.gov.au/participants/changing-your-plan/decision-reviews/how-request-review-decision';
route('ndis','NDIA decision → internal review → ART','Reviewable NDIA decisions affecting participants or applicants.',[
 step('NDIA','Required for ordinary external-review route','Request internal review of a reviewable decision.','Identify the decision and why it should change.','Decision, date received, reasons and disability/support evidence.','Request within 3 months of receiving the decision.',ndis),
 step('Administrative Review Tribunal','Conditional','Apply for external review if you disagree with the internal-review decision.','An internal-review decision and eligibility to seek review.','Internal-review decision and evidence supporting your position.','Normally 28 days from the day after receiving the written internal-review decision; extension may be available.','https://ourguidelines.ndis.gov.au/home/reviewing-decision/reviewing-our-decisions/when-can-you-ask-external-review')
 ],'Urgent or delayed decisions and extensions need their own assessment. A service complaint is not a substitute for decision review.');
const dismissal='https://www.fwc.gov.au/job-loss-or-dismissal/unfair-dismissal/apply';
route('unfair-dismissal','Unfair dismissal: identify system → apply → Commission process','National-system FWC route. NSW state-system employment may instead fall within the NSW IRC.',[
 step('Fair Work Commission','Direct application if eligible','Check coverage, minimum employment period and other eligibility, then lodge.','Dismissal must have taken effect and unfair-dismissal eligibility must be met.','Dismissal date, employment details, dismissal letter and reasons.','Within 21 days after dismissal takes effect; extensions only in exceptional circumstances.',dismissal),
 step('Fair Work Commission','Following a valid application','Follow conciliation and hearing directions.','An application has commenced the legal process.','Application, employer response, notices and relevant evidence.','Use the case notices; an employer/FWO complaint does not replace timely filing.','https://www.fwc.gov.au/job-loss-or-dismissal/unfair-dismissal/process-unfair-dismissal-claims')
 ],'Do not wait for a general complaint process to finish before protecting a filing deadline. Check NSW IRC eligibility separately: https://irc.nsw.gov.au/claims-and-applications/unfair-dismissal.html');
const afca='https://www.afca.org.au/make-a-complaint';
route('financial','Financial firm → AFCA','AFCA’s membership, subject-matter and time-limit rules determine coverage.',[
 step('Financial firm','Usually first step','Raise the complaint with the firm and state the outcome sought.','Normally give the firm an opportunity to resolve it.','Complaint, delivery date, account/product records and response.','Check product-specific response and AFCA filing limits.',afca),
 step('AFCA','Conditional','Bring an unresolved complaint to AFCA.','AFCA checks member-firm and complaint coverage; it may refer information to the firm to resolve first.','Firm details, complaint, response, relevant documents and requested outcome.','Check current AFCA rules, including urgent circumstances and limits.',afca)
 ],'Contact AFCA about urgent circumstances or difficulty using the firm’s process; do not invent a universal waiting period.');
const hccc='https://www.hccc.nsw.gov.au/understanding-complaints/make-a-complaint-online';
route('health-complaint','Health care complaint → HCCC','Complaint about a NSW health service or practitioner within HCCC coverage.',[
 step('HCCC','Direct complaint available','Submit a complaint or contact HCCC for assistance.','Identify the provider and concern; a provider complaint is not presented here as a universal prerequisite.','Account, relevant dates, provider details and available supporting records.','Read current complaint and consent requirements.',hccc)
 ],'Treatment orders, compensation claims and professional disciplinary proceedings follow different jurisdictions. HCCC assessment does not itself give a complainant a general right to bring disciplinary proceedings in NCAT.');
const ombo='https://www.ombo.nsw.gov.au/complaints/how-to-make-a-complaint';
route('ombudsman','NSW agency/service complaint → NSW Ombudsman','For an agency, council or funded service within the Ombudsman’s oversight.',[
 step('Organisation concerned','Normally first','Explain concerns through the organisation’s complaint process.','Before escalation, normally give the organisation an opportunity to respond.','Complaint, correspondence, dates, response and outcome sought.','Keep the complaint timeline and any promised response dates.',ombo),
 step('NSW Ombudsman','Conditional','Ask the Ombudsman to consider the unresolved complaint.','The body and issue must fall within oversight; provide earlier communications.','Copies of communication with the agency and its response, or explain obstacles to contacting it.','Check current acceptance requirements; protect any separate review/appeal deadline.',ombo)
 ],'Explain barriers to complaining directly. Ombudsman oversight is not a merits appeal and does not automatically replace statutory review.');
const building='https://ncat.nsw.gov.au/case-types/housing-and-property/home-building.html';
route('building','Home building dispute → complaint investigation → NCAT','NSW residential building jurisdiction; check the current Building Commission NSW/Fair Trading entry point.',[
 step('Building Commission NSW / NSW Fair Trading','Mandatory unless exempt','Refer the building dispute through the applicable investigation/dispute process.','Before NCAT accepts a non-exempt claim.','Investigation/rectification correspondence, contract, insurance, licence and building evidence.','Check the deadline for the particular claim; imminent expiry is among listed exceptions.',building),
 step('NCAT','Conditional','Apply with the proper respondent and orders sought.','Investigation evidence or a specified exemption; claim within jurisdiction and time.','Contract, reports, correct legal entity/service address and investigation evidence.','Depends on the order and Home Building Act; consult the official source.',building)
 ],'Listed exemptions include insurer appeals, contractor debt claims, cross-claims, expiry within 3 months and specified contractor/company circumstances. Check the full official list.');
const tenancy='https://ncat.nsw.gov.au/case-types/housing-and-property/tenancy/tenancy-and-social-housing-orders.html';
route('tenancy','Tenancy: select the order → meet its conditions → NCAT','A repair, bond, termination, compensation or rent order has its own prerequisites.',[
 step('NCAT tenancy orders table','Order-specific requirements','Find the precise order, who can apply, statutory provision, notice and time limit.','Use the requirements for that order; do not import strata mediation rules into tenancy.','Lease, notices, correspondence, rent/bond records or repair evidence relevant to the order.','The orders table gives different periods for different orders.',tenancy),
 step('NCAT','Conditional direct application','Lodge the tenancy application with the order-specific evidence.','Eligible applicant, jurisdiction, required notices and order-specific time limits.','Application, correct respondent and documents proving required earlier steps.','Check the selected order; urgent matters need the applicable urgent procedure.','https://ncat.nsw.gov.au/case-types/housing-and-property/tenancy.html')
 ],'Social-housing allocation/eligibility appeals and landlord–tenant disputes are different pathways. Do not treat all housing issues as NCAT tenancy claims.');
const parenting='https://www.fcfcoa.gov.au/fl/pubs/comp-fdr';
route('parenting','Parenting orders: dispute resolution or exemption → Court','Applications for parenting orders under Commonwealth family law.',[
 step('Family dispute resolution practitioner','Generally mandatory unless exempt','Obtain a valid section 60I certificate or establish a recognised exemption.','Before filing the parenting application unless the Court accepts an exemption.','Certificate or affidavit explaining the exemption, plus required court documents.','Check pre-filing requirements for the actual application.',parenting),
 step('Federal Circuit and Family Court','Conditional','File the parenting application with certificate or exemption request.','Meet applicable pre-action and filing requirements.','Application, required affidavits/notices and certificate or exemption material.','Urgent matters and risk situations have specific procedures.',parenting)
 ],'Family violence, child abuse, urgency and other statutory grounds may support exemption. Do not require unsafe mediation. Divorce and property applications have different prerequisites.');
const criminal='https://www.legalaid.nsw.gov.au/my-problem-is-about/a-criminal-charge/after-court/appeals';
route('criminal-appeal','Local Court criminal decision → District Court appeal','Conviction/sentence appeal route, not a police conduct complaint.',[
 step('Local Court registry → District Court','Existing decision required; leave in specified cases','Lodge a Notice of Appeal identifying the decision and grounds.','A relevant Local Court decision; conviction appeals after a guilty plea require leave.','Orders, decision date, grounds and application for leave where required.','Normally 28 days; up to 3 months with District Court leave.',criminal)
 ],'Advice should address harsher-penalty/cost risks. This deadline is not a rule for every court or every kind of appeal.');
const appeal='https://ncat.nsw.gov.au/how-ncat-works/appeal-an-ncat-decision.html';
route('ncat-appeal','After NCAT: check appeal rights → leave if needed → correct forum','Only an appealable decision can go to the Internal Appeal Panel; some matters have a different appeal route.',[
 step('NCAT Internal Appeal Panel','Conditional; leave may be required','Check appealability, grounds, leave requirements and the applicable deadline before lodging.','An appealable NCAT decision; merits grounds generally need leave.','Decision, reasons, notification dates, grounds and requested orders.','General rule 28 days; residential proceedings generally 14 days. Other enabling-law periods may apply.','https://ncat.nsw.gov.au/documents/guidelines/ncat_guideline_internal_appeals.pdf'),
 step('NSW Supreme Court','Only if a right or review jurisdiction exists','Identify the actual statutory appeal or judicial-review basis.','No second internal NCAT appeal from an Appeal Panel decision; Court access depends on jurisdiction, grounds, leave and time.','Decision, reasons, grounds and documents required by the applicable Court process.','Check the Court rules and enabling law; do not reuse an NCAT deadline.',appeal)
 ],'An appeal does not automatically stay an order. A stay, set-aside, variation, enforcement and judicial review are distinct procedures.');
for(const g of groups){const [lawIds,bodyIds]=mapping[g.id]||[[],[]];g.lawIds=lawIds;g.institutionIds=[...new Set(['legal-aid',...bodyIds])];}
const situations=index.situations.map((s,i)=>({...s,id:'NSW-'+String(i+1).padStart(4,'0'),kind:'Legal Aid NSW guide',pathwayIds:[],lawIds:[]}));
for(const s of situations){const p=s.path.toLowerCase();if(p.includes('strata'))s.pathwayIds.push('strata');if(p.includes('unfair-dismissal'))s.pathwayIds.push('unfair-dismissal');if(s.group==='discrimination')s.pathwayIds.push('discrimination');if(p.includes('national-disability-insurance'))s.pathwayIds.push('ndis');if(p.includes('centrelink'))s.pathwayIds.push('centrelink');if(p.includes('/tenancy'))s.pathwayIds.push('tenancy');if(p.includes('home-building'))s.pathwayIds.push('building');if(p.includes('/parenting'))s.pathwayIds.push('parenting');if(s.group==='a-criminal-charge'&&p.includes('/after-court/appeal'))s.pathwayIds.push('criminal-appeal');if(/insurance|mortgage|banking|credit-card|credit-report|financial-hardship/.test(p))s.pathwayIds.push('financial');if(/appeal-to-the-appeal-panel|appeal-panel-in/.test(p))s.pathwayIds.push('ncat-appeal');}
// Preserve the official source's topic labels. Add NCAT's actual case-type links
// to cover specialist legal fields beyond Legal Aid's self-help guide tree.
groups.push({id:'specialist-nsw',title:'Specialist NSW law, rights and regulation',source:index.legislationSource,lawIds:[],institutionIds:['legal-aid','ncat']});
const specialist=JSON.parse(await readFile('sources/public/nsw-specialist-index.json','utf8')).entries;
for(const {title,url}of specialist){const u=new URL(url);let routes=[];if(/strata/.test(u.pathname))routes=['strata'];else if(/home-building/.test(u.pathname))routes=['building'];else if(/tenancy/.test(u.pathname))routes=['tenancy'];else if(/privacy/.test(u.pathname))routes=['privacy'];else if(/access.*information/.test(u.pathname))routes=['gipa'];else if(/anti-discrimination/.test(u.pathname))routes=['discrimination'];else if(/reviews-of-other-government/.test(u.pathname))routes=['administrative'];situations.push({id:'NCAT-'+situations.length,title,url:u.href,path:u.pathname,group:'specialist-nsw',kind:'NCAT case-type guide',pathwayIds:routes,lawIds:[]});}
for(const [id,title,url,routeIds,bodyIds,lawIds]of[
 ['privacy','Privacy breach by a NSW public sector agency',privacy,['privacy'],['ipc','ncat'],['act-1998-133','act-2002-071']],
 ['gipa','Access government records / challenge an information-access decision',gipa,['gipa'],['ipc','ncat'],['act-2009-052']],
 ['health','Complain about a health service or practitioner',hccc,['health-complaint'],['hccc'],['act-1993-105']],
 ['administration','Review a NSW government agency decision',admin,['administrative'],['ncat'],['act-1997-076']],
 ['ombudsman','Escalate an unresolved NSW agency, council or funded-service complaint',ombo,['ombudsman'],['nsw-ombudsman'],['act-1974-068']],
 ['repairs','Rental repairs, bond, termination or compensation orders',tenancy,['tenancy'],['ncat'],['act-2010-042']],
 ['appeals','Appeal or seek review after an NCAT decision',appeal,['ncat-appeal'],['ncat','supreme-court'],['act-2013-002']],
 ['ndis','Challenge an NDIA decision about access or supports',ndis,['ndis'],['art'],[]]
])situations.push({id:'ROUTE-'+id,title,url,path:new URL(url).pathname,group:'specialist-nsw',kind:'Official pathway guide',pathwayIds:routeIds,institutionIds:['legal-aid',...bodyIds],lawIds});
const result={format:'claritypath-nsw-catalogue-v1',jurisdiction:'New South Wales, including Commonwealth law applying in NSW',checkedAt:'2026-11-10',attribution:index.attribution,attributionUrl:'https://www.legalaid.nsw.gov.au/about-us/copyright-and-disclaimer',sources:[index.catalogueSource,index.legislationSource],extent:'Official guide titles and links, legislative entry points, institution contacts and the expressly described pathway summaries are included. Full external source texts are opened at their sources. This catalogue is not a certified complete register of all NSW law.',groups,situations,laws:[...new Map(laws.map(l=>[l.id,l])).values()],institutions,pathways,registers:[{title:'NSW legislation: all in-force Acts, regulations and historical versions',url:'https://legislation.nsw.gov.au/'},{title:'Commonwealth legislation register',url:'https://www.legislation.gov.au/'},{title:'NSW judgments and decisions',url:'https://www.caselaw.nsw.gov.au/'},{title:'Federal Court judgments',url:'https://www.fedcourt.gov.au/digital-law-library/judgments'}]};
await writeFile('app/nsw-catalogue.json',JSON.stringify(result,null,2));console.log(JSON.stringify({situations:result.situations.length,groups:groups.length,laws:result.laws.length,pathways:pathways.length}));
