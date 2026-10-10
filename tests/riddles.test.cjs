const assert=require('node:assert/strict');
const {world,worldData,dialogueData}=require('./fixtures.cjs');
const Engine=require('../engine.js');
const {assembleWorld}=require('../content.js');
const clone=value=>JSON.parse(JSON.stringify(value));
const sages=Object.entries(world.npcs).filter(([,npc])=>npc.riddles);
for(const [id,sage]of sages){const place=world.locations.find(place=>place.npcs.includes(id));assert.equal(sage.language,place.language);assert.ok(world.phrases.sage_greeting[sage.language]);for(const riddleId of sage.riddles)for(const text of [world.riddles[riddleId].question,world.riddles[riddleId].explanation,...world.riddles[riddleId].answers])assert.ok(text[sage.language]);}
const translated=new Engine(world);translated.state.location='berlin';translated.beginWager('anselm');translated.castRiddle('anselm','scroll_native');assert.equal(translated.state.inventory.scroll_native,0);assert.deepEqual(translated.riddleState().active.translations,['cs']);const castBefore=JSON.stringify(translated.state);assert.throws(()=>translated.castRiddle('anselm','scroll_native'));assert.equal(JSON.stringify(translated.state),castBefore);assert.deepEqual(translated.answerRiddle('anselm',1).translations,['cs']);
assert.equal(sages.length,5);assert.equal(Object.keys(world.riddles).length,10);
for(const [sage,npc]of sages){
 const game=new Engine(world),location=world.locations.find(place=>place.npcs.includes(sage));game.state.location=location.id;
 for(const book of location.riddleBooks){assert.ok(game.canConsult(book));const before=game.state.gold;game.consultBook(book);game.consultBook(book);assert.equal(game.state.gold,before);assert.equal(game.state.history.filter(e=>e.item===book).length,1);}
 for(const id of npc.riddles){
  const riddle=world.riddles[id],gold=game.state.gold;assert.equal(game.beginWager(sage),id);assert.equal(game.state.gold,gold-riddle.stake);
  let before=clone(game.state);assert.throws(()=>game.beginWager(sage));assert.deepEqual(game.state,before);
  for(const invalid of [-1,1.5,riddle.answers.length,'0']){assert.throws(()=>game.answerRiddle(sage,invalid));assert.deepEqual(game.state,before);}
  game.state.location='ash-temple';before=clone(game.state);assert.throws(()=>game.answerRiddle(sage,riddle.correct));assert.deepEqual(game.state,before);game.state.location=location.id;
  assert.equal(game.nextRiddle(sage),id,'Pending question survives leaving');
  assert.ok(game.answerRiddle(sage,riddle.correct).won);assert.equal(game.state.gold,gold+riddle.stake);
  before=clone(game.state);assert.throws(()=>game.answerRiddle(sage,riddle.correct));assert.deepEqual(game.state,before);
 }
 assert.equal(game.nextRiddle(sage),null);const before=clone(game.state);assert.throws(()=>game.beginWager(sage));assert.deepEqual(game.state,before);
 game.reset();assert.equal(Object.keys(game.state.riddleWagers.completed).length,0);
}
const game=new Engine(world);game.state.gold=99;let before=clone(game.state);assert.throws(()=>game.beginWager('radovan'));assert.deepEqual(game.state,before);
game.state.gold=100;game.beginWager('radovan');assert.equal(game.state.gold,0);const wrong=(world.riddles.echo.correct+1)%3;assert.equal(game.answerRiddle('radovan',wrong).won,false);assert.equal(game.state.gold,0);assert.equal(game.nextRiddle('radovan'),'shadow');
game.state.gold=1000;game.beginWager('radovan');game.state.location='berlin';before=clone(game.state);assert.throws(()=>game.beginWager('anselm'));assert.throws(()=>game.answerRiddle('anselm',0));assert.deepEqual(game.state,before);
assert.equal(game.canConsult('riddle_nature'),false);assert.throws(()=>game.consultBook('riddle_nature'));
for(const edit of [w=>w.riddles.echo.correct=9,w=>w.riddles.echo.stake=-1,w=>delete w.riddles.echo.question.cs,w=>w.npcs.anselm.riddles.push('echo'),w=>w.locations[0].riddleBooks=['missing'],w=>w.items.riddle_tools.pages[0].text.cs='']){const invalid=clone(worldData);edit(invalid);assert.throws(()=>assembleWorld(invalid,dialogueData));}
console.log('Passed: five sages, ten riddles, payouts/losses, pending wagers, no retry farming, local free books, and content validation.');
