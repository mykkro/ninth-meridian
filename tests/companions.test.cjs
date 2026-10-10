const assert=require('node:assert/strict');
const {world}=require('./fixtures.cjs');
const {assembleWorld}=require('../content.js');
const Engine=require('./story-engine.cjs');
const clone=value=>JSON.parse(JSON.stringify(value));
function say(game,phrase){const index=game.node.choices.findIndex(choice=>choice.phrase===phrase);assert.ok(index>=0,`Missing ${phrase}`);game.choose(index);}
function recruit(game,id){game.open(id);if(id==='mira'){say(game,'mira_ask');say(game,'mira_answer');say(game,'mira_accept');say(game,'mira_join');}else say(game,'companion_join');}
function unlocked(){const game=new Engine(world);game.state.milestones=[...world.quest.milestones];for(const id of ['lens','ring','disc','star','key','north_token','aurora_chart','irish_key'])game.state.inventory[id]=1;return game;}

// A second candidate speaks a refusal; no automatic replacement or side effects.
const game=new Engine(world);recruit(game,'tereza');assert.equal(game.companionId,'tereza');
recruit(game,'tereza');assert.equal(game.state.companions.length,1);
assert.throws(()=>game.travel('krakow'));assert.equal(game.companionId,'tereza');assert.equal(game.state.location,'prague');assert.equal(game.state.companionNotice,null);
game.state.milestones.push('prague');game.travel('bratislava');assert.equal(game.companionId,null);assert.equal(game.companionLocation('tereza'),'bratislava');
assert.equal(game.state.companionNotice.reason,'arrival');assert.equal(game.state.companionNotice.phrase,'tereza_arrival');assert.ok(game.npcsHere().includes('tereza'));
recruit(game,'tereza');assert.equal(game.state.companionNotice,null);game.travel('bratislava');assert.equal(game.companionId,'tereza');
recruit(game,'mira');assert.equal(game.nodeId,'companionBusy');assert.equal(game.companionId,'tereza');assert.equal(game.state.companions.length,1);
assert.ok(game.phrase.en.includes('already have a companion'));assert.throws(()=>game.recruitCompanion('mira'));
game.dismissCompanion();assert.equal(game.companionId,null);assert.equal(game.nodeId,'companionFarewell');assert.equal(game.companionLocation('tereza'),'bratislava');
recruit(game,'mira');assert.equal(game.companionId,'mira');assert.throws(()=>game.dismissCompanion('tereza'));

// The companion is accessible away from their home, with all four chat topics.
game.travel('krakow');game.talkCompanion();assert.equal(game.npcId,'mira');assert.equal(game.nodeId,'companionChat');
const before=JSON.stringify({gold:game.state.gold,inventory:game.state.inventory,milestones:game.state.milestones});
for(const phrase of ['companion_askWisdom','companion_askRumor','companion_askEvents','companion_askQuest']){say(game,phrase);assert.ok(game.phrase.sk);say(game,'companion_back');}
assert.equal(JSON.stringify({gold:game.state.gold,inventory:game.state.inventory,milestones:game.state.milestones}),before);
const rumors=game.state.rumors.length;const knowledge=game.knowledge('sk');
game.talkCompanion();for(const phrase of ['companion_askWisdom','companion_askRumor','companion_askEvents','companion_askQuest']){say(game,phrase);say(game,'companion_back');}
assert.equal(game.state.rumors.length,rumors);assert.equal(game.knowledge('sk'),knowledge);
game.state.milestones.push('krakow');game.travel('lviv');game.talkCompanion();say(game,'companion_askEvents');assert.equal(game.phraseId,'mira_lvivEvents');
say(game,'companion_back');say(game,'companion_askQuest');assert.equal(game.phraseId,'mira_archiveQuest');
game.cast('scroll_en');assert.equal(game.notes()[0].text,world.phrases.mira_archiveQuest.en);assert.ok(game.scrollNote.phrases.includes('mira_archiveQuest'));
game.state.milestones.push('lviv');game.travel('novgorod');game.state.milestones.push('novgorod');game.talkCompanion();say(game,'companion_askQuest');assert.equal(game.phraseId,'mira_routesQuest');
game.travel('london');assert.equal(game.companionId,null);assert.equal(game.companionLocation('mira'),'novgorod');assert.equal(game.state.companionNotice.reason,'departure');
assert.equal(game.state.companionNotice.phrase,'mira_departure');assert.throws(()=>game.open('mira'));assert.throws(()=>game.talkCompanion());
game.travel('bratislava');assert.ok(!game.npcsHere().includes('mira'));assert.throws(()=>game.open('mira'));
game.travel('novgorod');assert.ok(game.npcsHere().includes('mira'));recruit(game,'mira');assert.equal(game.companionId,'mira');assert.equal(game.state.companionNotice,null);
game.talkCompanion();say(game,'companion_dismiss');assert.equal(game.companionId,null);assert.equal(game.ended,true);assert.ok(game.npcsHere().includes('mira'));
assert.throws(()=>game.dismissCompanion());

// Every interpreter provides only their configured, authored translation directions.
assert.equal(Object.keys(world.companions).length,6);
for(const [id,companion]of Object.entries(world.companions)){
 const localWorld=clone(world),local=new Engine(localWorld);local.state.milestones=[...world.quest.milestones];local.state.location=companion.home;recruit(local,id);local.state.easy=false;
 localWorld.phrases.companionProbe=Object.fromEntries(Object.keys(world.languages).map(lang=>[lang,`probe ${lang}`]));
 for(const language of Object.keys(world.languages)){
  const notes=local.notes('companionProbe',language);
  const expected=companion.knows.includes(language)?companion.outputs.filter(output=>output!==language):[];
  assert.equal(JSON.stringify(notes.map(note=>note.language)),JSON.stringify(expected));
 }
 local.talkCompanion();say(local,'companion_askQuest');assert.equal(local.phraseId,'companion_voyageDone');
 local.dismissCompanion();assert.equal(local.notes('companionProbe','pl').length,0);assert.ok(local.npcsHere().includes(id));
 local.open(id);say(local,id==='mira'?'mira_ask':'companion_talk');if(id!=='mira')assert.ok(!local.visibleChoices().some(({choice})=>choice.companionOnly));
}

// Arrival and journey-boundary departures both leave an NPC at the stated city.
for(const test of [
 {id:'sofie',route:['berlin','amsterdam','copenhagen'],waiting:'copenhagen',reason:'arrival'},
 {id:'lucia',route:['florence','lyon','toledo','athens'],waiting:'toledo',reason:'departure'},
 {id:'rowan',route:['london','athens'],waiting:'athens',reason:'arrival'},
 {id:'sigrid',route:['oslo','stockholm','turku','galway'],waiting:'galway',reason:'arrival'}
]){
 const local=unlocked();local.travel(test.route[0]);recruit(local,test.id);
 for(const destination of test.route.slice(1))local.travel(destination);
 assert.equal(local.companionId,null);assert.equal(local.companionLocation(test.id),test.waiting);assert.equal(local.state.companionNotice.reason,test.reason);
 assert.ok(local.state.companionNotice.notes.some(note=>note.language==='cs'));
 if(local.state.location!==test.waiting)local.travel(test.waiting);
 assert.ok(local.npcsHere().includes(test.id));recruit(local,test.id);assert.equal(local.companionId,test.id);
 local.travel(test.waiting);assert.equal(local.companionId,test.id); // Clicking the same destination is not a new arrival.
 local.reset();assert.equal(local.companionLocation(test.id),world.companions[test.id].home);assert.equal(local.state.metCompanions.length,0);assert.equal(local.state.companionNotice,null);
}
const north=unlocked();north.travel('london');recruit(north,'rowan');north.travel('athens');recruit(north,'rowan');north.travel('oslo');assert.equal(north.companionLocation('rowan'),'athens');assert.equal(north.state.companionNotice.reason,'departure');

// Context priority follows quest progress and scrolls translate the selected line.
const scholar=unlocked();scholar.state.milestones=[];scholar.state.location='florence';recruit(scholar,'lucia');scholar.talkCompanion();say(scholar,'companion_askQuest');assert.equal(scholar.phraseId,'lucia_quest');
scholar.state.inventory.codex=1;assert.equal(scholar.phraseId,'lucia_clueQuest');scholar.state.milestones.push('latin_deciphered');assert.equal(scholar.phraseId,'lucia_laterQuest');
scholar.state.milestones.push('spain');assert.equal(scholar.phraseId,'lucia_discQuest');scholar.state.milestones.push('greece');assert.equal(scholar.phraseId,'companion_afterReunion');scholar.state.milestones.push('ireland');assert.equal(scholar.phraseId,'companion_voyageDone');

// Invalid lifecycle content fails at load time, not in the middle of a voyage.
for(const mutate of [
 w=>{w.companions.sofie.home='missing';},
 w=>{w.companions.sofie.chatStart='missing';},
 w=>{w.companions.sofie.route=['missing'];},
 w=>{delete w.phrases.sofie_departure.de;},
 w=>{delete w.dialogues.sofie.nodes.greeting.choices[0].recruitBlocked;},
 w=>{w.dialogues.sofie.nodes.companionEvents.contexts[0].requires.location='missing';},
 w=>{delete w.phrases.sofie_localEvents.de;},
 w=>{w.dialogues.sofie.nodes.greeting.choices[0].effects.push({type:'recruit',id:'lucia'});}
]){const invalid=clone(world);mutate(invalid);assert.throws(()=>assembleWorld(invalid,{phrases:invalid.phrases,dialogues:invalid.dialogues}));}
console.log('Passed: single companion, refusal, dismissal, remote chat, contextual lines, translation coverage, finite routes, waiting locations, re-recruitment, replay, reset, and lifecycle validation.');
