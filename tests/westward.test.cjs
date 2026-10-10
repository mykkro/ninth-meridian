const assert=require('node:assert/strict');
const Engine=require('../engine.js');
const {world,worldData,dialogueData}=require('./fixtures.cjs');
const {assembleWorld}=require('../content.js');
const {finishIreland}=require('./irish-finale.cjs');
const clone=value=>structuredClone(value);
const game=new Engine(world);let before=clone(game.state);
assert.equal(game.canEmbarkWest(),false);assert.throws(()=>game.embarkWest());assert.deepEqual(game.state,before);
game.state.location='turku';game.state.milestones=['greece','norway','sweden','finland'];game.state.inventory.astrolabe=1;game.state.inventory.irish_key=1;
finishIreland(game);assert.ok(game.state.milestones.includes('ireland'));assert.ok(!game.state.milestones.includes(world.quest.finalMilestone));assert.ok(game.canEmbarkWest());
for(const missing of world.quest.departureRequires.items){const count=game.state.inventory[missing];delete game.state.inventory[missing];before=clone(game.state);assert.throws(()=>game.embarkWest());assert.deepEqual(game.state,before);game.state.inventory[missing]=count;}
for(const missing of world.quest.departureRequires.milestones){game.state.milestones=game.state.milestones.filter(id=>id!==missing);before=clone(game.state);assert.throws(()=>game.embarkWest());assert.deepEqual(game.state,before);game.state.milestones.push(missing);}
game.state.setbacks.push('galway_restitution');before=clone(game.state);assert.throws(()=>game.embarkWest());assert.deepEqual(game.state,before);game.state.setbacks=[];
game.state.location='london';before=clone(game.state);assert.throws(()=>game.embarkWest());assert.deepEqual(game.state,before);game.state.location='galway';
const gold=game.state.gold,days=game.state.voyageDay,inventory=clone(game.state.inventory);game.embarkWest();
assert.ok(game.state.milestones.includes('westward_departure'));assert.equal(game.state.location,'galway','Ending preserves the European exploration checkpoint');assert.equal(game.state.gold,gold);assert.equal(game.state.voyageDay,days);assert.deepEqual(game.state.inventory,inventory);
assert.equal(game.state.history.filter(e=>e.label==='Embarked west toward the lost land').length,1);before=clone(game.state);assert.throws(()=>game.embarkWest());assert.deepEqual(game.state,before);
assert.ok(game.transportOptions('london').some(quote=>quote.id==='boat'),'Post-story travel remains available');game.reset();assert.ok(!game.state.milestones.includes('westward_departure'));
const invalid=clone(worldData);invalid.quest.departureRequires.items.push('missing');assert.throws(()=>assembleWorld(invalid,dialogueData));
console.log('Passed: Irish resolution before departure, all relic/seal/evidence gates, unresolved harms, Galway port, explicit one-time ending, preserved exploration, and reset.');
