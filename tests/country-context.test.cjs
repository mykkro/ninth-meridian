const assert=require('node:assert/strict');
const {world}=require('./fixtures.cjs');
const briefs=require('../data/country-context.json');
const countries=new Set(world.locations.map(location=>location.country));
assert.deepEqual(Object.keys(briefs).sort(),[...countries].sort());
for(const country of countries){
  for(const language of ['cs','en']){
    const text=briefs[country][language];
    assert.equal(typeof text,'string',`${country}: missing ${language} introduction`);
    assert.ok(text.length>100&&text.length<650,`${country}: ${language} introduction must stay brief`);
  }
}
console.log(`Passed: Czech/English introductions for all ${countries.size} countries.`);
