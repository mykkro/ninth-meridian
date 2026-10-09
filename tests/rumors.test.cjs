const assert=require('node:assert/strict');
const {assembleWorld}=require('../content.js');
const World=assembleWorld(require('./fixtures.cjs').worldData,require('./fixtures.cjs').dialogueData);
const Engine=require('../engine.js');
const g=new Engine(World);
function say(phrase){const index=g.node.choices.findIndex(c=>c.phrase===phrase);assert.ok(index>=0,`Missing response ${phrase}`);g.choose(index);}
g.state.milestones=[...World.quest.milestones];
const before=JSON.stringify(g.state.inventory);
for(const location of World.locations.slice(0,5)){
 g.travel(location.id);
 for(const npc of location.npcs.slice(0,2)){
  g.open(npc);say('askRumors');assert.equal(g.nodeId,'rumors');say('askLocalRumor');
  assert.equal(g.nodeId,'rumorLocal');assert.equal(g.state.rumors.at(-1).npcId,npc);
  say('returnRumors');say('askTrailRumor');assert.equal(g.nodeId,'rumorTrail');
  say('returnMain');assert.equal(g.nodeId,'greeting');assert.equal(g.ended,false);
 }
}
assert.equal(g.state.rumors.length,20);assert.equal(JSON.stringify(g.state.inventory),before);
g.travel('prague');g.open('ada');say('askRumors');say('askLocalRumor');assert.equal(g.state.rumors.length,20);
g.cast('scroll_en');const rumor=g.state.rumors.find(r=>r.id==='ada_rumorLocal');assert.equal(g.rumorNotes(rumor)[0].language,'en');
say('returnMain');g.open('ada');g.state.easy=false;assert.equal(g.rumorNotes(rumor)[0].language,'en');
g.state.companions.push('mira');const ukrainian=g.state.rumors.find(r=>r.npcId==='oles');assert.equal(g.rumorNotes(ukrainian)[0].language,'sk');
assert.equal(g.npc.language,'cs'); // Journal notes use the original speaker's language.
g.reset();assert.equal(g.state.rumors.length,0);say('askRumors');say('askTrailRumor');assert.equal(g.state.milestones.length,0);
for(const location of World.locations.slice(0,5))for(const npcId of location.npcs.slice(0,2)){
 const npc=World.npcs[npcId],nodes=World.dialogues[npc.dialogue].nodes;
 for(const id of ['rumorLocal','rumorTrail']){
  const text=World.phrases[nodes[id].phrase];assert.ok(text[npc.language]);assert.ok(text.cs);assert.ok(text.en);
 }
}
console.log('Passed: all NPC rumor branches, journal deduplication, preserved translations, companion notes, quest isolation, and reset.');
