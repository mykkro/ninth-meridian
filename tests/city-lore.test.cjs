const assert=require('node:assert/strict');
const {world}=require('./fixtures.cjs');
const lore=require('../data/city-lore.json');
assert.deepEqual(Object.keys(lore).sort(),world.locations.map(place=>place.id).sort());
for(const place of world.locations){
 for(const language of ['cs','en']){
  const passage=lore[place.id][language];
  assert.equal(typeof passage,'string',`${place.id}: missing ${language} lore`);
  assert.ok(passage.length>100&&passage.length<650,`${place.id}: lore should be a short passage`);
 }
}
console.log(`Passed: bilingual lore for all ${world.locations.length} cities.`);
