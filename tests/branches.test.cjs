const assert=require('node:assert/strict');
const {assembleWorld}=require('../content.js');
const World=assembleWorld(require('./fixtures.cjs').worldData,require('./fixtures.cjs').dialogueData);
const Engine=require('../engine.js');
function say(g,phrase){const index=g.node.choices.findIndex(c=>c.phrase===phrase);assert.ok(index>=0,`Missing ${phrase}`);g.choose(index);}
function finish(g,id){say(g,id+'_ask');say(g,id+'_answer');say(g,id+'_accept');}
function prologue(g){finish(g,'ada');g.travel('bratislava');finish(g,'mira');say(g,'mira_alone');g.travel('krakow');finish(g,'zofia');g.travel('lviv');finish(g,'oles');g.travel('novgorod');finish(g,'lev');}
function west(g){g.travel('london');finish(g,'bea');}
function north(g){g.travel('berlin');finish(g,'otto');g.travel('amsterdam');finish(g,'sanne');g.travel('copenhagen');finish(g,'astrid');}
function south(g){
 g.travel('florence');assert.throws(()=>g.open('latinCodex'));finish(g,'luca');assert.equal(g.state.inventory.codex,1);assert.equal(g.state.inventory.latin_glossary,1);
 g.read('latin_glossary');g.read('codex');assert.equal(g.language,'la');assert.ok(g.notes().some(n=>n.kind==='word'));
 say(g,'latin_silly');assert.ok(!g.state.milestones.includes('latin_deciphered'));say(g,'latin_reread');say(g,'latin_list');assert.ok(!g.state.milestones.includes('latin_deciphered'));say(g,'latin_greece');assert.ok(g.state.milestones.includes('latin_deciphered'));
 g.read('codex');say(g,'latin_list');say(g,'latin_greece');assert.equal(g.state.milestones.filter(id=>id==='latin_deciphered').length,1);
 g.travel('lyon');finish(g,'camille');g.read('codex');assert.equal(g.language,'la');say(g,'latin_list');say(g,'latin_greece');g.travel('toledo');finish(g,'ines');
}
for(const order of [[west,north,south],[south,west,north]]){
 const g=new Engine(World);for(const id of ['london','berlin','florence','athens'])assert.equal(g.canTravel(id),false);
 prologue(g);for(const id of ['london','berlin','florence'])assert.equal(g.canTravel(id),true);
 assert.throws(()=>g.travel('amsterdam'));assert.throws(()=>g.travel('copenhagen'));assert.throws(()=>g.travel('toledo'));
 for(let i=0;i<order.length;i++){order[i](g);assert.equal(g.canTravel('athens'),i===2);}
 assert.equal(g.state.inventory.lens,1);assert.equal(g.state.inventory.ring,1);assert.equal(g.state.inventory.disc,1);
 delete g.state.inventory.ring;assert.equal(g.canTravel('athens'),false);assert.throws(()=>g.travel('athens'));g.state.inventory.ring=1;
 g.travel('athens');finish(g,'eleni');assert.ok(g.state.milestones.includes('greece'));assert.equal(g.ended,true);assert.equal(g.state.inventory.astrolabe,1);
 g.open('eleni');finish(g,'eleni');assert.equal(g.state.milestones.filter(id=>id==='greece').length,1);
 g.travel('london');finish(g,'bea');assert.equal(g.state.inventory.lens,1);
}
const locked=new Engine(World);locked.state.milestones=['novgorod','italy','france'];locked.travel('toledo');say(locked,'ines_ask');assert.throws(()=>say(locked,'ines_answer'));assert.equal(locked.canTravel('athens'),false);
const invalid=JSON.parse(JSON.stringify(require('./fixtures.cjs').worldData));invalid.locations.find(l=>l.id==='athens').requires.items.push('missing');assert.throws(()=>assembleWorld(invalid,require('./fixtures.cjs').dialogueData));
console.log('Passed: independent quest routes, two branch orders, Latin puzzle, prerequisite checks, three-relic reunion, completion, and replay protection.');
