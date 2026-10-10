const assert=require('node:assert/strict');
const Engine=require('../engine.js');
const {world}=require('./fixtures.cjs');
const {say}=require('./irish-finale.cjs');
const sites=['ash-temple','tide-shrine','star-abbey'];
const permutations=list=>list.length?list.flatMap(value=>permutations(list.filter(other=>other!==value)).map(rest=>[value,...rest])):[[]];
for(const order of permutations(sites)){
 const game=new Engine(world);game.state.milestones=['greece','norway','sweden','finland'];game.state.location='turku';game.state.inventory.irish_key=1;
 for(const id of sites)assert.equal(game.canTravel(id),false);
 game.travel('galway','boat');assert.throws(()=>say(game,'niamh_ask'));
 game.state.inventory.astrolabe=1;say(game,'niamh_ask');
 assert.ok(game.state.milestones.includes('ireland_started'));assert.throws(()=>say(game,'niamh_accept'));say(game,'niamh_search');
 for(const [index,id] of order.entries()){
  assert.deepEqual(game.transportOptions(id).map(option=>option.id),['carriage','horse']);
  game.travel(id,'horse');say(game,'sanctuary_ask');
  assert.throws(()=>say(game,'sanctuary_study'));
  game.gather(id+'_search');assert.throws(()=>game.gather(id+'_search'));
  say(game,'sanctuary_study');const beforeStudy=game.state.voyageDay;say(game,'consequence_leave');assert.equal(game.ended,true);assert.equal(game.state.voyageDay,beforeStudy);
  assert.ok(!game.state.milestones.includes(id+'_verified'));assert.equal(game.state.setbacks.length,0);
  game.open(world.locations.find(location=>location.id===id).npcs[0]);say(game,'sanctuary_ask');say(game,'sanctuary_study');say(game,id+'_answer');say(game,'sanctuary_confirm');
  assert.equal(game.state.inventory[id+'_seal'],1);assert.ok(game.state.milestones.includes(id+'_verified'));
  assert.deepEqual(game.transportOptions('london'),[]);assert.deepEqual(game.transportOptions('turku'),[]);
  game.open(world.locations.find(location=>location.id===id).npcs[0]);say(game,'sanctuary_ask');say(game,'sanctuary_study');say(game,id+'_answer');assert.throws(()=>say(game,'sanctuary_confirm'));assert.equal(game.state.inventory[id+'_seal'],1);
  game.travel('galway','carriage');game.open('niamh');say(game,'niamh_ask');
  if(index<2){assert.throws(()=>say(game,'niamh_accept'));assert.ok(!game.state.milestones.includes('ireland'));say(game,'niamh_search');}
 }
 const missingSeal=order[0]+'_seal';delete game.state.inventory[missingSeal];assert.throws(()=>say(game,'niamh_accept'));game.state.inventory[missingSeal]=1;
 say(game,'niamh_accept');assert.equal(game.ended,true);assert.ok(game.state.milestones.includes(world.quest.resolutionMilestone));assert.ok(!game.state.milestones.includes(world.quest.finalMilestone));
 assert.equal(game.state.location,'galway');assert.ok(game.transportOptions('turku').some(option=>option.id==='boat'));
 game.open('niamh');say(game,'niamh_ask');say(game,'niamh_accept');assert.equal(game.state.milestones.filter(id=>id==='ireland').length,1);
 game.reset();assert.equal(game.canTravel(order[0]),false);assert.equal(game.state.inventory[missingSeal],undefined);
}
const errands=['harbour_lights','winter_stores','archive_shelves','pilgrim_remedy','garden_salve','refuge_rope'];
for(const id of errands){
 const quest=world.quests[id],game=new Engine(world);game.state.milestones=[...world.quest.milestones].filter(id=>!id.startsWith('ireland'));game.state.location=quest.location;game.open(quest.giver);
 assert.equal(game.canGather(id+'_gather'),false);say(game,id+'_accept');
 for(let n=0;n<quest.fetchCount-1;n++)game.gather(id+'_gather');assert.throws(()=>say(game,id+'_deliver'));
 game.gather(id+'_gather');const gold=game.state.gold,rewardBefore=game.state.inventory[quest.reward.item]||0;say(game,id+'_deliver');
 assert.equal(game.state.inventory[quest.fetchItem],0);assert.equal(game.state.inventory[quest.reward.item],rewardBefore+quest.reward.count);assert.equal(game.state.gold,gold+quest.reward.gold);
 assert.ok(game.state.milestones.includes(quest.completion));game.open(quest.giver);assert.throws(()=>say(game,id+'_deliver'));
 if(world.items[quest.reward.item].type==='dictionary'){
  game.read(quest.reward.item);assert.ok(game.state.learned.includes(quest.reward.item));
  const entry=game.dictionaryEntries(world.items[quest.reward.item])[0];assert.ok(game.notes(entry.phrase,world.items[quest.reward.item].from).some(note=>note.language==='cs'));
 }
 game.reset();assert.equal(game.state.inventory[quest.reward.item],quest.reward.item==='scroll_native'?1:undefined);assert.equal(game.state.rewarded.length,0);
}
console.log('Passed: all six Irish branch orders, evidence and seal gates, safe study exits, island transport, replay protection, six resource errands, dictionary rewards, and reset.');
