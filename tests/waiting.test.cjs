const assert=require('node:assert/strict'),Engine=require('../engine.js'),{world}=require('./fixtures.cjs');
const game=new Engine(world),gold=game.state.gold;
game.waitHours(6);assert.equal(game.state.voyageHour,14);assert.equal(game.state.gold,gold);assert.equal(game.state.voyageDay,0);
let snapshot=JSON.stringify(game.state);assert.throws(()=>game.waitHours(6),/overnight/);assert.equal(JSON.stringify(game.state),snapshot);
assert.throws(()=>game.waitHours(-1));assert.throws(()=>game.rentRoom(0));
game.rentRoom(3);assert.equal(game.state.gold,gold-90);assert.equal(game.state.voyageDay,3);assert.equal(game.state.voyageHour,8);
assert.equal(game.reputationState().cities.prague,undefined,'Waiting does not repair trust');
game.state.gold=29;snapshot=JSON.stringify(game.state);assert.throws(()=>game.rentRoom(),/coins/);assert.equal(JSON.stringify(game.state),snapshot);
for(const city of world.locations.filter(l=>!['ash-temple','tide-shrine','star-abbey'].includes(l.id))){assert.ok(world.npcs[city.innkeeper]?.innkeeper);assert.equal(world.npcs[city.innkeeper].language,city.language);}
game.state.location='star-abbey';assert.throws(()=>game.rentRoom(),/city inn/);
assert.match(world.phrases.trust_refusal.de,/Ich vertraue dir nicht/);
for(const language of Object.keys(world.languages))assert.ok(world.phrases.trust_refusal[language]&&world.phrases.inn_greeting[language]);
console.log('PASS: free short waits, overnight boundary, paid rooms, atomic failures, city innkeepers and local refusals.');
