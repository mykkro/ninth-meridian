'use strict';
async function startGame(){
// Rebuild the introduction when an older cached HTML page lacks it.
if(!document.getElementById('splash')){const template=document.createElement('template');template.innerHTML='<section id="splash" aria-labelledby="splash-title">\n<img class="splash-art" src="assets/voyage-cover.png" alt="" fetchpriority="high">\n<div class="splash-copy">\n<label class="splash-language"><span data-i18n="UI language">UI language</span><select id="splash-language"><option value="cs">&#268;e&#353;tina</option><option value="en">English</option></select></label>\n<span class="eyebrow" data-i18n="A journey of words and wonders">A journey of words and wonders</span>\n<h1 id="splash-title" data-i18n="The Ninth Meridian">The Ninth Meridian</h1>\n<p class="splash-hook" data-i18n="A missing cartographer. A broken astrolabe. A secret carried across Europe.">A missing cartographer. A broken astrolabe. A secret carried across Europe.</p>\n<h2 data-i18n="Your story">Your story</h2>\n<p data-i18n="splash-backstory"></p>\n<h2 data-i18n="Your task">Your task</h2>\n<p data-i18n="splash-objective"></p>\n<p class="muted" data-i18n="splash-guidance"></p>\n<button id="begin-voyage" disabled data-i18n="Begin your voyage">Begin your voyage</button>\n</div>\n</section>';document.body.prepend(template.content);}
localizeStaticUI();
const splashLanguage=document.getElementById('splash-language');
if(splashLanguage){splashLanguage.value=uiLanguage;splashLanguage.onchange=event=>{uiLanguage=event.target.value;document.getElementById('ui-language').value=uiLanguage;localizeStaticUI();};}
document.getElementById('ui-language').onchange=event=>{uiLanguage=event.target.value;localizeStaticUI();};
const WORLD=await WorldContent.loadWorld();
const [countryResponse,cityResponse]=await Promise.all([fetch('data/country-context.json'),fetch('data/city-lore.json')]);
if(!countryResponse.ok||!cityResponse.ok)throw Error('Could not load travel lore');
const [countryContext,cityLore]=await Promise.all([countryResponse.json(),cityResponse.json()]);
const game=new DialogueEngine(WORLD);
let voyageMap=null;
const [mapResponse,regionalResponse]=await Promise.all([fetch('assets/world-countries.geojson'),fetch('assets/europe-borders.json')]);
if(!mapResponse.ok||!regionalResponse.ok)throw Error('Could not load world map');
const [mapData,regionalData]=await Promise.all([mapResponse.json(),regionalResponse.json()]);
const $=id=>document.getElementById(id);
let readingBook=null,bookPage=0,lastCodexNode=null,journalView='quests';
const dialogueLog=document.createElement('details');dialogueLog.className='dialogue-log';document.getElementById('conversation').before(dialogueLog);
const reader=document.createElement('dialog');reader.className='book-reader';document.body.append(reader);
const codexSpread=document.createElement('div');codexSpread.className='codex-spread';$('conversation').before(codexSpread);codexSpread.append($('conversation'),$('choices'));
const dialogueModal=el('dialog',undefined,'dialogue-modal');dialogueModal.id='dialogue-modal';document.body.append(dialogueModal);
const dialogueTitle=el('h2');dialogueTitle.id='dialogue-modal-title';dialogueModal.setAttribute('aria-labelledby',dialogueTitle.id);
const dialogueHeader=el('div',undefined,'dialogue-modal-header');
const dialoguePortrait=avatar(game.npcId,'portrait');
const closeDialogue=closeIcon('Close conversation',closeDialogueModal);
dialogueHeader.append(dialoguePortrait,dialogueTitle);dialogueModal.append(closeBar(closeDialogue),dialogueHeader);
const dialogueAnchor=el('div');codexSpread.before(dialogueAnchor);
const dialogueTools=$('cast').closest('.tools'),dialogueNotice=$('notice');
dialogueModal.append(codexSpread,dialogueTools,dialogueLog);
const launchDialogue=button(t('Open conversation'),()=>showDialogue());launchDialogue.id='open-dialogue';dialogueAnchor.append(launchDialogue);
const archiveModal=el('dialog',undefined,'dialogue-modal archive-modal');archiveModal.id='conversation-archive';document.body.append(archiveModal);
function closeIcon(label,fn){const b=el('button','\u00d7','modal-close');b.type='button';b.setAttribute('aria-label',t(label));b.title=t(label);b.onclick=fn;return b;}
function closeBar(b){const bar=el('div',undefined,'modal-close-bar');bar.append(b);return bar;}
const travelModal=el('dialog',undefined,'dialogue-modal travel-modal');travelModal.id='travel-modal';document.body.append(travelModal);
function requestTravel(id,onArrival){if(!game.canTravel(id))throw Error('Follow the quest trail before travelling here.');if(id===game.state.location){if(onArrival)onArrival();return;}if(dialogueModal.open)closeDialogueModal();if(reader.open)reader.close();if(parchment.open)parchment.close();if(archiveModal.open)archiveModal.close();const from=WORLD.locations.find(place=>place.id===game.state.location),to=WORLD.locations.find(place=>place.id===id),title=el('h2',`${t(from.name)} \u2192 ${t(to.name)}`);title.id='travel-modal-title';travelModal.setAttribute('aria-labelledby',title.id);const rows=[closeBar(closeIcon('Close travel window',()=>travelModal.close())),el('span',t('Arrange transport'),'eyebrow'),title,el('p',t('Choose transport to begin your journey.'),'muted'),el('p',`${t('Your purse')}: ${coins(game.state.gold)}`)];for(const quote of game.transportOptions(id)){const option=button('',()=>{game.travel(id,quote.id);showJourney(to,quote,onArrival);},game.state.gold<quote.cost);option.className='transport-option';option.append(el('strong',t(quote.label)),el('span',`${coins(quote.cost)} \u00b7 ${journeyDuration(quote.days)}`));if(quote.ferry)option.append(el('small',t('Ferry transfer included'),'muted'));if(option.disabled)option.append(el('small',t('Not enough coins for this journey.'),'muted'));rows.push(option);}rows.push(el('p',t('Shared currency: 1 gold = 100 silver = 10,000 copper.'),'muted'));travelModal.replaceChildren(...rows);if(!travelModal.open)travelModal.showModal();}
let finishJourney=null;
function scrollToScene(){const scene=document.querySelector('.scene');scene.scrollTop=0;if(!document.querySelector('dialog[open]')){scene.tabIndex=-1;scene.focus({preventScroll:true});}scene.scrollIntoView({block:'start',behavior:'instant'});}
function showJourney(destination,quote,onArrival){const image=el('img',undefined,'journey-symbol');image.src=quote.id==='boat'?'assets/transport/boat.svg':`assets/transport/${quote.id}-painted.png`;image.alt=t(quote.label);const heading=el('h2',t('Travelling...'));heading.id='travel-modal-title';heading.setAttribute('role','status');const arrival=button(t('You arrived at destination'),()=>finishJourney());arrival.className='arrival-button';arrival.hidden=true;let ready=false;
finishJourney=()=>{if(!ready)return;finishJourney=null;travelModal.classList.remove('journey-splash','journey-moving');travelModal.close();if(onArrival)onArrival();scrollToScene();};
travelModal.classList.add('journey-splash','journey-moving');travelModal.replaceChildren(image,heading,el('p',t(destination.name),'journey-destination'),el('p',`${journeyDuration(quote.days)} \u00b7 ${coins(quote.cost)}`,'muted'),arrival);
setTimeout(()=>{if(!finishJourney)return;ready=true;heading.textContent=t('You have arrived');travelModal.classList.remove('journey-moving');arrival.hidden=false;arrival.focus({preventScroll:true});},900);
}
travelModal.addEventListener('cancel',event=>{if(finishJourney){event.preventDefault();finishJourney();}});
const parchment=el('dialog',undefined,'parchment-map');parchment.id='parchment-map';document.body.append(parchment);
function showParchment(){if(dialogueModal.open)closeDialogueModal();if(reader.open)reader.close();if(archiveModal.open)archiveModal.close();const title=el('h2',t(WORLD.items.map.name));title.id='parchment-title';parchment.setAttribute('aria-labelledby',title.id);
const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 900 650');svg.setAttribute('role','img');svg.setAttribute('aria-label',t("The cartographer's trail across Europe"));svg.classList.add('parchment-chart');
function ink(tag,attrs,text){const node=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);if(text)node.textContent=text;svg.append(node);return node;}
const project=([lon,lat])=>[40+(lon+13)/53*820,80+(67-lat)/33*490];
for(const feature of mapData.features){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates:[];for(const polygon of polygons){const ring=polygon[0];if(!ring.some(([lon,lat])=>lon>=-13&&lon<=40&&lat>=34&&lat<=67))continue;ink('path',{d:ring.map((coord,index)=>{const [x,y]=project(coord);return `${index?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ')+'Z',class:'parchment-land'});}}
const trail=WORLD.locations.filter(place=>place.coordinates);ink('polyline',{points:trail.map(place=>project([place.coordinates.lon,place.coordinates.lat]).join(',')).join(' '),class:'parchment-route'});
for(const place of trail){const [x,y]=project([place.coordinates.lon,place.coordinates.lat]);ink('circle',{cx:x,cy:y,r:place.id===game.state.location?6:3.5,class:game.state.visitedLocations.includes(place.id)?'parchment-visited':'parchment-stop'});ink('text',{x:x+7,y:y-6,class:'parchment-label'},t(place.name));}
ink('path',{d:'M775 495L775 555M745 525L805 525M775 490L769 508L781 508Z',class:'parchment-compass'});ink('text',{x:775,y:482,'text-anchor':'middle',class:'parchment-label'},'N');ink('text',{x:40,y:625,class:'parchment-inscription'},'Anno Domini 1453');
parchment.replaceChildren(closeBar(closeIcon('Close map',()=>parchment.close())),title,el('p',t('Follow the witnesses. Restore the astrolabe.'),'parchment-caption'),svg,el('p',t('Marked cities trace your voyage; the larger seal shows your current location.'),'parchment-caption'));if(!parchment.open)parchment.showModal();}
parchment.addEventListener('click',event=>{if(event.target===parchment){const rect=parchment.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)parchment.close();}});
function avatar(id,className=''){const img=el('img',undefined,'avatar '+className);img.src=`assets/avatars/${id}.svg`;img.alt='';img.width=48;img.height=48;return img;}
function showDialogue(){if(reader.open)reader.close();if(archiveModal.open)archiveModal.close();dialogueModal.append(codexSpread,dialogueTools,dialogueLog,dialogueNotice);updateDialogueHeader();if(!dialogueModal.open)dialogueModal.showModal();}
function updateDialogueHeader(){dialoguePortrait.src=`assets/avatars/${game.npcId}.svg`;dialogueTitle.textContent=t(game.npc.name);closeDialogue.setAttribute('aria-label',t('Close conversation'));closeDialogue.title=t('Close conversation');launchDialogue.textContent=t('Open conversation');}
function restoreDialogue(){if(!dialogueModal.open){dialogueAnchor.after(dialogueNotice);launchDialogue.focus();}}
function closeDialogueModal(){dialogueModal.close();restoreDialogue();}
dialogueModal.addEventListener('close',restoreDialogue);
function showArchive(session){if(dialogueModal.open)closeDialogueModal();const title=el('h2',t(WORLD.npcs[session.npcId].name));title.id='archive-title';archiveModal.setAttribute('aria-labelledby',title.id);const header=el('div',undefined,'dialogue-modal-header');header.append(avatar(session.npcId,'portrait'),title);archiveModal.replaceChildren(closeBar(closeIcon('Close conversation',()=>archiveModal.close())),header,...transcriptRows(session));archiveModal.showModal();}
for(const modal of [dialogueModal,archiveModal])modal.addEventListener('click',event=>{if(event.target===modal){const rect=modal.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)modal.close();}});
function el(tag,text,className,language=uiLanguage){const e=document.createElement(tag);if(text!==undefined)e.textContent=typeof text==='string'?cityNames(text,language):text;if(className)e.className=className;return e;}
function action(fn,message){try{const previousLocation=game.state.location;const result=fn();render();$('notice').textContent=message||(typeof result==='string'?result:'');if(game.state.location!==previousLocation)scrollToScene();}catch(e){$('notice').textContent=t(e.message);}}
function button(text,fn,disabled=false){const b=el('button',text);b.disabled=disabled;b.onclick=()=>action(fn);return b;}
function appendNotes(container,notes){for(const note of notes){const n=el('span',`${note.kind==='word'?t('Word hint')+': ':note.kind==='verb'?t('Verb hint')+': ':''}${note.text} [${t(WORLD.languages[note.language])} · ${t(note.via)}]`,'note',note.language);n.lang=note.language;container.append(n);}}
function transcriptRows(session){return session.entries.map(entry=>{const player=entry.speaker==='player',row=el('div',undefined,'transcript-line'+(player?' transcript-player':'')),body=el('div',undefined,'transcript-body'),portrait=avatar(player?'player':entry.speaker);body.append(el('span',player?t('You said'):t(WORLD.npcs[entry.speaker].name),'speaker'));const words=el('p',entry.phrase?WORLD.phrases[entry.phrase][entry.language]:t(entry.text));words.lang=entry.language;words.textContent=cityNames(entry.phrase?WORLD.phrases[entry.phrase][entry.language]:t(entry.text),entry.language);body.append(words);appendNotes(body,entry.notes);row.append(...(player?[body,portrait]:[portrait,body]));return row;});}

function calendarDate(value){return new Intl.DateTimeFormat(uiLanguage==='cs'?'cs-CZ':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value))+' AD';}
function journeyDuration(days){return uiLanguage==='cs'?`${days} ${days===1?'den':days<5?'dny':'dn\u016f'}`:`${days} ${days===1?'day':'days'}`;}
const currentDate=el('time',undefined,'current-date');currentDate.id='current-date';document.querySelector('body>header').append(currentDate);
function renderHistory(){const navigation=el('div',undefined,'journal-tabs');for(const view of ['quests','events','dialogues']){const b=button(t({quests:'Quests',events:'Events',dialogues:'Conversations'}[view]),()=>{journalView=view;});b.setAttribute('aria-pressed',String(journalView===view));navigation.append(b);}if(journalView==='quests'){$('journal').prepend(navigation);return;}const rows=[navigation];if(journalView==='events'){for(const event of [...game.state.history].reverse()){const row=el('div',undefined,'journal-event');if(event.date){const date=new Date(event.date);if(!Number.isNaN(date.getTime())){const stamp=el('time',calendarDate(event.date),'event-date');stamp.dateTime=event.date;row.append(stamp);}}if(event.transport)row.append(el('p',`${t(event.transport)} \u00b7 ${coins(event.cost)}`,'muted'));if(event.days)row.append(el('span',journeyDuration(event.days),'muted'));const place=WORLD.locations.find(l=>l.id===event.location);row.append(el('span',t(place.name),'eyebrow'),el('p',t(event.label)));if(event.from)row.append(el('p',`${t(WORLD.locations.find(l=>l.id===event.from).name)} \u2192 ${t(place.name)}`,'muted'));if(event.item)row.append(el('p',`${t(WORLD.items[event.item].name)}${event.count?' \u00d7'+event.count:''}`,'muted'));if(event.companion)row.append(el('p',WORLD.companions[event.companion].name,'muted'));if(event.gold)row.append(el('p',coins(event.gold),'muted'));for(const item of event.items||[])row.append(el('p',`${t(WORLD.items[item.item].name)} \u00d7${item.count}`,'muted'));if(event.milestone){const quest=Object.values(WORLD.quests).find(q=>q.completion===event.milestone||q.started===event.milestone);const step=Object.values(WORLD.quests).flatMap(q=>q.steps||[]).find(step=>step.milestone===event.milestone);const location=WORLD.locations.find(l=>(l.milestone||l.id)===event.milestone);row.append(el('p',t(quest?.title||step?.label||location?.name||'Progress recorded'),'muted'));}rows.push(row);}}else{for(const session of [...game.state.conversations].reverse()){const details=el('details',undefined,'journal-conversation');details.append(el('summary',`${t(WORLD.npcs[session.npcId].name)} \u00b7 ${t(WORLD.locations.find(l=>l.id===session.location).name)} \u00b7 ${session.entries.length}`),button(t('Open conversation'),()=>showArchive(session)),...transcriptRows(session));rows.push(details);}}$('journal').replaceChildren(...rows);}
function requirementsText(requirements){return game.missingRequirements(requirements).map(entry=>{if(entry.type==='item')return t(WORLD.items[entry.id].name)+(entry.count?` ×${entry.count}`:'');const investigation=Object.values(WORLD.quests).find(q=>q.kind==='investigation'&&q.completion===entry.id);if(investigation)return t(investigation.title);const lead=Object.values(WORLD.quests).filter(q=>q.kind==='investigation').flatMap(q=>q.steps).find(step=>step.milestone===entry.id);if(lead)return t(lead.label);if(entry.id==='latin_deciphered')return t('Decipher both Latin pages');const location=WORLD.locations.find(l=>(l.milestone||l.id)===entry.id);return location?`${t('Complete')}: ${t(location.name)}`:t('Accept the errand');}).join(', ');}
function render(){
 localizeStaticUI();
 updateDialogueHeader();
 currentDate.dateTime=game.currentDate;currentDate.textContent=calendarDate(game.currentDate);
 codexSpread.classList.toggle('open-codex',game.npcId==='latinCodex');
 if(game.npcId==='latinCodex'&&lastCodexNode!==game.nodeId){codexSpread.classList.remove('turn-forward');void codexSpread.offsetWidth;codexSpread.classList.add('turn-forward');lastCodexNode=game.nodeId;}else if(game.npcId!=='latinCodex'){lastCodexNode=null;codexSpread.classList.remove('turn-forward');}
 if(reader.open)renderBook();
 if(!voyageMap)voyageMap=new VoyageMapTools.VoyageMap($('world-map'),mapData,WORLD,game,id=>action(()=>requestTravel(id)),t,requirementsText,regionalData);else voyageMap.render();
 game.rememberTranslations();
 dialogueLog.replaceChildren(el('summary',t('Dialogue log')), ...transcriptRows(game.conversation));
 const s=game.state,place=WORLD.locations.find(l=>l.id===s.location);
 $('locations').replaceChildren(...WORLD.locations.map(l=>{const b=button(`${t(l.name)} · ${t(l.country)}`,()=>requestTravel(l.id),!game.canTravel(l.id));if(!game.canTravel(l.id))b.append(el('span',`${t('Missing')}: ${requirementsText(l.requires)}`,'unknown'));if(l.id!==s.location){const quote=game.transportOptions(l.id)[0];b.append(el('span',`${journeyDuration(quote.days)} \u00b7 ${coins(quote.cost)}`,'travel-duration'));}if(l.id===s.location)b.classList.add('active');return b;}));
 $('player').textContent=`${coins(s.gold)} · ${t('Native language')}: ${t(WORLD.languages[s.native])}`;$('easy').checked=s.easy;
 const difficulty=document.getElementById('difficulty');if(difficulty){difficulty.value=s.easy?'easy':'hard';$('difficulty-help').textContent=t(s.easy?'Learned phrasebook hints appear in conversations.':'Recall phrasebook meanings yourself. Interpreters and translation scrolls still help.');}
 const languagePanel=el('div',undefined,'knowledge-panel');for(const language of Object.keys(s.knowledge)){const score=game.knowledge(language);const label=score>=60?'Confident':score>=30?'Learning':'New language';languagePanel.append(el('div',`${t(WORLD.languages[language])}: ${score}/100 (${t(label)})`));}languagePanel.append(el('p',t('Read phrasebooks and practise with locals to recognise sensible replies.'),'muted'));$('player').append(languagePanel);
 $('scene-heading').replaceChildren(el('span',`${t(place.country)} / ${t(WORLD.languages[place.language])}`,'eyebrow'),el('h3',t(place.name)),el('p',t(place.description),'muted'));
 const lore=cityLore[place.id];
 if(lore){const passage=el('section',undefined,'city-lore');passage.append(el('h4',uiLanguage==='cs'?'Z městských kronik':'From the city chronicles'),el('p',lore[uiLanguage==='cs'?'cs':'en']));$('scene-heading').append(passage);}
 const context=countryContext[place.country];
 if(context){const card=el('section',undefined,'country-context');card.setAttribute('aria-label',uiLanguage==='cs'?'Zprávy ze země':'Country brief');card.append(el('span',uiLanguage==='cs'?'Zprávy ze země · smyšlená renesance':'Country brief · fictional Renaissance','eyebrow'),el('h3',t(place.country)),el('p',context[uiLanguage==='cs'?'cs':'en']));$('scene-heading').prepend(card);}
 const gathering=game.gatheringActions();$('exploration').hidden=!gathering.length;
 const exploration=[el('h2',t('Explore nearby')),el('p',t('Gathering simulation: collect materials, then return to the quest giver.'),'muted')];
 for(const source of gathering){const remaining=source.limit-(s.gathered[source.id]||0);const row=el('div',undefined,'item');row.append(button(`${t(source.label)} · ${t('Remaining')}: ${remaining}`,()=>{const gathered=game.gather(source.id);return `${t('Gathered')}: ${t(WORLD.items[gathered.item].name)} ×${gathered.count}`;},!game.canGather(source.id)));if(!game.meets(source.requires))row.append(el('span',requirementsText(source.requires),'unknown'));else if(remaining<source.count)row.append(el('span',t('Source exhausted for this voyage'),'unknown'));exploration.push(row);}$('exploration').replaceChildren(...exploration);
 $('npcs').replaceChildren(...game.npcsHere().map(id=>{const b=button(t(WORLD.npcs[id].name),()=>{game.open(id);showDialogue();},!game.meets(WORLD.npcs[id].requires));b.prepend(avatar(id));if(id===game.npcId)b.classList.add('active');return b;}));
 const line=el('div',undefined,'line');line.append(avatar(game.npcId),el('span',`${t(game.npc.name)} · ${t(WORLD.languages[game.language])}`,'speaker'));const words=el('p',game.phrase[game.language]);words.lang=game.language;words.textContent=cityNames(game.phrase[game.language],game.language);line.append(words);
 for(const note of game.notes()){const n=el('span',`${note.kind==='word'?t('Word hint')+': ':note.kind==='verb'?t('Verb hint')+': ':''}${note.text} [${t(WORLD.languages[note.language])} · ${t(note.via)}]`,'note',note.language);n.lang=note.language;line.append(n);}if(!game.notes().length&&game.language!==s.native)line.append(el('span',t('No translation notes. Read a phrasebook, use a scroll, or recruit an interpreter.'),'muted'));
 const pastEntries=game.state.conversations.filter(session=>session.npcId===game.npcId).flatMap(session=>session.entries).filter(entry=>game.currentLineRepeated||entry!==game.currentLogLine);
 const history=el('div',undefined,'conversation-past');history.setAttribute('aria-label',t('Dialogue log'));history.append(...transcriptRows({entries:pastEntries}));
 history.dataset.count=String(pastEntries.length);history.hidden=!pastEntries.length;
 line.hidden=!!game.currentLineRepeated;
 $('conversation').replaceChildren(history,line);


 const choices=game.ended?[el('p',t(game.node.outcome==='dismissed'?'The NPC dismissed you. Replay the conversation to try a different response.':'Conversation recorded. Replay it or continue your voyage.'),'muted')]:game.visibleChoices().map(({choice:c,index:i})=>{
   const b=button('',()=>{game.choose(i);if(game.ended&&(c.closesConversation||game.conversation.closedByChoice))closeDialogueModal();},!game.available(c));
   if(c.phrase){const responseLanguage=c.language||game.language;const words=el('span',WORLD.phrases[c.phrase][responseLanguage],'response-text');words.lang=responseLanguage;words.textContent=cityNames(WORLD.phrases[c.phrase][responseLanguage],responseLanguage);b.append(words);const notes=game.notes(c.phrase,responseLanguage);appendNotes(b,notes);if(responseLanguage!==s.native&&!notes.some(note=>note.kind==='phrase'))b.append(el('span',t(notes.length?'Meaning partially known':'Meaning unknown'),'unknown'));}
   else b.textContent=t(c.text);
   if(!game.available(c))b.append(el('span',requirementsText(c.requires)?`${t('Missing')}: ${requirementsText(c.requires)}`:t('Reward already collected'),'unknown'));
   return b;
 });
 if(game.ended&&!game.conversation.closedByChoice){const response=game.farewellResponse||{phrase:'farewell',language:game.language,text:WORLD.phrases.farewell[game.language],notes:game.notes('farewell',game.language)};const farewell=button('',()=>{game.recordReply({phrase:response.phrase,language:response.language});closeDialogueModal();});farewell.className='dialogue-goodbye';farewell.lang=response.language;const words=el('span',response.text,'response-text',response.language);words.lang=response.language;farewell.append(words);const notes=response.notes;appendNotes(farewell,notes);if(game.language!==s.native&&!notes.some(note=>note.kind==='phrase'))farewell.append(el('span',t(notes.length?'Meaning partially known':'Meaning unknown'),'unknown'));choices.push(farewell);}
 if(game.node.shop&&!game.ended)for(const id of game.npc.stock){const item=WORLD.items[id];const label=buyLabel(item.name,item.price)+(item.purchaseQuantity>1?` · ${t('Bundle')}: ${item.purchaseQuantity}`:'');const buy=button(label,()=>game.buy(id),!game.canBuy(id));buy.title=t(item.description||item.name);choices.push(buy);}
 $('choices').replaceChildren(...choices);
 const companionRows=[];
 if(game.companionId){
  const companion=WORLD.companions[game.companionId];const card=el('div',undefined,'companion-card');
  card.append(avatar(game.companionId),el('h3',companion.name),el('p',t(companion.description),'muted'));
  card.append(el('p',`${t('Interprets')}: ${companion.knows.filter(language=>!companion.outputs.includes(language)).map(language=>t(WORLD.languages[language])).join(', ')} \u2192 ${companion.outputs.map(language=>t(WORLD.languages[language])).join(', ')}`,'muted'));
  card.append(button(t('Talk to companion'),()=>{game.talkCompanion();showDialogue();}),button(t('Dismiss companion'),()=>game.dismissCompanion()));companionRows.push(card);
 }else companionRows.push(el('p',t('Travelling alone. You may recruit one companion.'),'muted'));
 $('companion').replaceChildren(...companionRows);
 const departure=s.companionNotice,departureRows=[];
 if(departure){
  const card=el('div',undefined,'companion-notice');const waitingPlace=WORLD.locations.find(location=>location.id===departure.location);
  card.append(el('p',`${WORLD.companions[departure.id].name} \u00b7 ${t('Waiting in')}: ${t(waitingPlace.name)}`,'speaker'));
  const words=el('p',WORLD.phrases[departure.phrase][departure.language]);words.lang=departure.language;words.textContent=cityNames(WORLD.phrases[departure.phrase][departure.language],departure.language);card.append(words);
  appendNotes(card,departure.notes.filter(note=>s.easy||!Object.values(WORLD.items).some(item=>item.type==='dictionary'&&item.name===note.via)));
  card.append(button(t('Close message'),()=>{s.companionNotice=null;}));departureRows.push(card);
 }
 $('companion-notice').replaceChildren(...departureRows);
 const waiting=s.metCompanions.filter(id=>id!==game.companionId).map(id=>{
  const row=el('div',undefined,'item'),locationId=game.companionLocation(id),location=WORLD.locations.find(location=>location.id===locationId);
  row.append(el('p',`${WORLD.companions[id].name} \u00b7 ${t('Waiting in')}: ${t(location.name)}`));
  row.append(button(t(locationId===s.location?'Talk':'Visit companion'),()=>requestTravel(locationId,()=>{game.open(id);showDialogue();}),!game.canTravel(locationId)));return row;
 });
 if(!waiting.length)waiting.push(el('p',t('Meet local travellers to find an interpreter.'),'muted'));
 $('known-companions').replaceChildren(...waiting);
 const inventory=[];for(const [id,count]of Object.entries(s.inventory)){if(!count)continue;const item=WORLD.items[id],row=el('div',undefined,'item');row.append(el('div',`${t(item.name)}${count>1?` ×${count}`:''}`));if(item.type==='dictionary'){row.append(el('div',`${t(WORLD.languages[item.from])} → ${t(WORLD.languages[item.to])} · ${entryCount(game.dictionaryEntries(item).length)}`,'muted'));row.append(button(t(s.learned.includes(id)?'Read again':'Read phrasebook'),()=>{game.read(id);showBook(id);}));}if(id==='map')row.append(button(t('Unroll map'),showParchment));if(item.type==='book')row.append(button(t('Read book'),()=>{game.read(id);showDialogue();}));inventory.push(row);}$('inventory').replaceChildren(...inventory);
 const journal=[el('p',t(WORLD.quest.description))];for(const l of WORLD.locations)journal.push(el('p',`${s.milestones.includes(l.milestone||l.id)?'✓':'○'} ${t(l.name)}: ${t(s.milestones.includes(l.milestone||l.id)?'clue recorded':'find the witness')}`));if(s.milestones.includes('novgorod')&&!s.milestones.includes('greece'))journal.push(el('p',t('Prologue complete. The observatory trail continues in future chapters.'),'note'));
 for(const branch of WORLD.quest.branches||[]){journal.push(el('h2',t(branch.title)),el('p',branch.locations.map(id=>t(WORLD.locations.find(l=>l.id===id).name)).join(' → ')),el('p',`${s.inventory[branch.item]?'✓':'○'} ${t(WORLD.items[branch.item].name)}`));}
 if(s.milestones.includes('greece')&&!s.milestones.includes('ireland'))journal.push(el('p',t('The astrolabe is restored. Continue through Norway, Sweden and Finland to Ireland. Hungary is optional.'),'note'));
 if(s.milestones.includes('ireland'))journal.push(el('p',t('Ireland reached. The library of languages is open. Voyage complete.'),'note'));
 if(s.inventory.codex&&!s.milestones.includes('latin_deciphered')){journal.push(el('p',t('To claim the sun disc: read the Latin glossary, then decipher both codex pages.'),'note'),button(t('Read book'),()=>{game.read('codex');showDialogue();}));}
 journal.push(el('h2',t('Country investigations')));
 for(const quest of Object.values(WORLD.quests).filter(q=>q.kind==='investigation')){
  if(!s.milestones.includes(quest.started))continue;
  const done=s.milestones.includes(quest.completion),row=el('div',undefined,'item');
  row.append(el('p',`${done?'✓':'◐'} ${t(quest.title)}`),el('p',t(quest.description),'muted'));
  for(const step of quest.steps){
   const complete=s.milestones.includes(step.milestone);
   row.append(el('p',`${complete?'✓':'○'} ${t(step.label)}`));
   if(!complete&&!done)row.append(button(`${t('Follow lead')}: ${t(WORLD.npcs[step.giver].name)}`,()=>requestTravel(step.location,()=>{game.open(step.giver);showDialogue();}),!game.canTravel(step.location)));
  }
  if(!done)row.append(button(`${t('Return with both findings')}: ${t(WORLD.locations.find(l=>l.id===quest.location).name)}`,()=>requestTravel(quest.location,()=>{game.open(quest.giver);showDialogue();}),!game.canTravel(quest.location)));
  journal.push(row);
 }
 journal.push(el('h2',t('Optional errands')));for(const [id,quest]of Object.entries(WORLD.quests||{})){if(!quest.completion||quest.kind==='investigation')continue;const done=s.milestones.includes(quest.completion);const started=s.milestones.includes(id+'_started');const row=el('div',undefined,'item');row.append(el('p',`${done?'✓':started?'◐':'○'} ${t(quest.title)}`),el('p',`${t('Fetch')}: ${t(WORLD.items[quest.fetchItem].name)} · ${done?t('Delivered'):`${s.inventory[quest.fetchItem]||0}/${quest.fetchCount||1}`} · ${coins(quest.reward.gold)} + ${t(WORLD.items[quest.reward.item].name)}`,'muted'));if(started&&!done&&quest.giver&&quest.location)row.append(button(t('Return to quest giver'),()=>requestTravel(quest.location,()=>{game.open(quest.giver);showDialogue();}),!game.canTravel(quest.location)));journal.push(row);}
 journal.push(el('h2',t('Heard rumors')),el('p',t('Rumors are unverified. Compare them with witnesses and evidence.'),'muted'));
 if(!s.rumors.length)journal.push(el('p',t('Ask locals what people are talking about.'),'muted'));
 for(const rumor of s.rumors){const entry=el('div',undefined,'item');entry.append(el('span',`${t(WORLD.npcs[rumor.npcId].name)} · ${t(WORLD.languages[rumor.language])}`,'speaker'));const words=el('p',WORLD.phrases[rumor.phrase][rumor.language]);words.lang=rumor.language;words.textContent=cityNames(WORLD.phrases[rumor.phrase][rumor.language],rumor.language);entry.append(words);appendNotes(entry,game.rumorNotes(rumor));journal.push(entry);}
 $('journal').replaceChildren(...journal);renderHistory();
 $('scroll').replaceChildren(...Object.entries(s.inventory).filter(([id,n])=>n>0&&WORLD.items[id].type==='scroll').map(([id,n])=>{const o=el('option',`${t(WORLD.items[id].name)} (${n})`);o.value=id;return o;}));$('cast').disabled=!$('scroll').options.length||!!game.scrollNote;$('notice').textContent='';
}
function bookLabel(en,cs){return uiLanguage==='cs'?cs:en;}
function renderBook(){
 const book=WORLD.items[readingBook],entries=game.dictionaryEntries(book),spreads=Math.max(1,Math.ceil(entries.length/8));
 bookPage=Math.min(bookPage,spreads-1);
 const heading=el('h2',t(book.name));heading.id='reading-book-title';reader.setAttribute('aria-labelledby',heading.id);
 const spread=el('div',undefined,'book-spread');
 for(let side=0;side<2;side++){
  const page=el('section',undefined,'book-page');page.append(el('div',`${t(WORLD.languages[book.from])} → ${t(WORLD.languages[book.to])}`,'book-running-title'));
  const pageEntries=entries.slice(bookPage*8+side*4,bookPage*8+side*4+4);
  for(const entry of pageEntries){const row=el('div',undefined,'book-entry');const source=el('p',entry.type==='phrase'?WORLD.phrases[entry.phrase][book.from]:entry.source,'book-source');source.lang=book.from;source.textContent=cityNames(entry.type==='phrase'?WORLD.phrases[entry.phrase][book.from]:entry.source,book.from);const meaning=el('p',entry.type==='phrase'?WORLD.phrases[entry.phrase][book.to]:entry.translation,'book-meaning');meaning.lang=book.to;meaning.textContent=cityNames(entry.type==='phrase'?WORLD.phrases[entry.phrase][book.to]:entry.translation,book.to);row.append(source,meaning);if(entry.forms?.length)row.append(el('p',entry.forms.join(' · '),'book-forms'));page.append(row);}
  if(!pageEntries.length)page.append(el('p',entries.length?bookLabel('Finis','Konec'):t('This empty sample pocketbook has no quest phrases yet.'),'book-end'));
  page.append(el('span',String(bookPage*2+side+1),'book-page-number'));spread.append(page);
 }
 const controls=el('div',undefined,'book-controls');
 function turn(delta){bookPage+=delta;renderBook();const fresh=reader.querySelector('.book-spread');fresh.classList.add(delta>0?'turn-forward':'turn-back');reader.querySelector(delta>0?'[data-turn="next"]':'[data-turn="previous"]').focus();}
 const previous=button(bookLabel('← Previous pages','← Předchozí stránky'),()=>turn(-1),bookPage===0);previous.dataset.turn='previous';
 const next=button(bookLabel('Turn pages →','Otočit stránky →'),()=>turn(1),bookPage===spreads-1);next.dataset.turn='next';
 previous.onclick=()=>turn(-1);next.onclick=()=>turn(1);
 controls.append(previous,el('span',`${bookPage+1} / ${spreads}`),next,button(bookLabel('Close book','Zavřít knihu'),()=>reader.close()));
 reader.replaceChildren(closeBar(closeIcon('Close book',()=>reader.close())),heading,spread,controls);
}
function showBook(id){if(dialogueModal.open)closeDialogueModal();readingBook=id;bookPage=0;renderBook();if(!reader.open)reader.showModal();}
reader.addEventListener('click',event=>{if(event.target===reader){const bounds=reader.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)reader.close();}});
 $('ui-language').onchange=()=>{const selectedScroll=$('scroll').value;uiLanguage=$('ui-language').value;render();$('scroll').value=selectedScroll;};
 const difficultySelect=document.getElementById('difficulty');if(difficultySelect)difficultySelect.onchange=()=>action(()=>{game.state.easy=difficultySelect.value==='easy';});
 $('easy').onchange=()=>action(()=>{game.state.easy=$('easy').checked;});$('cast').onclick=()=>action(()=>game.cast($('scroll').value));$('replay').onclick=()=>action(()=>{game.companionConversation?game.talkCompanion():game.open(game.npcId,true,true);showDialogue();});$('reset').onclick=()=>action(()=>{game.reset();showSplash();});render();
function showSplash(){if(dialogueModal.open)closeDialogueModal();if(reader.open)reader.close();if(archiveModal.open)archiveModal.close();if(parchment.open)parchment.close();if(travelModal.open)travelModal.close();document.body.classList.add('at-splash');$('splash').hidden=false;for(const panel of document.querySelectorAll('body>header,body>main,body>footer'))panel.hidden=true;document.querySelector('main').setAttribute('inert','');$('splash-language').value=uiLanguage;$('begin-voyage').focus();}
if($('begin-voyage')){$('begin-voyage').disabled=false;
$('begin-voyage').onclick=()=>{document.body.classList.remove('at-splash');$('splash').hidden=true;for(const panel of document.querySelectorAll('body>header,body>main,body>footer'))panel.hidden=false;document.querySelector('main').removeAttribute('inert');launchDialogue.focus({preventScroll:true});window.scrollTo({top:0,left:0,behavior:'instant'});};}
$('load-status').hidden=true;
showSplash();
}
startGame().catch(error=>{
 const status=document.getElementById('load-status');
 status.textContent=location.protocol==='file:'
  ?'Spusť lokální server: python -m http.server 8000, pak otevři http://localhost:8000. / Start a local server: python -m http.server 8000, then open http://localhost:8000.'
  :`Výpravu se nepodařilo načíst / Could not load voyage: ${error.message}`;
});
