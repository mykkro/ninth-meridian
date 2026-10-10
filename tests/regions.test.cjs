const assert=require('node:assert/strict');
const {world}=require('./fixtures.cjs');
const {assembleWorld}=require('../content.js');
const Engine=require('../engine.js');
const {say,routes,investigateCity,investigateCountry}=require('./regional-routes.cjs');
for(const [id,next,base,companion]of [['german_route','amsterdam','germany','sofie'],['italian_route','lyon','italy','lucia']]){
 const route=routes[id],fresh=new Engine(world);
 for(const [city]of route.cities)assert.equal(fresh.canTravel(city),false);
 for(const reverse of [false,true]){
  const game=new Engine(world);game.state.milestones=['novgorod',base];game.state.inventory.codex=1;
  assert.equal(game.canTravel(next),false);assert.throws(()=>game.travel(next));
  game.travel(route.home);game.open(companion);say(game,'companion_join');
  game.open(route.giver);say(game,'regional_regionAsk');assert.throws(()=>say(game,'regional_report'));
  const cities=reverse?[...route.cities].reverse():route.cities;
  for(const [index,entry]of cities.entries()){
   const [city,witness,expert]=entry;
   game.travel(city);assert.equal(game.companionId,companion);assert.equal(game.state.companionNotice,null);
   game.open(expert);say(game,'regional_investigate');
   assert.throws(()=>say(game,'regional_archive'));assert.throws(()=>say(game,'regional_field'));
   assert.equal(game.missingRequirements(game.node.choices[0].requires)[0].id,city+'_witness');
   game.open(witness);say(game,'regional_ask');assert.ok(game.state.rumors.some(r=>r.id===city+'_evidence'));
   assert.ok(!game.state.milestones.includes(city+'_witness'));say(game,'regional_record');
   game.open(expert);say(game,'regional_investigate');const method=reverse?'field':'archive';say(game,'regional_'+method);
   // Keep the recovery probe at beginner knowledge, where wrong replies are visible.
   game.state.knowledge[world.npcs[expert].language]=0;
   say(game,city+'_wrong');assert.equal(game.nodeId,'hint');assert.ok(!game.state.milestones.includes(city+'_verified'));
   say(game,'regional_retry');say(game,'regional_'+method);say(game,city+'_answer'+(reverse?'B':'A'));
   assert.ok(game.phrase.cs);assert.ok(game.notes().some(note=>note.via===world.companions[companion].name));
   const gold=game.state.gold;say(game,'regional_confirm');assert.equal(game.state.gold,gold+8);
   assert.equal(game.state.milestones.filter(m=>m===city+'_verified').length,1);
   assert.equal(game.canTravel(next),false);
   // Replaying either solution cannot farm rewards or duplicate progress.
   game.open(expert);say(game,'regional_investigate');say(game,'regional_'+(reverse?'archive':'field'));
   say(game,city+'_answer'+(reverse?'A':'B'));assert.throws(()=>say(game,'regional_confirm'));assert.equal(game.state.gold,gold+8);
   if(index===0){game.travel(route.home);game.open(route.giver);say(game,'regional_regionAsk');assert.throws(()=>say(game,'regional_report'));}
  }
  assert.equal(game.canTravel(next),false);game.travel(route.home);game.open(route.giver);say(game,'regional_regionAsk');say(game,'regional_report');
  assert.equal(game.canTravel(next),true);assert.equal(game.ended,true);assert.ok(game.state.milestones.includes(id));
  const gold=game.state.gold;game.open(route.giver);say(game,'regional_regionAsk');say(game,'regional_report');
  assert.equal(game.state.gold,gold);assert.equal(game.state.milestones.filter(m=>m===id).length,1);
  game.travel(next);assert.equal(game.companionId,companion);
  game.reset();assert.equal(game.canTravel(next),false);assert.equal(game.state.rewarded.length,0);
 }
 // Solo play can study all regional dialogue through the existing affordable notes.
 const solo=new Engine(world),book=base==='germany'?'de_cs_route':'it_cs_route';
 solo.state.inventory[book]=1;solo.read(book);solo.state.easy=true;
 for(const [city]of route.cities)assert.ok(solo.notes(city+'_puzzleA',world.items[book].from).some(n=>n.language==='cs'));
}
for(const mutate of [q=>{q.steps[0].location='missing';},q=>{q.steps[0].giver='ada';},q=>{q.started='missing';},q=>{q.steps[0].milestone='missing';}]){
 const invalid=JSON.parse(JSON.stringify(world));mutate(invalid.quests.german_route);
 assert.throws(()=>assembleWorld(invalid,{phrases:invalid.phrases,dialogues:invalid.dialogues}));
}
console.log('Passed: two country investigations, both city orders, archive and physical routes, witness gates, wrong-answer recovery, return visits, companion continuity, solo translations, rewards, and reset.');
