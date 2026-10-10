const assert=require('node:assert/strict');
const Engine=require('../engine.js');
const {world}=require('./fixtures.cjs');
const {say,finishIreland}=require('./irish-finale.cjs');
const {makeRestitution}=require('./restitution.cjs');
const {assembleWorld}=require('../content.js');

for(const [city,witness,expert] of [['leipzig','greta','konrad'],['hamburg','hannes','marta'],['bologna','paolo','chiara'],['venice','nadia','vittorio']]){
 for(const method of ['archive','field']){
  const game=new Engine(world),id=city+'_restitution';game.state.milestones=['novgorod','germany','italy'];
  assert.equal(game.canTravel('budapest'),false);game.travel(city);while(game.canHelpCommunity())game.helpCommunity();game.open(witness);say(game,'regional_ask');say(game,'regional_record');
  while(game.canHelpCommunity())game.helpCommunity();game.open(expert);say(game,'regional_investigate');say(game,'regional_'+method);game.state.knowledge[game.language]=100;
  assert.ok(game.visibleChoices().some(({choice})=>choice.phrase===city+'_wrong'),'Fluent players still face ethical risks');
  game.state.knowledge[game.language]=17;
  const gold=game.state.gold,day=game.state.voyageDay,knowledge=game.knowledge();say(game,city+'_wrong');
  assert.equal(game.ended,true);assert.equal(game.node.outcome,'dismissed');assert.deepEqual(game.state.setbacks,[id]);assert.equal(game.state.voyageDay,day+world.quests[id].delayDays);
  assert.equal(game.state.gold,gold);assert.equal(game.knowledge(),knowledge);assert.equal(game.canTravel('budapest'),true);assert.equal(game.state.inventory.eszter_notes,1);
  while(game.canHelpCommunity())game.helpCommunity();game.open(expert);say(game,'regional_investigate');say(game,'regional_'+method);const snapshot=JSON.stringify(game.state);
  assert.throws(()=>say(game,city+'_answer'+(method==='archive'?'A':'B')));assert.throws(()=>say(game,city+'_wrong'));assert.equal(JSON.stringify(game.state),snapshot);
  game.travel('budapest');while(game.canHelpCommunity())game.helpCommunity();game.open('eszter');say(game,id+'_ask');const atRepair=JSON.stringify(game.state);assert.throws(()=>say(game,'recovery_confirm'));assert.equal(JSON.stringify(game.state),atRepair);
  game.gather(world.quests[id].sourceAction);assert.throws(()=>game.gather(world.quests[id].sourceAction));say(game,'recovery_confirm');
  assert.equal(game.state.setbacks.length,0);assert.deepEqual(game.state.repairedSetbacks,[id]);assert.equal(game.state.inventory[world.quests[id].repairItem],0);assert.equal(game.state.milestones.includes('greece'),false);assert.equal(game.canTravel('budapest'),true);
  // A second mistake still needs fresh evidence without permanently exhausting recovery.
  game.travel(city);while(game.canHelpCommunity())game.helpCommunity();game.open(expert);say(game,'regional_investigate');say(game,'regional_'+method);say(game,city+'_wrong');makeRestitution(game,id);
  assert.deepEqual(game.state.repairedSetbacks,[id]);assert.equal(game.state.history.filter(event=>event.label==='Restitution made').length,2);
  game.travel(city);while(game.canHelpCommunity())game.helpCommunity();game.open(expert);say(game,'regional_investigate');say(game,'regional_'+method);say(game,city+'_answer'+(method==='archive'?'A':'B'));say(game,'regional_confirm');assert.ok(game.state.milestones.includes(city+'_verified'));
  while(game.canHelpCommunity())game.helpCommunity();game.open(expert);say(game,'regional_investigate');say(game,'regional_'+method);assert.throws(()=>say(game,city+'_wrong'));assert.equal(game.state.setbacks.length,0);
  game.reset();assert.equal(game.canTravel('budapest'),false);assert.equal(game.state.repairedSetbacks.length,0);assert.equal(game.state.setbacks.length,0);
 }
}

for(const [site,id] of [['ash-temple','ash_restitution'],['tide-shrine','tide_restitution'],['star-abbey','abbey_restitution']]){
 const game=new Engine(world);game.state.milestones=['greece','norway','sweden','finland'];game.state.location='turku';game.state.inventory.astrolabe=1;game.state.inventory.irish_key=1;
 game.travel('galway','boat');say(game,'niamh_ask');say(game,'niamh_search');game.travel(site);say(game,'sanctuary_ask');game.gather(site+'_search');say(game,'sanctuary_study');
 const day=game.state.voyageDay;say(game,site+'_wrong');assert.equal(game.state.voyageDay,day+world.quests[id].delayDays);assert.equal(game.ended,true);
 while(game.canHelpCommunity())game.helpCommunity();game.open(world.locations.find(place=>place.id===site).npcs[0]);say(game,'sanctuary_ask');say(game,'sanctuary_study');assert.throws(()=>say(game,site+'_answer'));
 assert.ok(!game.state.inventory[site+'_seal']);makeRestitution(game,id);assert.equal(game.state.setbacks.length,0);
 game.travel(site);while(game.canHelpCommunity())game.helpCommunity();game.open(world.locations.find(place=>place.id===site).npcs[0]);say(game,'sanctuary_ask');say(game,'sanctuary_study');say(game,site+'_answer');say(game,'sanctuary_confirm');assert.equal(game.state.inventory[site+'_seal'],1);
 assert.ok(game.state.repairedSetbacks.includes(id));
}

for(const peril of ['niamh_bargain','niamh_monopoly']){
 const game=new Engine(world);game.state.milestones=['greece','norway','sweden','finland'];game.state.location='turku';game.state.inventory.astrolabe=1;game.state.inventory.irish_key=1;
 finishIreland(game);game.state.milestones=game.state.milestones.filter(id=>id!=='ireland');while(game.canHelpCommunity())game.helpCommunity();game.open('niamh');say(game,'niamh_ask');
 const day=game.state.voyageDay;say(game,peril);assert.equal(game.ended,true);assert.equal(game.state.voyageDay,day+7);assert.ok(!game.state.milestones.includes('ireland'));
 while(game.canHelpCommunity())game.helpCommunity();game.open('niamh');say(game,'niamh_ask');assert.throws(()=>say(game,'niamh_accept'));assert.throws(()=>say(game,peril));
 makeRestitution(game,'galway_restitution');assert.equal(game.state.location,'budapest');assert.equal(game.state.setbacks.length,0);
 assert.ok(game.state.history.some(event=>event.from==='galway'&&event.transport==='Book boat passage'));
 game.travel('oslo');game.travel('galway','boat');while(game.canHelpCommunity())game.helpCommunity();game.open('niamh');say(game,'niamh_ask');say(game,'niamh_accept');assert.ok(game.state.milestones.includes('ireland'));
 while(game.canHelpCommunity())game.helpCommunity();game.open('niamh');say(game,'niamh_ask');assert.throws(()=>say(game,peril));assert.equal(game.state.setbacks.length,0);
}

{
 const game=new Engine(world);game.state.milestones=['greece','norway','sweden','finland'];game.state.location='turku';game.state.inventory.astrolabe=1;game.state.inventory.irish_key=1;
 game.travel('galway','boat');say(game,'niamh_ask');say(game,'niamh_search');
 for(const site of ['ash-temple','tide-shrine']){game.travel(site);say(game,'sanctuary_ask');game.gather(site+'_search');say(game,'sanctuary_study');say(game,site+'_wrong');}
 assert.deepEqual(game.state.setbacks,['ash_restitution','tide_restitution']);
 makeRestitution(game,'ash_restitution');assert.deepEqual(game.state.setbacks,['tide_restitution']);
 makeRestitution(game,'tide_restitution');assert.equal(game.state.setbacks.length,0);assert.equal(game.state.repairedSetbacks.length,2);
}

for(const mutate of [
 w=>{w.dialogues.konrad.nodes.puzzleA.choices.find(c=>c.phrase==='leipzig_wrong').effects[0].id='missing';},
 w=>{w.quests.leipzig_restitution.sourceAction='missing';},
 w=>{w.quests.leipzig_restitution.delayDays=-1;},
 w=>{w.locations.find(l=>l.id==='budapest').recoveryAccess=['missing'];},
 w=>{w.dialogues.niamh.nodes.clue.choices[0].requires.withoutSetbacks=['missing'];}
]){
 const invalid=JSON.parse(JSON.stringify(world));mutate(invalid);assert.throws(()=>assembleWorld(invalid,{phrases:invalid.phrases,dialogues:invalid.dialogues}));
}
console.log('Passed: four early failures in both methods, pre-Greece Hungary access, persistent blocks, repeat-safe restitution, three Irish crises, both final betrayals, sea detours, fluent-player risks, no guessing rewards, and content validation.');
