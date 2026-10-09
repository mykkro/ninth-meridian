// Read the same registered files as the browser, without a server.
const manifest=require('../data/world.json');
const files={'data/world.json':manifest};
const bundles={};
for(const [group,paths]of Object.entries(manifest.content))bundles[group]=paths.map(path=>{
 const value=require('../data/'+path);files['data/'+path]=value;return value;
});
const world=require('../content.js').assembleContent(manifest,bundles);
const {phrases,dialogues,...worldData}=world;
module.exports={manifest,bundles,files,world,worldData,dialogueData:{phrases,dialogues}};
