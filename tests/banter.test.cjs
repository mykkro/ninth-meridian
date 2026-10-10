const assert=require('node:assert/strict');
const {world}=require('./fixtures.cjs');
const Engine=require('../engine.js');
function say(g,phrase){const i=g.node.choices.findIndex(c=>c.phrase===phrase);assert.ok(i>=0);g.choose(i);}
const g=new Engine(world);g.state.milestones=['prague','bratislava'];g.travel('krakow');
const before=JSON.stringify({gold:g.state.gold,inventory:g.state.inventory,milestones:g.state.milestones});
say(g,'banter_sillySpoon');assert.equal(g.nodeId,'banterSpoon');assert.equal(g.knowledge(),0);assert.equal(g.ended,false);
g.choose(0);assert.equal(g.nodeId,'greeting');say(g,'banter_rudeDemand');assert.equal(g.node.outcome,'dismissed');assert.equal(g.ended,true);
assert.equal(JSON.stringify({gold:g.state.gold,inventory:g.state.inventory,milestones:g.state.milestones}),before);
g.open('zofia');g.state.knowledge.pl=30;assert.ok(!g.visibleChoices().some(({choice})=>choice.phrase.startsWith('banter_rude')));assert.ok(g.visibleChoices().some(({choice})=>choice.phrase==='banter_sillyCheese'));
g.state.knowledge.pl=60;assert.ok(!g.visibleChoices().some(({choice})=>choice.phrase.startsWith('banter_')));
while(g.canHelpCommunity())g.helpCommunity();g.state.knowledge.pl=0;say(g,'zofia_ask');say(g,'banter_sillyCheese');assert.equal(g.nodeId,'banterCheese');g.cast('scroll_en');assert.ok(g.notes().some(n=>n.language==='en'));
let expanded=0;for(const npc of Object.values(world.npcs)){const nodes=world.dialogues[npc.dialogue].nodes;if(!nodes.greeting||!nodes.banterSpoon)continue;expanded++;for(const key of ['banter_sillySpoon','banter_sillyCheese','banter_rudeDemand','banter_rudeInsult']){assert.ok(nodes.greeting.choices.some(c=>c.phrase===key));assert.ok(world.phrases[key][npc.language]);}assert.equal(nodes.banterDismiss.outcome,'dismissed');}
assert.ok(expanded>=29);
for(const id of ['eleni','ingrid','erik','aino','eszter','niamh'])assert.ok(!Object.values(world.dialogues[id].nodes).some(node=>node.choices.some(choice=>choice.phrase.startsWith('banter_'))),id+' keeps a sober closing chapter');
console.log('Passed: new banter across NPCs, language filtering, rebukes, recovery, dismissal, translations, and no quest rewards.');
