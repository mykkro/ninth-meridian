const assert=require('node:assert/strict');
const {world}=require('./fixtures.cjs');
const Engine=require('../engine.js');
function say(g,id){const i=g.node.choices.findIndex(c=>c.phrase===id);assert.ok(i>=0,`Missing ${id}`);g.choose(i);}
const g=new Engine(world);g.state.milestones=['france'];g.state.inventory.letter=1;
g.travel('toledo');say(g,'ines_ask');assert.throws(()=>say(g,'ines_answer'));assert.ok(g.missingRequirements(g.node.choices.find(c=>c.phrase==='ines_answer').requires).some(r=>r.id==='latin_deciphered'));
g.state.milestones.push('latin_deciphered');say(g,'ines_answer');say(g,'ines_accept');assert.equal(g.state.inventory.disc,1);
for(const withHungary of [false,true]){
 const voyage=new Engine(world);assert.equal(voyage.canTravel('oslo'),false);voyage.state.milestones=['greece'];voyage.state.inventory.astrolabe=1;
 assert.equal(voyage.canTravel('galway'),false);
 if(withHungary){voyage.travel('budapest');say(voyage,'eszter_ask');say(voyage,'eszter_accept');assert.equal(voyage.state.inventory.scholar_compass,1);}
 for(const [place,npc]of [['oslo','ingrid'],['stockholm','erik'],['helsinki','aino'],['galway','niamh']]){voyage.travel(place);say(voyage,npc+'_ask');say(voyage,npc+'_accept');}
 assert.ok(voyage.state.milestones.includes('ireland'));assert.equal(voyage.ended,true);assert.equal(voyage.state.milestones.includes('hungary'),withHungary);
 voyage.open('niamh');say(voyage,'niamh_ask');say(voyage,'niamh_accept');assert.equal(voyage.state.milestones.filter(id=>id==='ireland').length,1);
}
const errands=new Engine(world);errands.state.milestones=[...world.quest.milestones];
for(const item of ['lens','ring','disc','astrolabe'])errands.state.inventory[item]=1;
for(const [id,at,from,giver,provider,resource,reward,gold,count]of [
 ['salt_errand','prague','bratislava','boris','dana','salt','river_boots',18,1],
 ['herb_errand','lyon','florence','marie','rosa','lavender','healing_salve',15,3],
 ['rope_errand','athens','copenhagen','petros','freja','rope','brass_compass',20,1],
 ['ore_errand','oslo','stockholm','bjorn','liv','ore','warm_cloak',24,1]
]){
 errands.travel(at);errands.open(giver);say(errands,id+'_wisdomAsk');assert.ok(errands.state.rumors.some(r=>r.id===id+'_wisdom'));say(errands,id+'_accept');assert.throws(()=>say(errands,id+'_turnin'));
 errands.travel(from);errands.open(provider);say(errands,id+'_take');assert.equal(errands.state.inventory[resource],1);
 errands.travel(at);errands.open(giver);const before=errands.state.gold;say(errands,id+'_turnin');assert.equal(errands.state.gold,before+gold);assert.equal(errands.state.inventory[resource],0);assert.equal(errands.state.inventory[reward],count);assert.ok(errands.state.milestones.includes(id+'_done'));
 errands.travel(from);errands.open(provider);say(errands,id+'_take');errands.travel(at);errands.open(giver);assert.throws(()=>say(errands,id+'_turnin'));assert.equal(errands.state.gold,before+gold);assert.equal(errands.state.inventory[reward],count);
}
errands.reset();assert.equal(errands.state.rewarded.length,0);
console.log('Passed: Toledo arrival before Latin deciphering, relic gate, northern epilogue, optional Hungary, Irish finale, side deliveries, consumption, and one-time rewards.');
