const assert=require('node:assert/strict');
const {assembleWorld}=require('../content.js');
const World=assembleWorld(require('./fixtures.cjs').worldData,require('./fixtures.cjs').dialogueData);
const Engine=require('../engine.js');
const clone=value=>JSON.parse(JSON.stringify(value));
const world=clone(World);
world.items.sample={type:'dictionary',name:'Sample',from:'sk',to:'cs',entries:[
 {type:'word',source:'kľúč',translation:'klíč',forms:['kľúča']},
 {type:'verb',source:'hľadať',translation:'hledat',forms:['hľadám','hľadáš']}
]};
world.phrases.wordProbe={sk:'HĽADÁM kľúč, nie kľúčenku.',cs:'Hledám klíč, ne klíčenku.',en:'I seek a key, not a keyring.'};
world.phrases.inflectionProbe={sk:'Bez kľúča.',cs:'Bez klíče.'};
world.phrases.boundaryProbe={sk:'kľúčenka hľadajú',cs:'klíčenka hledají'};
const g=new Engine(world);g.state.inventory.sample=1;
assert.equal(g.notes('wordProbe','sk').length,0);g.read('sample');assert.equal(g.knowledge('sk'),2);
let notes=g.notes('wordProbe','sk');assert.equal(notes.length,2);assert.ok(notes.some(n=>n.kind==='verb'));assert.ok(notes.some(n=>n.kind==='word'));assert.ok(!notes.some(n=>n.text===world.phrases.wordProbe.cs));
assert.equal(g.notes('inflectionProbe','sk')[0].text,'kľúča → klíč');assert.equal(g.notes('boundaryProbe','sk').length,0);assert.equal(g.notes('wordProbe','cs').length,0);
g.read('sample');assert.equal(g.knowledge('sk'),2);
world.items.copy={...world.items.sample,name:'Copy'};g.state.inventory.copy=1;g.read('copy');assert.equal(g.knowledge('sk'),2);
g.state.easy=false;assert.equal(g.notes('wordProbe','sk').length,0);g.state.easy=true;
world.items.sample.entries.push({type:'phrase',phrase:'wordProbe'});g.read('sample');assert.equal(g.knowledge('sk'),5);assert.ok(g.notes('wordProbe','sk').some(n=>n.kind==='phrase'&&n.text===world.phrases.wordProbe.cs));
// Cyrillic is tokenized without losing word boundaries or case-insensitive forms.
g.state.inventory.uk_cs=1;g.read('uk_cs');assert.equal(g.knowledge('uk'),4);
world.phrases.ukProbe={uk:'Я ШУКАЮ зірку.',cs:'Hledám hvězdu.'};assert.equal(g.notes('ukProbe','uk').length,2);
// Old phrase-only content remains valid while JSON books use entries.
const legacy=clone(require('./fixtures.cjs').worldData);legacy.items.it_es.phrases=['bridge'];delete legacy.items.it_es.entries;assert.ok(assembleWorld(legacy,require('./fixtures.cjs').dialogueData));
const invalid=clone(require('./fixtures.cjs').worldData);invalid.items.sk_cs.entries.push({type:'verb',source:'hľadať',translation:'hledat',forms:['not a single word']});assert.throws(()=>assembleWorld(invalid,require('./fixtures.cjs').dialogueData));
console.log('Passed: mixed dictionary entries, partial hints, word boundaries, inflections, Cyrillic, direction, difficulty, deduplicated study, and validation.');
