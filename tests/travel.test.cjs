const assert=require('node:assert/strict');
const Engine=require('../engine.js');const {world}=require('./fixtures.cjs');
const g=new Engine(world);g.state.milestones.push('prague');
assert.equal(g.state.gold,100000);
const options=g.transportOptions('bratislava');
assert.deepEqual(options.map(option=>option.id),['carriage','horse']);
assert.ok(options[1].days<options[0].days);
assert.ok(options[1].cost>options[0].cost);
assert.equal(g.transportOptions('prague').length,0);
const original=JSON.stringify(g.state);
assert.throws(()=>g.travel('bratislava','boat'));
assert.equal(JSON.stringify(g.state),original);
g.state.gold=0;const poor=JSON.stringify(g.state);
assert.throws(()=>g.travel('bratislava','horse'));
assert.equal(JSON.stringify(g.state),poor);
g.state.gold=100000;g.travel('bratislava','horse');
assert.equal(g.state.gold,100000-options[1].cost);
assert.equal(g.state.voyageDay,options[1].days);
const event=g.state.history.at(-1);assert.equal(event.cost,options[1].cost);assert.equal(event.transport,'Hire a horse');
const atRest=JSON.stringify(g.state.history),purse=g.state.gold,day=g.state.voyageDay;
g.travel('bratislava');assert.equal(g.state.gold,purse);assert.equal(g.state.voyageDay,day);assert.equal(JSON.stringify(g.state.history),atRest);
g.state.location='london';assert.ok(g.transportOptions('galway').some(option=>option.id==='boat'));
assert.deepEqual(g.transportOptions('prague'),[]);
g.state.location='berlin';g.state.milestones.push('novgorod');
const beforeSea=JSON.stringify(g.state);
assert.deepEqual(g.transportOptions('london'),[]);
assert.throws(()=>g.travel('london','horse'),/unavailable/);
assert.throws(()=>g.travel('london','carriage'),/unavailable/);
assert.throws(()=>g.travel('london','boat'),/unavailable/);
assert.equal(JSON.stringify(g.state),beforeSea);
g.state.location='hamburg';
assert.deepEqual(g.transportOptions('london').map(option=>option.id),['boat']);
g.travel('london','boat');assert.equal(g.state.location,'london');
// Returning from either island requires a port, with land transport available after disembarking.
for(const islandPort of ['london','galway']){
 g.state.location=islandPort;
 for(const inland of ['prague','berlin','florence'])assert.deepEqual(g.transportOptions(inland),[]);
 for(const port of ['hamburg','amsterdam','venice']){
  assert.deepEqual(g.transportOptions(port).map(option=>option.id),['boat']);
  for(const transport of ['horse','carriage'])assert.throws(()=>g.travel(port,transport),/unavailable|quest trail/);
 }
}
g.state.location='london';g.travel('hamburg','boat');
assert.deepEqual(g.transportOptions('berlin').map(option=>option.id),['carriage','horse']);
g.travel('berlin','carriage');assert.equal(g.state.location,'berlin');
g.state.location='amsterdam';
const coastal=g.transportOptions('hamburg');
assert.deepEqual(coastal.map(option=>option.id),['carriage','horse','boat']);
assert.ok(coastal[2].days<coastal[0].days);
g.state.location='bratislava';const solo=g.transportOptions('krakow');
g.state.companions=['mira'];const party=g.transportOptions('krakow');
assert.equal(party[1].quantity,2);assert.equal(party[1].label,'Hire two horses');
assert.equal(party[1].cost,solo[1].cost*2);
assert.equal(party[0].quantity,1);assert.equal(party[0].cost,solo[0].cost);
assert.equal(party[1].days,solo[1].days);
const leaving=g.transportOptions('london');assert.deepEqual(leaving,[]);
g.state.location='berlin';assert.equal(g.transportOptions('prague')[1].quantity,1);
g.reset();assert.equal(g.state.gold,100000);assert.equal(g.state.voyageDay,0);
console.log('Passed: paid transport, route availability, fares, time, insufficient funds, failure atomicity, port-only sea crossings, coastal boats, companion horse hire, and reset.');
