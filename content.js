(function(root){
  'use strict';
  function assembleWorld(worldData,dialogueData){
    const world={...worldData,...dialogueData};
    const check=(condition,message)=>{if(!condition)throw Error(`Invalid game content: ${message}`);};
    for(const key of ['languages','items','companions','npcs','phrases','dialogues','languageLearning'])check(world[key]&&typeof world[key]==='object',`missing ${key}`);
    check(Array.isArray(world.locations)&&world.locations.length>0,'missing locations');
    check(world.quest&&Array.isArray(world.quest.milestones),'missing quest milestones');
    const rules=world.languageLearning;
    for(const key of ['rudeThreshold','nonsenseThreshold','pointsPerEntry','pointsPerExchange'])check(Number.isFinite(rules[key])&&rules[key]>=0,`invalid learning rule ${key}`);
    check(rules.rudeThreshold<=rules.nonsenseThreshold&&rules.nonsenseThreshold<=100,'invalid knowledge thresholds');
    check(rules.pointsPerWord===undefined||Number.isFinite(rules.pointsPerWord)&&rules.pointsPerWord>=0,'invalid word learning points');
    const milestones=new Set([...(world.quest.milestones||[]),...Object.values(world.quests||{}).flatMap(quest=>quest.milestones||[])]);
    const requirements=(value,context)=>{
      if(!value)return;
      if(typeof value==='string'){check(milestones.has(value),`${context}: unknown milestone ${value}`);return;}
      check(typeof value==='object'&&!Array.isArray(value),`${context}: invalid requirements`);
      check(value.items===undefined||Array.isArray(value.items),`${context}: invalid items requirement`);
      check(value.milestones===undefined||Array.isArray(value.milestones),`${context}: invalid milestones requirement`);
      for(const [id,count]of Object.entries(value.quantities||{}))check(world.items[id]&&Number.isInteger(count)&&count>0,`${context}: invalid quantity requirement`);
      for(const item of [...(value.items||[]),...(value.item?[value.item]:[])])check(world.items[item],`${context}: missing required item ${item}`);
      for(const id of [...(value.milestones||[]),...(value.milestone?[value.milestone]:[])])check(milestones.has(id),`${context}: unknown required milestone ${id}`);
    };
    for(const [id,dialogue] of Object.entries(world.dialogues)){
      check(dialogue.nodes&&dialogue.nodes[dialogue.start],`${id}: missing start node`);
      for(const [nodeId,node] of Object.entries(dialogue.nodes)){
        const context=`${id}/${nodeId}`;
        check(world.phrases[node.phrase],`${context}: missing phrase ${node.phrase}`);
        check(!node.rumor||typeof node.rumor==='string'&&!node.outcome,`${context}: invalid rumor node`);
        check(Array.isArray(node.choices),`${context}: choices must be an array`);
        check(!node.outcome||['success','dismissed'].includes(node.outcome)&&node.choices.length===0,`${context}: invalid terminal outcome`);
        for(const choice of node.choices){
          check(choice.phrase&&world.phrases[choice.phrase],`${context}: missing response phrase ${choice.phrase}`);
          check(!choice.language||world.languages[choice.language]&&world.phrases[choice.phrase][choice.language],`${context}: invalid response language`);
          check(['sensible','nonsense','rude'].includes(choice.quality),`${context}: invalid response quality`);
          check(!choice.next||dialogue.nodes[choice.next],`${context}: missing next node ${choice.next}`);
          requirements(choice.requires,context);
          for(const effect of choice.effects||[]){
            check(['give','milestone','recruit','reward'].includes(effect.type),`${context}: unknown effect`);
            if(effect.type==='reward'){check(typeof effect.id==='string'&&effect.id&&Number.isFinite(effect.gold||0)&&(effect.gold||0)>=0,`${context}: invalid reward`);for(const entry of [...(effect.take||[]),...(effect.items||[])])check(world.items[entry.item]&&Number.isInteger(entry.count)&&entry.count>0,`${context}: invalid reward item`);}
            if(effect.type==='give')check(world.items[effect.item],`${context}: missing reward item`);
            if(effect.type==='recruit')check(world.companions[effect.id],`${context}: missing companion`);
            if(effect.type==='milestone')check(milestones.has(effect.id),`${context}: unknown milestone`);
          }
        }
      }
    }
    for(const [id,npc] of Object.entries(world.npcs)){
      check(world.languages[npc.language],`${id}: unknown language`);
      requirements(npc.requires,id);
      const dialogue=world.dialogues[npc.dialogue];check(dialogue,`${id}: missing dialogue`);
      for(const node of Object.values(dialogue.nodes))for(const phrase of [node.phrase,...node.choices.map(c=>c.phrase)])check(world.phrases[phrase][npc.language],`${id}: ${phrase} has no ${npc.language} text`);
      for(const item of npc.stock||[])check(world.items[item]&&Number.isFinite(world.items[item].price)&&world.items[item].price>=0,`${id}: invalid stock item ${item}`);
    }
    const locationIds=new Set(world.locations.map(l=>l.id));check(locationIds.size===world.locations.length,'duplicate location IDs');
    const actionIds=new Set();
    for(const location of world.locations){
      if(location.coordinates)check(Number.isFinite(location.coordinates.lon)&&location.coordinates.lon>=-180&&location.coordinates.lon<=180&&Number.isFinite(location.coordinates.lat)&&location.coordinates.lat>=-90&&location.coordinates.lat<=90,`${location.id}: invalid map coordinates`);
      check(world.languages[location.language],`${location.id}: unknown language`);
      check(Array.isArray(location.npcs)&&location.npcs.length>0,`${location.id}: missing NPCs`);
      for(const npc of location.npcs)check(world.npcs[npc],`${location.id}: unknown NPC ${npc}`);
      requirements(location.requires,location.id);
      check(location.actions===undefined||Array.isArray(location.actions),`${location.id}: invalid gathering actions`);
      for(const action of location.actions||[]){check(typeof action.id==='string'&&!actionIds.has(action.id),`${location.id}: duplicate or missing gathering ID`);actionIds.add(action.id);check(world.items[action.item]&&Number.isInteger(action.count)&&action.count>0&&Number.isInteger(action.limit)&&action.limit>=action.count,`${location.id}: invalid gathering resource`);check(typeof action.label==='string'&&action.label,`${location.id}: missing gathering label`);requirements(action.requires,action.id);}
    }
    check(world.locations.find(l=>l.id==='prague')?.npcs.includes('ada')&&world.languages.cs,'missing prototype starting location, NPC, or native language');
    for(const [id,item]of Object.entries(world.items)){
      check(item.purchaseQuantity===undefined||Number.isInteger(item.purchaseQuantity)&&item.purchaseQuantity>0,`${id}: invalid purchase quantity`);
      check(item.stackable===undefined||typeof item.stackable==='boolean',`${id}: invalid stackable flag`);
      check(item.stackable!==false||!item.purchaseQuantity||item.purchaseQuantity===1,`${id}: non-stackable bundle`);
      if(item.ammunition)check(world.items[item.ammunition]?.type==='ammunition',`${id}: missing ammunition`);
      if(item.compatibleWeapon)check(world.items[item.compatibleWeapon]?.type==='weapon',`${id}: missing compatible weapon`);
    }
    for(const [id,item]of Object.entries(world.items))if(item.type==='book')check(world.npcs[item.npc],`${id}: missing manuscript NPC`);
    for(const branch of world.quest.branches||[]){check(world.items[branch.item],`${branch.id}: missing branch relic`);check(Array.isArray(branch.locations)&&branch.locations.every(id=>locationIds.has(id)),`${branch.id}: invalid branch route`);}
    for(const [id,quest]of Object.entries(world.quests||{}))if(quest.completion){check(milestones.has(quest.completion)&&world.items[quest.fetchItem],`${id}: invalid side quest`);check(quest.fetchCount===undefined||Number.isInteger(quest.fetchCount)&&quest.fetchCount>0,`${id}: invalid fetch count`);if(quest.giver)check(world.npcs[quest.giver]&&world.locations.find(l=>l.id===quest.location)?.npcs.includes(quest.giver),`${id}: invalid quest giver location`);}
    for(const [id,item] of Object.entries(world.items))if(item.type==='dictionary'){
      check(world.languages[item.from]&&world.languages[item.to]&&(Array.isArray(item.entries)||Array.isArray(item.phrases)),`${id}: invalid dictionary`);
      check(item.entries===undefined||Array.isArray(item.entries),`${id}: entries must be an array`);
      check(item.phrases===undefined||Array.isArray(item.phrases),`${id}: phrases must be an array`);
      const entries=[...(item.entries||[]),...(item.phrases||[]).map(phrase=>({type:'phrase',phrase}))];
      for(const entry of entries){
        check(entry&&['phrase','word','verb'].includes(entry.type),`${id}: invalid entry type`);
        if(entry.type==='phrase')check(world.phrases[entry.phrase]?.[item.from]&&world.phrases[entry.phrase]?.[item.to],`${id}: missing dictionary translation ${entry.phrase}`);
        else{
          const singleWord=value=>typeof value==='string'&&/^[\p{L}\p{M}]+(?:[’'-][\p{L}\p{M}]+)*$/u.test(value);
          check(singleWord(entry.source)&&typeof entry.translation==='string'&&entry.translation.trim(),`${id}: invalid ${entry.type} entry`);
          check(entry.forms===undefined||Array.isArray(entry.forms)&&entry.forms.every(singleWord),`${id}: invalid word forms`);
        }
      }
    }
    for(const [id,companion]of Object.entries(world.companions)){
      check(world.languages[companion.native]&&Array.isArray(companion.knows)&&Array.isArray(companion.outputs),`${id}: invalid companion`);
      for(const lang of [...companion.knows,...companion.outputs])check(world.languages[lang],`${id}: unknown companion language`);
    }
    return world;
  }
  const groups=['characters','items','locations','quests','dialogues','phrases'];
  function validateManifest(manifest){
    if(manifest.schemaVersion!==1||!manifest.content)throw Error('Invalid game content: unsupported or missing manifest schema');
    for(const group of groups){const paths=manifest.content[group];if(!Array.isArray(paths)||!paths.length||new Set(paths).size!==paths.length||paths.some(path=>typeof path!=='string'||! /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.json$/.test(path)))throw Error(`Invalid game content: invalid ${group} file list`);}
  }
  function assembleContent(manifest,bundles){
    validateManifest(manifest);
    const index=group=>{const result={};const entries=bundles[group];if(!Array.isArray(entries)||entries.length!==manifest.content[group].length)throw Error(`Invalid game content: incomplete ${group}`);for(const entry of entries){if(!entry||typeof entry.id!=='string'||!entry.id||result[entry.id])throw Error(`Invalid game content: missing or duplicate ${group} ID`);const {id,...data}=entry;result[id]=data;}return result;};
    const characters=index('characters'),items=index('items'),locations=index('locations'),quests=index('quests'),dialogues=index('dialogues');
    const npcs={},companions={};for(const [id,character]of Object.entries(characters)){const {companion,...npc}=character;npcs[id]=npc;if(companion)companions[id]=companion;}
    const phrases={};if(!Array.isArray(bundles.phrases)||bundles.phrases.length!==manifest.content.phrases.length)throw Error('Invalid game content: incomplete phrases');
    for(const pack of bundles.phrases)for(const [id,texts]of Object.entries(pack)){if(phrases[id])throw Error(`Invalid game content: duplicate phrase ${id}`);phrases[id]=texts;}
    const quest=quests[manifest.activeQuest];if(!quest)throw Error('Invalid game content: missing active quest');
    return assembleWorld({languages:manifest.languages,languageLearning:manifest.languageLearning,quest:{id:manifest.activeQuest,...quest},quests,items,npcs,companions,locations:Object.entries(locations).map(([id,data])=>({id,...data}))},{dialogues,phrases});
  }
  async function loadWorld(fetcher=root.fetch.bind(root)){
    const read=async path=>{const response=await fetcher(path);if(!response.ok)throw Error(`Cannot load ${path}: HTTP ${response.status}`);return response.json();};
    const manifest=await read('data/world.json');validateManifest(manifest);
    const bundles=Object.fromEntries(await Promise.all(groups.map(async group=>[group,await Promise.all(manifest.content[group].map(path=>read('data/'+path)))])));
    return assembleContent(manifest,bundles);
  }
  const api={assembleWorld,assembleContent,loadWorld};
  if(typeof module!=='undefined')module.exports=api;else root.WorldContent=api;
})(globalThis);
