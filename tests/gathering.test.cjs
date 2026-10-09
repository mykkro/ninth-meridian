const assert=require('node:assert/strict');
const {world}=require('./fixtures.cjs');
const {assembleWorld}=require('../content.js');
const Engine=require('../engine.js');
function say(g,phrase){const i=g.node.choices.findIndex(c=>c.phrase===phrase);assert.ok(i>=0);g.choose(i);}
const g=new Engine(world);assert.equal(g.canGather('wood_errand_gather'),false);assert.throws(()=>g.gather('wood_errand_gather'));
g.open('janek');say(g,'wood_errand_accept');const gold=g.state.gold;
g.gather('wood_errand_gather');assert.equal(g.state.inventory.wood,1);assert.equal(g.nodeId,'task');assert.throws(()=>say(g,'wood_errand_turnin'));assert.equal(g.missingRequirements(g.node.choices[0].requires)[0].count,2);
g.gather('wood_errand_gather');g.gather('wood_errand_gather');assert.equal(g.state.gold,gold);say(g,'wood_errand_turnin');assert.equal(g.state.inventory.wood,0);assert.equal(g.state.inventory.torch,2);assert.equal(g.state.gold,gold+12);
g.gather('wood_errand_gather');g.gather('wood_errand_gather');assert.equal(g.canGather('wood_errand_gather'),false);assert.throws(()=>g.gather('wood_errand_gather'));assert.equal(g.state.gathered.wood_errand_gather,5);
g.open('janek');assert.throws(()=>say(g,'wood_errand_turnin'));
g.state.milestones.push('prague');g.travel('bratislava');assert.throws(()=>g.gather('wood_errand_gather'));g.open('zuzana');say(g,'flowers_errand_accept');g.gather('flowers_errand_gather');assert.throws(()=>say(g,'flowers_errand_turnin'));g.gather('flowers_errand_gather');say(g,'flowers_errand_turnin');assert.equal(g.state.inventory.flowers,0);assert.equal(g.state.inventory.health_potion,1);
g.state.milestones.push('italy','novgorod');g.travel('lyon');g.open('marie');say(g,'herb_errand_accept');g.travel('florence');g.gather('gather_lavender');g.travel('lyon');g.open('marie');say(g,'herb_errand_turnin');assert.equal(g.state.inventory.lavender,0);assert.equal(g.state.inventory.healing_salve,3);
g.reset();assert.equal(Object.keys(g.state.gathered).length,0);assert.equal(g.state.inventory.wood,undefined);g.open('janek');say(g,'wood_errand_accept');assert.equal(g.canGather('wood_errand_gather'),true);
const bad=JSON.parse(JSON.stringify(world));bad.locations.find(l=>l.id==='prague').actions[0].count=0;assert.throws(()=>assembleWorld(bad,{phrases:bad.phrases,dialogues:bad.dialogues}));
console.log('Passed: gathering gates, partial quantities, local sources, exhaustion, deliveries, consumed materials, rewards, alternate herb collection, and reset.');
