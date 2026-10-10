const assert=require('node:assert/strict');
const {world,manifest,bundles}=require('./fixtures.cjs');
const {assembleContent}=require('../content.js'),Engine=require('../engine.js');
const books=require('../data/books.json');
assert.deepEqual(manifest.content.books,['books.json']);assert.equal(Object.keys(books).length,6);
for(const [id,book]of Object.entries(books)){
 assert.equal(book.pages.length,['lore_western_tides','lore_dawn_workshop','lore_eastern_letters'].includes(id)?6:3);assert.deepEqual(Object.keys(book.title).sort(),Object.keys(world.languages).sort());
 for(const language of Object.keys(world.languages))for(const page of book.pages){assert.ok(page.title[language]);assert.equal(page.text[language].split('\n\n').length,2);}
 assert.ok(world.locations.some(place=>place.loreBooks?.includes(id)),'Book reachable on a shelf');
}
const g=new Engine(world);const before=JSON.stringify(g.state);assert.throws(()=>g.consultBook('lore_invaders'));assert.equal(JSON.stringify(g.state),before);
g.consultBook('lore_alchemy');g.consultBook('lore_alchemy');assert.equal(g.state.history.filter(event=>event.item==='lore_alchemy').length,1);
g.state.location='london';assert.deepEqual(g.bookLanguages('lore_alchemy').map(value=>value.language),['en']);
g.state.companions=['rowan'];assert.deepEqual(g.bookLanguages('lore_alchemy').map(value=>value.language),['en','cs']);
g.state.companions=[];const count=g.state.inventory.scroll_native;assert.equal(g.translateBook('lore_alchemy','scroll_native'),'cs');assert.equal(g.state.inventory.scroll_native,count-1);
assert.ok(g.bookLanguages('lore_alchemy').some(value=>value.language==='cs'));const translated=JSON.stringify(g.state);assert.throws(()=>g.translateBook('lore_alchemy','scroll_native'));assert.equal(JSON.stringify(g.state),translated);
g.state.location='krakow';g.state.companions=['rowan'];assert.deepEqual(g.bookLanguages('lore_invaders').map(value=>value.language),['pl'],'Wrong interpreter cannot translate');
g.state.companions=['mira'];assert.deepEqual(g.bookLanguages('lore_invaders').map(value=>value.language),['pl','sk']);
for(const target of Object.keys(world.languages)){
 const copy=structuredClone(world);copy.companions.mira.outputs=[target];const game=new Engine(copy);game.state.location='krakow';game.state.companions=['mira'];
 assert.ok(game.bookLanguages('lore_invaders').some(value=>value.language===target),'All authored targets can be interpreted');
}
const invalid=structuredClone(bundles);delete invalid.books[0].lore_alchemy.pages[0].text.hu;assert.throws(()=>assembleContent(manifest,invalid),/missing lore translation hu/);
g.reset();g.state.location='london';assert.throws(()=>g.translateBook('lore_western_tides','scroll_native'),/scholar/);g.hireBookScholar('lore_western_tides','cs');g.state.voyageDay+=3;g.collectScholarBook('lore_western_tides');assert.equal(g.world.items.lore_western_tides.pages.length,6);assert.ok(g.bookLanguages('lore_western_tides').some(value=>value.language==='cs'));g.reset();assert.equal(g.state.loreTranslations,undefined);assert.equal(g.state.inventory.scroll_native,1);
console.log('Passed: separate lore pack, three- and six-page books in all 20 languages, paragraphs, local shelves, interpreter language rules, one-time consultation, atomic whole-book scrolls, and reset.');
