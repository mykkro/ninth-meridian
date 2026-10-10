const assert=require('node:assert/strict');
const {assembleWorld}=require('../content.js');
const World=assembleWorld(require('./fixtures.cjs').worldData,require('./fixtures.cjs').dialogueData);
const Engine=require('../engine.js');
function say(game,suffix){const i=game.node.choices.findIndex(c=>c.phrase===suffix||c.phrase?.endsWith('_'+suffix));assert.ok(i>=0,`Missing response ${suffix}`);game.choose(i);}
function finish(game){say(game,'ask');say(game,'answer');say(game,'accept');}
function browse(game,id){game.open(id);say(game,'shopBrowse');}
const g=new Engine(World);
// Simulate a Czech novice for the original dismissal/recovery branch checks.
g.state.native='en';g.state.knowledge.cs=0;
assert.throws(()=>g.travel('krakow'));
say(g,'rude');assert.equal(g.node.outcome,'dismissed');assert.equal(g.ended,true);assert.equal(g.state.milestones.length,0);assert.throws(()=>g.choose(0));
while(g.canHelpCommunity())g.helpCommunity();g.open('ada');say(g,'silly');assert.equal(g.nodeId,'rebuke');say(g,'ask');say(g,'help');assert.equal(g.nodeId,'hint');say(g,'answer');say(g,'accept');assert.equal(g.state.inventory.map,1);assert.equal(g.node.outcome,'success');
g.state.native='cs';g.state.knowledge.cs=100;
browse(g,'pragueShop');g.buy('sk_cs');g.read('sk_cs');
g.travel('bratislava');assert.equal(g.notes()[0].language,'cs');
const ask=g.node.choices.find(c=>c.phrase==='mira_ask');const silly=g.node.choices.find(c=>c.phrase==='mira_silly');
assert.equal(g.notes(ask.phrase)[0].language,'cs');assert.equal(g.notes(silly.phrase).length,0);
g.state.easy=false;assert.equal(g.notes().length,0);assert.equal(g.notes(ask.phrase).length,0);
g.cast('scroll_en');assert.equal(g.state.inventory.scroll_en,0);assert.equal(g.notes()[0].language,'en');
for(const {choice:c} of g.visibleChoices())assert.equal(g.notes(c.phrase)[0].language,'en');
assert.throws(()=>g.cast('scroll_native'));assert.equal(g.state.inventory.scroll_native,1);
say(g,'ask');assert.equal(g.scrollNote,null);assert.equal(g.lastResponse.phrase,'mira_ask');assert.equal(g.lastResponse.notes[0].language,'en');assert.equal(g.notes().length,0);
say(g,'answer');say(g,'accept');say(g,'join');assert.equal(g.state.companions.length,1);
g.travel('krakow');assert.equal(g.notes()[0].language,'sk');for(const c of g.node.choices)assert.equal(g.notes(c.phrase)[0].language,'sk');
g.cast('scroll_native');assert.equal(g.notes()[1].language,'cs');assert.equal(g.state.inventory.scroll_native,0);
finish(g);g.travel('lviv');say(g,'ask');
delete g.state.inventory.key;assert.equal(g.available(g.node.choices.find(c=>c.phrase==='oles_answer')),false);assert.throws(()=>say(g,'answer'));
g.state.inventory.key=1;say(g,'answer');say(g,'accept');g.travel('novgorod');finish(g);
assert.equal(g.state.milestones.length,5);
g.open('lev');finish(g);assert.equal(g.state.milestones.length,5);
g.travel('bratislava');finish(g);say(g,'join');assert.equal(g.state.companions.length,1);assert.equal(g.state.inventory.key,1);
g.open('mira');finish(g);say(g,'alone');assert.equal(g.nodeId,'soloBye');assert.equal(g.state.companions.length,1);
g.travel('prague');g.open('pragueShop');assert.throws(()=>g.buy('scroll_en'));assert.throws(()=>say(g,'shopRude'));assert.equal(g.ended,false);
browse(g,'pragueShop');const gold=g.state.gold;assert.throws(()=>g.buy('sk_cs'));assert.equal(g.state.gold,gold);assert.throws(()=>g.buy('pl_sk'));
g.reset();browse(g,'pragueShop');g.state.gold=0;assert.throws(()=>g.buy('scroll_en'));assert.equal(g.state.inventory.scroll_en,1);
const altered=JSON.parse(JSON.stringify(World));delete altered.phrases.ada_ask.en;
const incomplete=new Engine(altered);assert.throws(()=>incomplete.cast('scroll_en'));assert.equal(incomplete.state.inventory.scroll_en,1);
// Learning changes the offered responses, not their authored language or indices.
const learner=new Engine(World);
assert.equal(learner.knowledge('cs'),100);assert.equal(learner.visibleChoices().length,2);
finish(learner);learner.travel('bratislava');assert.equal(learner.knowledge(),0);assert.equal(learner.visibleChoices().length,8);
const rudeIndex=learner.node.choices.findIndex(c=>c.quality==='rude');
learner.state.knowledge.sk=29;assert.equal(learner.visibleChoices().length,8);
learner.state.knowledge.sk=30;assert.equal(learner.visibleChoices().length,5);assert.throws(()=>learner.choose(rudeIndex));
learner.state.knowledge.sk=59;assert.equal(learner.visibleChoices().length,5);
learner.state.knowledge.sk=60;assert.equal(learner.visibleChoices().length,2);
learner.state.easy=false;assert.equal(learner.visibleChoices().length,2);
learner.state.knowledge.sk=0;learner.cast('scroll_en');assert.equal(learner.knowledge(),0);
finish(learner);say(learner,'join');assert.equal(learner.knowledge(),32);assert.equal(learner.knowledge('pl'),0);
const practiceScore=learner.knowledge();learner.open('mira');finish(learner);say(learner,'join');assert.equal(learner.knowledge(),practiceScore);
learner.state.inventory.sk_cs=1;learner.read('sk_cs');assert.ok(learner.knowledge()>=60);
const readingScore=learner.knowledge();learner.read('sk_cs');assert.equal(learner.knowledge(),readingScore);
learner.open('mira');assert.equal(learner.visibleChoices().length,2);assert.equal(learner.visibleChoices()[0].index,1);
learner.state.inventory.en_ga=1;learner.read('en_ga');assert.equal(learner.knowledge('en'),0);
learner.gainKnowledge('sk',1000);assert.equal(learner.knowledge(),100);learner.reset();assert.equal(learner.knowledge('sk'),0);assert.equal(learner.state.studiedEntries.length,0);
for(const npc of Object.values(World.npcs)){
 const dialogue=World.dialogues[npc.dialogue];assert.ok(dialogue.nodes[dialogue.start]);
 for(const node of Object.values(dialogue.nodes)){
  assert.ok(World.phrases[node.phrase][npc.language]);
  if(node.outcome)assert.equal(node.choices.length,0);
  for(const choice of node.choices){if(choice.next)assert.ok(dialogue.nodes[choice.next]);assert.ok(World.phrases[choice.phrase][npc.language]);assert.ok(World.phrases[choice.phrase].cs);assert.ok(World.phrases[choice.phrase].en);}
 }
}
for(const item of Object.values(World.items))if(item.type==='dictionary')for(const entry of g.dictionaryEntries(item)){if(entry.type==='phrase'){assert.ok(World.phrases[entry.phrase][item.from]);assert.ok(World.phrases[entry.phrase][item.to]);}else{assert.ok(entry.source);assert.ok(entry.translation);}}
console.log('Passed: language learning, choice filtering, replay protection, dialogue branches, response translations, scroll scope, companions, quest progression, shops, and content references.');
