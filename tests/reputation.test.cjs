const assert=require('node:assert/strict'),Engine=require('../engine.js'),{world}=require('./fixtures.cjs');
const game=new Engine(world),say=phrase=>{const index=game.node.choices.findIndex(c=>c.phrase===phrase);assert.ok(index>=0);game.choose(index);};
game.state.native='en';game.state.knowledge.cs=0;assert.deepEqual(game.reputation(),{person:0,city:0,country:0});
say('ada_rude');assert.deepEqual(game.reputation('ada'),{person:-18,city:-8,country:-3});assert.ok(game.canTalk('ada'));
game.open('ada',true,true);say('ada_ask');say('ada_answer');assert.ok(!game.available(game.node.choices.find(c=>c.phrase==='ada_accept')),'Distrust prevents persuasion');
game.open('ada',true,true);say('ada_rude');assert.ok(!game.canTalk('ada'),'Repeated intimidation closes conversation');
game.open('ada',true,true);assert.throws(()=>say('ada_ask'),/unavailable/);assert.ok(game.canHelpCommunity());
const day=game.state.voyageDay;while(game.canHelpCommunity())game.helpCommunity();assert.ok(game.state.voyageDay>day);assert.ok(game.canTalk('ada'));assert.deepEqual(game.reputation('ada'),{person:0,city:0,country:0});assert.throws(()=>game.helpCommunity(),/no reputation/);
say('ada_ask');say('ada_answer');say('ada_accept');assert.ok(game.reputation('ada').person>0);const saved={...game.reputation('ada')};game.open('ada',true,true);say('ada_ask');say('ada_answer');say('ada_accept');assert.deepEqual(game.reputation('ada'),saved,'Replaying a quest cannot farm reputation');
game.changeReputation(-100,-100,-100,'test');assert.ok(!game.canTalk('ada'));assert.ok(game.reputationAllows({effects:[{type:'resolve',id:'test'}]}),'Restitution remains possible');assert.ok(game.reputationAllows({effects:[{type:'reward',take:[{item:'bread',count:1}]}]}),'Local delivery remains possible');
const foreign=world.locations.find(l=>l.country!=='Czechia');game.state.location=foreign.id;assert.equal(game.reputation('ada').city,0);assert.equal(game.reputation('ada').country,0);assert.equal(game.reputation('ada').person,-90,'Personal reputation follows person');
game.state.location='prague';game.reset();assert.deepEqual(game.reputation('ada'),{person:0,city:0,country:0});assert.equal(game.canHelpCommunity(),false);
console.log('Passed: personal/city/country reputation, distrust gates, local recovery, quest gains, replay protection and reset.');

