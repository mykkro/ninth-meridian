const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),manifest=require('../data/world.json'),items={};
for(const file of manifest.content.items){const {id,...item}=JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8'));items[id]=item;}
for(const file of manifest.content.books)Object.assign(items,JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8')));
const shapes={
 tome:'<path fill="#513e47" d="M13 7h38v49H13q-7-4 0-11Z"/><path fill="#e7cca0" d="M13 45h38v11H13q-6-5 0-11Z"/><path d="M19 7v38M19 49h27M19 53h27"/><path fill="url(#metal)" d="M13 7h7v9h-7ZM44 7h7v9h-7ZM44 37h7v8h-7Z"/><path fill="ACCENT" d="M28 18h14v19H28Z"/><path fill="url(#metal)" d="m35 22 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z"/><path fill="url(#metal)" d="M47 27h7v7h-7Z"/>',
 book:'<path fill="#70443b" d="M14 10h34v44H14q-6-4 0-8Z"/><path fill="#f1dfb7" d="M14 46h34v8H14q-5-4 0-8Z"/><path d="M18 10v36M18 49h25"/><path fill="ACCENT" d="M27 19h13v18H27z"/><path d="m30 24 6 8m0-8-6 8"/>',
 scroll:'<path fill="#eed5a0" d="M18 10h29v40H19l-4-5V15Z"/><path fill="#c7a36a" d="M18 10q-8 0-8 6t8 6V10Zm1 34h30q8 0 5 10H20q-7 0-1-10Z"/><path d="M25 19h15M25 26h15M25 33h10"/><path stroke="ACCENT" d="m25 37 5 3 9-4"/>',
 map:'<path fill="#ead6a6" d="m7 14 16-5 18 6 16-5v40l-16 5-18-6-16 5Z"/><path d="M23 9v40M41 15v40"/><path stroke="#7897a4" d="m10 33 8-6 11 8 9-7 13 4"/><path stroke="#a15742" stroke-dasharray="3 3" d="m15 44 14-27 19 25"/><circle fill="ACCENT" cx="29" cy="17" r="3"/>',
 key:'<circle fill="url(#metal)" cx="20" cy="20" r="12"/><circle fill="#263e43" cx="20" cy="20" r="5"/><path fill="url(#metal)" d="m26 29 24 24 6-6-7-7-5 5-4-4 5-5-5-5-5 5-4-4Z"/>',
 star:'<path fill="#d5e0e8" d="m32 6 7 17 19 1-14 13 4 20-16-10-16 10 4-20L6 24l19-1Z"/><path stroke="#889eaa" d="m32 6 0 28 16 23M6 24l26 10 26-10M16 57l16-23"/><circle fill="ACCENT" cx="32" cy="33" r="4"/>',
 lens:'<circle fill="#aeccd5" cx="30" cy="29" r="21"/><circle fill="#72a5b6" cx="30" cy="29" r="15"/><path stroke="#e9f9ed" stroke-width="4" d="m21 22 10-7M17 30l2-4"/><path fill="url(#metal)" d="m42 44 10 12 5-5-11-11Z"/>',
 seal:'<path fill="ACCENT" d="m22 38-5 20 14-6 5 4 5-21"/><circle fill="#ab5945" cx="32" cy="27" r="20"/><circle fill="#c58254" cx="32" cy="27" r="14"/><path stroke="#f1c985" d="m32 16 4 7 8 2-6 6 1 9-7-4-7 4 1-9-6-6 8-2Z"/>',
 ring:'<ellipse fill="url(#metal)" cx="32" cy="37" rx="20" ry="19"/><ellipse fill="#263e43" cx="32" cy="37" rx="12" ry="12"/><path fill="ACCENT" d="m23 9 18 0 5 10-14 12-14-12Z"/><path d="m23 9 9 22 9-22M18 19h28"/>',
 disc:'<circle fill="url(#metal)" cx="32" cy="32" r="25"/><circle fill="#d59c4c" cx="32" cy="32" r="16"/><path d="M32 9v8m0 30v8M9 32h8m30 0h8M16 16l6 6m20 20 6 6M16 48l6-6m20-20 6-6"/><circle fill="#f4d798" cx="32" cy="32" r="8"/>',
 letter:'<path fill="#e9d9ae" d="M8 15h48v35H8Z"/><path d="m8 15 24 20 24-20M8 50l19-20m29 20L37 30"/><circle fill="#ab5945" cx="32" cy="35" r="6"/>',
 astrolabe:'<path fill="url(#metal)" d="M30 6h4v11h-4z"/><circle fill="none" stroke="#d9b778" stroke-width="4" cx="32" cy="35" r="23"/><circle fill="#37606a" cx="32" cy="35" r="18"/><path stroke="#e6c482" d="M14 35h36M32 17v36m-16-6 32-24M20 20l24 30"/><circle fill="#ddb573" cx="32" cy="35" r="5"/><circle fill="none" stroke="#d9b778" cx="32" cy="6" r="4"/>',
 compass:'<circle fill="url(#metal)" cx="32" cy="32" r="25"/><circle fill="#d9dfcf" cx="32" cy="32" r="19"/><path fill="#a85a47" d="m32 12 7 20-7 20-7-20Z"/><path fill="#547a86" d="m32 32 0 20-7-20Z"/><circle fill="#f5dda5" cx="32" cy="32" r="3"/>',
 token:'<path fill="#7495a3" d="m32 5 23 14v27L32 59 9 46V19Z"/><path fill="#d8bd84" d="m32 14 5 12 13 1-10 9 3 13-11-7-11 7 3-13-10-9 13-1Z"/>',
 bag:'<path fill="#b89d71" d="m23 9 17 0-4 11q20 11 19 30-22 12-46 0-1-19 19-30Z"/><path d="M23 22h18m-20 5 5 22m15-22-4 22"/><path fill="ACCENT" d="m29 31 9 0 4 10-9 6-9-6Z"/>',
 herbs:'<path stroke="#789161" stroke-width="3" d="m17 56 22-44m-13 29L15 20m15 13 20-8"/><path fill="ACCENT" d="m15 20-5-8 9-2 6 8-4 5Zm24-8 2-7 9 5-1 9-9 2Zm11 13 7 3-5 9-8 0-4-8Z"/><path fill="#7f9b6c" d="m27 37-13-5 1 9 10 3m8-12 9 10-10 2-6-6"/>',
 rope:'<ellipse fill="none" stroke="#bdaa7b" stroke-width="8" cx="30" cy="29" rx="19" ry="18"/><ellipse fill="none" stroke="#73563a" stroke-width="2" cx="30" cy="29" rx="19" ry="18"/><path fill="none" stroke="#bdaa7b" stroke-width="7" d="m47 30 7 13q5 14-12 14"/>',
 boots:'<path fill="#986646" d="M13 8h15v29l9 9v10H7V44l6-9Zm23 0h15v29l9 9v10H34V43l2-8Z"/><path stroke="#d1aa70" d="M16 18h9m-9 7h9m14-7h9m-9 7h9M7 51h30m-3 0h26"/>',
 cloak:'<path fill="ACCENT" d="M24 8h16l5 15 13 31q-25 9-52 0l13-31Z"/><path fill="#d2b88b" d="M24 8q-1 17 8 20 9-3 8-20Z"/><path d="M32 28v30M19 24l-5 28m31-28 5 28"/><circle fill="url(#metal)" cx="32" cy="27" r="4"/>',
 bread:'<path fill="#c79759" d="M8 48q-6-31 18-37 23-3 31 23 4 14-10 20H19Z"/><path stroke="#f1d0a0" stroke-width="4" d="m18 25 7 12m3-20 9 16m3-15 9 16"/>',
 cheese:'<path fill="#edcf7c" d="m8 22 35-14 14 40-42 8Z"/><path fill="#cba85d" d="m8 22 7 34 42-8-37-21Z"/><circle fill="#ae894a" cx="28" cy="38" r="4"/><circle fill="#ae894a" cx="45" cy="42" r="3"/><circle fill="#ae894a" cx="20" cy="48" r="2"/>',
 meat:'<path fill="#985a46" d="M10 27q-5-13 10-18 15-3 18 10l15 6q14 15-3 26-17 10-24-4Z"/><path stroke="#d7a580" d="m17 19 9 10m7 2 8 12m-19-8 4 6"/>',
 rations:'<path fill="#b9996d" d="m10 18 22-8 22 8v35l-22 7-22-7Z"/><path fill="#d5b58a" d="m10 18 22 8 22-8"/><path d="M32 26v34m-9-46 22 9v32M19 21v36"/>',
 flask:'<path fill="#839d9e" d="M24 8h16v13q17 8 14 29-21 13-44 0-3-21 14-29Z"/><path fill="#b18b58" d="M23 6h18v8H23Z"/><path stroke="#d5ddd3" stroke-width="4" d="M20 32q-5 8-3 13"/>',
 torch:'<path fill="#92734e" d="m27 27 11 2-5 29h-9Z"/><path fill="#de9c4d" d="M28 30Q7 17 28 5q-3 13 9 9 16 13-2 20Z"/><path fill="#f3d286" d="M28 27q-6-10 3-14 0 9 6 10-2 8-9 4Z"/>',
 bandage:'<path fill="#dfd1ad" d="m8 42 33-34 16 17-33 33Z"/><path fill="#bcb898" d="m20 32 14-14 12 13-13 15Z"/><path d="m14 40 7 7m20-27 7 7m-13 7 1 1m-7 3 1 1"/>',
 potion:'<path fill="#cad9ce" d="M24 7h16v14q21 16 14 31-22 11-44 0-7-15 14-31Z"/><path fill="ACCENT" d="M13 36h38q9 14-19 20-25-3-19-20Z"/><path fill="#b08c59" d="M23 5h18v10H23Z"/><path stroke="#f6f0d4" stroke-width="3" d="M20 30q-5 6-4 12"/>',
 arrows:'<path stroke="#b9a478" stroke-width="3" d="m15 55 31-42m-22 44 26-35m-43 24 25-34"/><path fill="#b4c2c7" d="m46 13 1-9 7 4-8 5m4 9 1-9 7 4-8 5M32 12l1-9 7 4-8 5"/><path stroke="ACCENT" stroke-width="5" d="m10 48 7 5m2-4 8 6m-2-9 8 6"/>',
 sword:'<path fill="#c7d1d4" d="m47 6 10 1-1 10-31 31-10-10Z"/><path d="m52 12-31 31"/><path fill="url(#metal)" d="m10 32 22 22 4-4-22-22Z"/><path fill="#865b43" d="m16 43 6 6-9 10-8-8Z"/>',
 bow:'<path fill="none" stroke="#b89361" stroke-width="6" d="M16 8q43 23 0 48"/><path fill="none" stroke="#d5ceb0" d="M16 8v48"/><path stroke="#bca474" stroke-width="3" d="M6 32h49"/><path fill="#c6d1d6" d="m55 32-7-6v12Z"/>',
 shield:'<path fill="#ae8352" d="M11 9h42v27q-3 17-21 24-18-7-21-24Z"/><path fill="#456775" d="M18 16h28v19q-3 13-14 18-11-5-14-18Z"/><path fill="#dac18b" d="M29 16h6v37h-6Z"/>',
 armor:'<path fill="#9f7151" d="m19 8 7 5h12l7-5 13 13-9 12-5-5v29H20V28l-5 5-9-12Z"/><path d="M26 13v44m12-44v44M20 24h24M20 42h24"/><path fill="url(#metal)" d="M20 39h24v6H20Z"/>',
 wood:'<path fill="#946c48" d="m8 37 32-22 16 20-32 23Z"/><ellipse fill="#c8aa72" cx="17" cy="47" rx="11" ry="10"/><ellipse fill="none" cx="17" cy="47" rx="6" ry="5"/><path d="m27 32 18-12m-11 17 15-11"/>',
 coins:'<ellipse fill="url(#metal)" cx="25" cy="45" rx="17" ry="8"/><path fill="url(#metal)" d="M8 36v9q17 13 34 0v-9Z"/><ellipse fill="#e9ce87" cx="25" cy="36" rx="17" ry="8"/><circle fill="url(#metal)" cx="43" cy="24" r="15"/><circle fill="none" stroke="#93713e" cx="43" cy="24" r="10"/><path d="m43 17 3 5 5 2-5 2-3 5-3-5-5-2 5-2Z"/>'
};
const explicit={map:'map',key:'key',irish_key:'key',star:'star',lens:'lens',seal:'seal',chart:'map',aurora_chart:'map',ring:'ring',letter:'letter',disc:'disc',astrolabe:'astrolabe',north_token:'token',scholar_compass:'compass',brass_compass:'compass',salt:'bag',ore:'bag',lavender:'herbs',flowers:'herbs',rope:'rope',travel_rope:'rope',river_boots:'boots',leather_boots:'boots',warm_cloak:'cloak',bread:'bread',cheese:'cheese',dried_meat:'meat',travel_rations:'rations',water_flask:'flask',torch:'torch',bandage:'bandage',arrows:'arrows',iron_sword:'sword',short_bow:'bow',wooden_shield:'shield',leather_armor:'armor',wood:'wood',healing_salve:'potion'};
const output=path.join(root,'assets','items');fs.mkdirSync(output,{recursive:true});
function create(id,item){
 const category=id==='coins'?'coins':item.format==='tome'?'tome':explicit[id]||(['dictionary','book','reference'].includes(item.type)?'book':item.type==='scroll'?'scroll':item.type==='potion'?'potion':id.endsWith('_seal')||id.endsWith('counterseal')?'seal':id.endsWith('_evidence')||id.endsWith('_proof')?'scroll':null);
 if(!category||!shapes[category])throw Error('Missing icon design: '+id);
 const colors=['#66969c','#89956b','#ac6557','#b79456','#7e84a3'],hash=[...id].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
 const accent=id==='health_potion'?'#b85c55':id==='stamina_potion'?'#c5a153':id==='antidote'?'#799c65':id==='lavender'?'#9580ad':colors[hash%colors.length];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>${item.name.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</title><defs><linearGradient id="metal" x2=".9" y2="1"><stop stop-color="#f0d9a3"/><stop offset=".5" stop-color="#d0a568"/><stop offset="1" stop-color="#a27943"/></linearGradient></defs><g stroke="#493a2c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${shapes[category].replaceAll('ACCENT',accent)}</g></svg>\n`;
 fs.writeFileSync(path.join(output,id+'.svg'),svg);
}
for(const [id,item]of Object.entries(items))create(id,item);create('coins',{name:'Coins',type:'currency'});
console.log(`Generated ${Object.keys(items).length} item icons and a currency icon.`);
