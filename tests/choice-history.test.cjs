const assert=require('node:assert/strict'),Engine=require('../engine.js'),{world}=require('./fixtures.cjs');
const game=new Engine(world),choice=game.node.choices.find(choice=>choice.phrase==='ada_ask'),index=game.node.choices.indexOf(choice);
assert.equal(game.choiceUsed(choice,index),false);game.choose(index);game.open('ada',true,true);assert.equal(game.choiceUsed(choice,index),true);
const entry=game.state.conversations.flatMap(session=>session.entries).find(entry=>entry.speaker==='player');assert.equal(entry.node,'greeting');assert.equal(entry.choiceIndex,index);
const alternate=game.node.choices.find(choice=>choice.phrase==='askRumors');assert.equal(game.choiceUsed(alternate),false);
game.choose(index);const next=game.node.choices.find(choice=>choice.phrase==='ada_answer');assert.equal(game.choiceUsed(next),false,'Another node starts unused');
game.reset();assert.equal(game.choiceUsed(game.node.choices[index],index),false,'New voyage clears used choices');
console.log('Passed: exact dialogue-node and choice history, replay recognition, unused alternatives, and reset.');
