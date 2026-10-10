const assert=require('node:assert/strict'),Engine=require('../engine.js'),{world}=require('./fixtures.cjs');
const game=new Engine(world),gold=game.state.gold;
game.changeReputation(-30,-10,-4,'test');game.donateToTemple();
assert.equal(game.state.gold,gold-20);assert.deepEqual(game.reputation('ada'),{person:-30,city:-6,country:-3});assert.equal(game.state.voyageDay,0);
assert.equal(game.canDonate(),false);const snapshot=JSON.stringify(game.state);assert.throws(()=>game.donateToTemple(),/already/);assert.equal(JSON.stringify(game.state),snapshot);
game.state.location='bratislava';assert.equal(game.canDonate(),true);game.state.gold=19;const poor=JSON.stringify(game.state);assert.equal(game.canDonate(),false);assert.throws(()=>game.donateToTemple(),/coins/);assert.equal(JSON.stringify(game.state),poor,'Failed donation is atomic');
game.state.gold=20;game.donateToTemple();assert.equal(game.state.gold,0);assert.deepEqual(game.reputation('ada'),{person:-30,city:4,country:1});
game.state.location='prague';assert.equal(game.canDonate(),false,'Returning cannot buy more reputation');game.reset();assert.equal(game.canDonate(),true);assert.deepEqual(game.reputation('ada'),{person:0,city:0,country:0});
console.log('Passed: donation price, modest city/country gain, personal grievances retained, per-city limit, insufficient funds atomicity and reset.');
