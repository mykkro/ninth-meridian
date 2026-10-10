const assert=require('node:assert/strict'),Engine=require('../engine.js'),{world}=require('./fixtures.cjs');
const game=new Engine(world);game.open('marketFood');const initial=game.vendorGold(),gold=game.state.gold,price=world.items.bread.price;
game.buy('bread');assert.equal(game.vendorGold(),initial+price);assert.equal(game.state.gold,gold-price);game.buy('bread');assert.equal(game.vendorGold(),initial+price*2);
game.open('marketArms');assert.equal(game.vendorGold(),1000,'Separate vendor purse');game.open('marketFood');assert.equal(game.vendorGold(),initial+price*2,'Balance survives reopening');
game.state.gold=0;const before=JSON.stringify(game.state);assert.throws(()=>game.buy('bread'),/coins/);assert.equal(JSON.stringify(game.state),before,'Failed purchase moves no money');assert.throws(()=>game.buy('iron_sword'));assert.equal(game.vendorGold(),initial+price*2);
game.reset();assert.equal(game.vendorGold('marketFood'),initial);assert.equal(game.state.vendorPurses,undefined);
console.log('Passed: vendor purse receives payments, separate balances, reopening, failed purchase atomicity and new voyage reset.');
