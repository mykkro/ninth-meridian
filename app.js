'use strict';
async function startGame(){
localizeStaticUI();
document.getElementById('ui-language').onchange=event=>{uiLanguage=event.target.value;localizeStaticUI();};
const WORLD=await WorldContent.loadWorld();
const game=new DialogueEngine(WORLD);
let voyageMap=null;
const [mapResponse,regionalResponse]=await Promise.all([fetch('assets/world-countries.geojson'),fetch('assets/europe-borders.json')]);
if(!mapResponse.ok||!regionalResponse.ok)throw Error('Could not load world map');
const [mapData,regionalData]=await Promise.all([mapResponse.json(),regionalResponse.json()]);
const $=id=>document.getElementById(id);
function el(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
function action(fn,message){try{const result=fn();render();$('notice').textContent=message||(typeof result==='string'?result:'');}catch(e){$('notice').textContent=t(e.message);}}
function button(text,fn,disabled=false){const b=el('button',text);b.disabled=disabled;b.onclick=()=>action(fn);return b;}
function appendNotes(container,notes){for(const note of notes){const n=el('span',`${note.kind==='word'?t('Word hint')+': ':note.kind==='verb'?t('Verb hint')+': ':''}${note.text} [${t(WORLD.languages[note.language])} · ${t(note.via)}]`,'note');n.lang=note.language;container.append(n);}}
function requirementsText(requirements){return game.missingRequirements(requirements).map(entry=>{if(entry.type==='item')return t(WORLD.items[entry.id].name)+(entry.count?` ×${entry.count}`:'');const investigation=Object.values(WORLD.quests).find(q=>q.kind==='investigation'&&q.completion===entry.id);if(investigation)return t(investigation.title);const lead=Object.values(WORLD.quests).filter(q=>q.kind==='investigation').flatMap(q=>q.steps).find(step=>step.milestone===entry.id);if(lead)return t(lead.label);if(entry.id==='latin_deciphered')return t('Decipher both Latin pages');const location=WORLD.locations.find(l=>(l.milestone||l.id)===entry.id);return location?`${t('Complete')}: ${t(location.name)}`:t('Accept the errand');}).join(', ');}
function render(){
 localizeStaticUI();
 if(!voyageMap)voyageMap=new VoyageMapTools.VoyageMap($('world-map'),mapData,WORLD,game,id=>action(()=>game.travel(id)),t,requirementsText,regionalData);else voyageMap.render();
 const s=game.state,place=WORLD.locations.find(l=>l.id===s.location);
 $('locations').replaceChildren(...WORLD.locations.map(l=>{const b=button(`${t(l.name)} · ${t(l.country)}`,()=>game.travel(l.id),!game.canTravel(l.id));if(!game.canTravel(l.id))b.append(el('span',`${t('Missing')}: ${requirementsText(l.requires)}`,'unknown'));if(l.id===s.location)b.classList.add('active');return b;}));
 $('player').textContent=`${coins(s.gold)} · ${t('Native language')}: ${t(WORLD.languages[s.native])}`;$('easy').checked=s.easy;
 const languagePanel=el('div',undefined,'knowledge-panel');for(const language of Object.keys(s.knowledge)){const score=game.knowledge(language);const label=score>=60?'Confident':score>=30?'Learning':'New language';languagePanel.append(el('div',`${t(WORLD.languages[language])}: ${score}/100 (${t(label)})`));}languagePanel.append(el('p',t('Read phrasebooks and practise with locals to recognise sensible replies.'),'muted'));$('player').append(languagePanel);
 $('scene-heading').replaceChildren(el('span',`${t(place.country)} / ${t(WORLD.languages[place.language])}`,'eyebrow'),el('h3',t(place.name)),el('p',t(place.description),'muted'));
 const gathering=game.gatheringActions();$('exploration').hidden=!gathering.length;
 const exploration=[el('h2',t('Explore nearby')),el('p',t('Gathering simulation: collect materials, then return to the quest giver.'),'muted')];
 for(const source of gathering){const remaining=source.limit-(s.gathered[source.id]||0);const row=el('div',undefined,'item');row.append(button(`${t(source.label)} · ${t('Remaining')}: ${remaining}`,()=>{const gathered=game.gather(source.id);return `${t('Gathered')}: ${t(WORLD.items[gathered.item].name)} ×${gathered.count}`;},!game.canGather(source.id)));if(!game.meets(source.requires))row.append(el('span',requirementsText(source.requires),'unknown'));else if(remaining<source.count)row.append(el('span',t('Source exhausted for this voyage'),'unknown'));exploration.push(row);}$('exploration').replaceChildren(...exploration);
 $('npcs').replaceChildren(...game.npcsHere().map(id=>{const b=button(t(WORLD.npcs[id].name),()=>game.open(id),!game.meets(WORLD.npcs[id].requires));if(id===game.npcId)b.classList.add('active');return b;}));
 const line=el('div',undefined,'line');line.append(el('span',`${t(game.npc.name)} · ${t(WORLD.languages[game.language])}`,'speaker'));const words=el('p',game.phrase[game.language]);words.lang=game.language;line.append(words);
 for(const note of game.notes()){const n=el('span',`${note.kind==='word'?t('Word hint')+': ':note.kind==='verb'?t('Verb hint')+': ':''}${note.text} [${t(WORLD.languages[note.language])} · ${t(note.via)}]`,'note');n.lang=note.language;line.append(n);}if(!game.notes().length&&game.language!==s.native)line.append(el('span',t('No translation notes. Read a phrasebook, use a scroll, or recruit an interpreter.'),'muted'));
 const conversation=[];
 if(game.lastResponse){const reply=el('div',undefined,'line player-reply');reply.append(el('span',t('You said'),'speaker'));const words=el('p',WORLD.phrases[game.lastResponse.phrase][game.lastResponse.language]);words.lang=game.lastResponse.language;reply.append(words);appendNotes(reply,game.lastResponse.notes.filter(n=>s.easy||!Object.values(WORLD.items).some(item=>item.type==='dictionary'&&item.name===n.via)));conversation.push(reply);}
 conversation.push(line);$('conversation').replaceChildren(...conversation);
 const choices=game.ended?[el('p',t(game.node.outcome==='dismissed'?'The NPC dismissed you. Replay the conversation to try a different response.':'Conversation recorded. Replay it or continue your voyage.'),'muted')]:game.visibleChoices().map(({choice:c,index:i})=>{
   const b=button('',()=>game.choose(i),!game.available(c));
   if(c.phrase){const responseLanguage=c.language||game.language;const words=el('span',WORLD.phrases[c.phrase][responseLanguage],'response-text');words.lang=responseLanguage;b.append(words);const notes=game.notes(c.phrase,responseLanguage);appendNotes(b,notes);if(responseLanguage!==s.native&&!notes.some(note=>note.kind==='phrase'))b.append(el('span',t(notes.length?'Meaning partially known':'Meaning unknown'),'unknown'));}
   else b.textContent=t(c.text);
   if(!game.available(c))b.append(el('span',requirementsText(c.requires)?`${t('Missing')}: ${requirementsText(c.requires)}`:t('Reward already collected'),'unknown'));
   return b;
 });
 if(game.node.shop)for(const id of game.npc.stock){const item=WORLD.items[id];const label=buyLabel(item.name,item.price)+(item.purchaseQuantity>1?` · ${t('Bundle')}: ${item.purchaseQuantity}`:'');const buy=button(label,()=>game.buy(id),!game.canBuy(id));buy.title=t(item.description||item.name);choices.push(buy);}
 $('choices').replaceChildren(...choices);
 const companionRows=[];
 if(game.companionId){
  const companion=WORLD.companions[game.companionId];const card=el('div',undefined,'companion-card');
  card.append(el('h3',companion.name),el('p',t(companion.description),'muted'));
  card.append(el('p',`${t('Interprets')}: ${companion.knows.filter(language=>!companion.outputs.includes(language)).map(language=>t(WORLD.languages[language])).join(', ')} \u2192 ${companion.outputs.map(language=>t(WORLD.languages[language])).join(', ')}`,'muted'));
  card.append(button(t('Talk to companion'),()=>game.talkCompanion()),button(t('Dismiss companion'),()=>game.dismissCompanion()));companionRows.push(card);
 }else companionRows.push(el('p',t('Travelling alone. You may recruit one companion.'),'muted'));
 $('companion').replaceChildren(...companionRows);
 const departure=s.companionNotice,departureRows=[];
 if(departure){
  const card=el('div',undefined,'companion-notice');const waitingPlace=WORLD.locations.find(location=>location.id===departure.location);
  card.append(el('p',`${WORLD.companions[departure.id].name} \u00b7 ${t('Waiting in')}: ${t(waitingPlace.name)}`,'speaker'));
  const words=el('p',WORLD.phrases[departure.phrase][departure.language]);words.lang=departure.language;card.append(words);
  appendNotes(card,departure.notes.filter(note=>s.easy||!Object.values(WORLD.items).some(item=>item.type==='dictionary'&&item.name===note.via)));
  card.append(button(t('Close message'),()=>{s.companionNotice=null;}));departureRows.push(card);
 }
 $('companion-notice').replaceChildren(...departureRows);
 const waiting=s.metCompanions.filter(id=>id!==game.companionId).map(id=>{
  const row=el('div',undefined,'item'),locationId=game.companionLocation(id),location=WORLD.locations.find(location=>location.id===locationId);
  row.append(el('p',`${WORLD.companions[id].name} \u00b7 ${t('Waiting in')}: ${t(location.name)}`));
  row.append(button(t(locationId===s.location?'Talk':'Visit companion'),()=>{if(locationId!==s.location)game.travel(locationId);game.open(id);},!game.canTravel(locationId)));return row;
 });
 if(!waiting.length)waiting.push(el('p',t('Meet local travellers to find an interpreter.'),'muted'));
 $('known-companions').replaceChildren(...waiting);
 const inventory=[];for(const [id,count]of Object.entries(s.inventory)){if(!count)continue;const item=WORLD.items[id],row=el('div',undefined,'item');row.append(el('div',`${t(item.name)}${count>1?` ×${count}`:''}`));if(item.type==='dictionary'){row.append(el('div',`${t(WORLD.languages[item.from])} → ${t(WORLD.languages[item.to])} · ${entryCount(game.dictionaryEntries(item).length)}`,'muted'));row.append(button(t(s.learned.includes(id)?'Read again':'Read phrasebook'),()=>{game.read(id);showBook(id);}));}if(item.type==='book')row.append(button(t('Read book'),()=>game.read(id)));inventory.push(row);}$('inventory').replaceChildren(...inventory);
 const journal=[el('p',t(WORLD.quest.description))];for(const l of WORLD.locations)journal.push(el('p',`${s.milestones.includes(l.milestone||l.id)?'✓':'○'} ${t(l.name)}: ${t(s.milestones.includes(l.milestone||l.id)?'clue recorded':'find the witness')}`));if(s.milestones.includes('novgorod')&&!s.milestones.includes('greece'))journal.push(el('p',t('Prologue complete. The observatory trail continues in future chapters.'),'note'));
 for(const branch of WORLD.quest.branches||[]){journal.push(el('h2',t(branch.title)),el('p',branch.locations.map(id=>t(WORLD.locations.find(l=>l.id===id).name)).join(' → ')),el('p',`${s.inventory[branch.item]?'✓':'○'} ${t(WORLD.items[branch.item].name)}`));}
 if(s.milestones.includes('greece')&&!s.milestones.includes('ireland'))journal.push(el('p',t('The astrolabe is restored. Continue through Norway, Sweden and Finland to Ireland. Hungary is optional.'),'note'));
 if(s.milestones.includes('ireland'))journal.push(el('p',t('Ireland reached. The library of languages is open. Voyage complete.'),'note'));
 if(s.inventory.codex&&!s.milestones.includes('latin_deciphered')){journal.push(el('p',t('To claim the sun disc: read the Latin glossary, then decipher both codex pages.'),'note'),button(t('Read book'),()=>game.read('codex')));}
 journal.push(el('h2',t('Country investigations')));
 for(const quest of Object.values(WORLD.quests).filter(q=>q.kind==='investigation')){
  if(!s.milestones.includes(quest.started))continue;
  const done=s.milestones.includes(quest.completion),row=el('div',undefined,'item');
  row.append(el('p',`${done?'✓':'◐'} ${t(quest.title)}`),el('p',t(quest.description),'muted'));
  for(const step of quest.steps){
   const complete=s.milestones.includes(step.milestone);
   row.append(el('p',`${complete?'✓':'○'} ${t(step.label)}`));
   if(!complete&&!done)row.append(button(`${t('Follow lead')}: ${t(WORLD.npcs[step.giver].name)}`,()=>{game.travel(step.location);game.open(step.giver);},!game.canTravel(step.location)));
  }
  if(!done)row.append(button(`${t('Return with both findings')}: ${t(WORLD.locations.find(l=>l.id===quest.location).name)}`,()=>{game.travel(quest.location);game.open(quest.giver);},!game.canTravel(quest.location)));
  journal.push(row);
 }
 journal.push(el('h2',t('Optional errands')));for(const [id,quest]of Object.entries(WORLD.quests||{})){if(!quest.completion||quest.kind==='investigation')continue;const done=s.milestones.includes(quest.completion);const started=s.milestones.includes(id+'_started');const row=el('div',undefined,'item');row.append(el('p',`${done?'✓':started?'◐':'○'} ${t(quest.title)}`),el('p',`${t('Fetch')}: ${t(WORLD.items[quest.fetchItem].name)} · ${done?t('Delivered'):`${s.inventory[quest.fetchItem]||0}/${quest.fetchCount||1}`} · ${coins(quest.reward.gold)} + ${t(WORLD.items[quest.reward.item].name)}`,'muted'));if(started&&!done&&quest.giver&&quest.location)row.append(button(t('Return to quest giver'),()=>{game.travel(quest.location);game.open(quest.giver);},!game.canTravel(quest.location)));journal.push(row);}
 journal.push(el('h2',t('Heard rumors')),el('p',t('Rumors are unverified. Compare them with witnesses and evidence.'),'muted'));
 if(!s.rumors.length)journal.push(el('p',t('Ask locals what people are talking about.'),'muted'));
 for(const rumor of s.rumors){const entry=el('div',undefined,'item');entry.append(el('span',`${t(WORLD.npcs[rumor.npcId].name)} · ${t(WORLD.languages[rumor.language])}`,'speaker'));const words=el('p',WORLD.phrases[rumor.phrase][rumor.language]);words.lang=rumor.language;entry.append(words);appendNotes(entry,game.rumorNotes(rumor));journal.push(entry);}
 $('journal').replaceChildren(...journal);
 $('scroll').replaceChildren(...Object.entries(s.inventory).filter(([id,n])=>n>0&&WORLD.items[id].type==='scroll').map(([id,n])=>{const o=el('option',`${t(WORLD.items[id].name)} (${n})`);o.value=id;return o;}));$('cast').disabled=!$('scroll').options.length||!!game.scrollNote;$('notice').textContent='';
}
function showBook(id){const book=WORLD.items[id];const rows=game.dictionaryEntries(book).map(entry=>entry.type==='phrase'?`[${t('phrase')}] ${WORLD.phrases[entry.phrase][book.from]} → ${WORLD.phrases[entry.phrase][book.to]}`:`[${t(entry.type)}] ${entry.source} → ${entry.translation}${entry.forms?.length?' ('+entry.forms.join(', ')+')':''}`);queueMicrotask(()=>{$('notice').textContent=rows.length?rows.join(' / '):t('This empty sample pocketbook has no quest phrases yet.');});}
 $('ui-language').onchange=()=>{const selectedScroll=$('scroll').value;uiLanguage=$('ui-language').value;render();$('scroll').value=selectedScroll;};
 $('easy').onchange=()=>action(()=>{game.state.easy=$('easy').checked;});$('cast').onclick=()=>action(()=>game.cast($('scroll').value));$('replay').onclick=()=>action(()=>game.companionConversation?game.talkCompanion():game.open(game.npcId));$('reset').onclick=()=>action(()=>game.reset());render();
document.querySelector('main').removeAttribute('inert');
$('load-status').hidden=true;
}
startGame().catch(error=>{
 const status=document.getElementById('load-status');
 status.textContent=location.protocol==='file:'
  ?'Spusť lokální server: python -m http.server 8000, pak otevři http://localhost:8000. / Start a local server: python -m http.server 8000, then open http://localhost:8000.'
  :`Výpravu se nepodařilo načíst / Could not load voyage: ${error.message}`;
});
