const assert=require('node:assert/strict');
const {assembleWorld,assembleContent,loadWorld}=require('../content.js');
const {manifest,bundles,files}=require('./fixtures.cjs');
const worldData=require('./fixtures.cjs').worldData;
const dialogueData=require('./fixtures.cjs').dialogueData;
const clone=value=>JSON.parse(JSON.stringify(value));
assert.ok(assembleWorld(worldData,dialogueData).dialogues.ada);
let invalid=clone(dialogueData);invalid.dialogues.ada.nodes.greeting.choices[0].next='missing';assert.throws(()=>assembleWorld(worldData,invalid));
invalid=clone(dialogueData);delete invalid.phrases.mira_ask.sk;assert.throws(()=>assembleWorld(worldData,invalid));
invalid=clone(worldData);invalid.items.sk_cs.entries.push({type:'phrase',phrase:'missing'});assert.throws(()=>assembleWorld(invalid,dialogueData));
invalid=clone(dialogueData);invalid.dialogues.ada.nodes.greeting.choices[0].quality='incorrect-tag';assert.throws(()=>assembleWorld(worldData,invalid));
async function testLoading(){
 const requested=[];
 const world=await loadWorld(async (path,options)=>{assert.equal(options.cache,'no-cache','Content revalidates after updates');requested.push(path);assert.ok(files[path],`Unknown file ${path}`);return {ok:true,json:async()=>clone(files[path])};});
 assert.equal(requested.length,Object.keys(files).length);assert.ok(world.phrases.mira_ask.sk);assert.equal(world.companions.mira.native,'sk');
 const duplicate=clone(bundles);duplicate.characters[1].id=duplicate.characters[0].id;assert.throws(()=>assembleContent(manifest,duplicate));
 const badManifest=clone(manifest);badManifest.content.items[0]='../outside.json';assert.throws(()=>assembleContent(badManifest,bundles));
 let failed=false;try{await loadWorld(async()=>({ok:false,status:404}));}catch(error){failed=true;assert.ok(error.message.includes('HTTP 404'));}assert.ok(failed);
 failed=false;try{await loadWorld(async()=>({ok:true,json:async()=>{throw new SyntaxError('Malformed JSON');}}));}catch(error){failed=true;assert.ok(error.message.includes('Malformed JSON'));}assert.ok(failed);
 console.log('Passed: JSON assembly, dialogue validation, fetched loading, and load failure handling.');
}
module.exports=testLoading();
