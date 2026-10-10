const assert=require('node:assert/strict');const {world}=require('./fixtures.cjs');const Engine=require('../engine.js');
for(const language of Object.keys(world.languages))assert.ok(world.phrases.farewell[language],language+' farewell');
const g=new Engine(world);g.state.location='bratislava';g.open('slovakShop');g.ended=true;
assert.equal(world.phrases.farewell[g.language],'Dovidenia.');assert.equal(g.notes('farewell').length,0);
g.state.inventory.sk_cs=1;g.read('sk_cs');assert.ok(g.notes('farewell').some(note=>note.language==='cs'&&note.text==='Na shledanou.'));
g.state.easy=false;assert.equal(g.notes('farewell').length,0);
g.cast('scroll_en');assert.ok(g.notes('farewell').some(note=>note.text==='Goodbye.'&&note.via==='Translation scroll'));
g.recordReply({phrase:'farewell',language:g.language});assert.equal(g.conversation.entries.at(-1).phrase,'farewell');assert.ok(g.conversation.entries.at(-1).notes.some(note=>note.via==='Translation scroll'));
console.log('Passed: authored farewells, spoken language, known phrasebook hints, difficulty, scroll translation, and history.');

for(const phrase of ['companion_join','companion_decline']){const companion=new Engine(world);companion.open('tereza');companion.choose(companion.node.choices.findIndex(choice=>choice.phrase===phrase));assert.equal(companion.ended,true);assert.equal(companion.conversation.closedByChoice,true);assert.equal(companion.companionId,phrase==='companion_join'?'tereza':null);}
const busy=new Engine(world);busy.open('tereza');busy.choose(0);busy.state.milestones.push('prague');busy.travel('bratislava');busy.state.companions=['tereza'];busy.open('mira');busy.nodeId='offer';busy.choose(busy.node.choices.findIndex(choice=>choice.phrase==='mira_join'));assert.equal(busy.ended,false);assert.ok(!busy.conversation.closedByChoice);

const polish=new Engine(world);polish.state.location='krakow';polish.open('polishShop');polish.ended=true;
assert.equal(polish.farewellResponse.language,'pl');assert.equal(polish.farewellResponse.text,'Do widzenia.');assert.equal(polish.farewellResponse.notes.length,0);
polish.cast('scroll_native');assert.ok(polish.farewellResponse.notes.some(note=>note.language==='cs'&&note.text==='Na shledanou.'));
for(const npc of Object.keys(world.npcs)){const test=new Engine(world);test.npcId=npc;test.nodeId=world.dialogues[world.npcs[npc].dialogue].start;assert.equal(test.farewellResponse.text,world.phrases.farewell[test.language]);}

const ada=new Engine(world);for(const phrase of ['ada_ask','ada_answer','ada_accept'])ada.choose(ada.node.choices.findIndex(choice=>choice.phrase===phrase));assert.equal(ada.ended,true);assert.equal(ada.conversation.closedByChoice,true);assert.equal(ada.state.inventory.map,1);assert.equal(ada.canTravel('bratislava'),true);assert.equal(ada.state.location,'prague');
