(function(root){
  'use strict';
  function assembleWorld(worldData,dialogueData){
    const world={...worldData,...dialogueData};
    const check=(condition,message)=>{if(!condition)throw Error(`Invalid game content: ${message}`);};
    for(const key of ['languages','items','companions','npcs','phrases','dialogues','languageLearning'])check(world[key]&&typeof world[key]==='object',`missing ${key}`);
    check(Array.isArray(world.locations)&&world.locations.length>0,'missing locations');
    const locationIds=new Set(world.locations.map(l=>l.id));check(locationIds.size===world.locations.length,'duplicate location IDs');
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
      check(value.location===undefined||locationIds.has(value.location),`${context}: unknown required location`);
      check(value.items===undefined||Array.isArray(value.items),`${context}: invalid items requirement`);
      check(value.milestones===undefined||Array.isArray(value.milestones),`${context}: invalid milestones requirement`);
      for(const key of ['setbacks','withoutSetbacks','withoutMilestones'])check(value[key]===undefined||Array.isArray(value[key]),`${context}: invalid ${key} requirement`);
      for(const id of [...(value.setbacks||[]),...(value.withoutSetbacks||[])])check(world.quests[id]?.kind==='recovery',`${context}: unknown setback ${id}`);
      for(const id of value.withoutMilestones||[])check(milestones.has(id),`${context}: unknown excluded milestone ${id}`);
      for(const [id,count]of Object.entries(value.quantities||{}))check(world.items[id]&&Number.isInteger(count)&&count>0,`${context}: invalid quantity requirement`);
      for(const item of [...(value.items||[]),...(value.item?[value.item]:[])])check(world.items[item],`${context}: missing required item ${item}`);
      for(const id of [...(value.milestones||[]),...(value.milestone?[value.milestone]:[])])check(milestones.has(id),`${context}: unknown required milestone ${id}`);
    };
    for(const [id,riddle]of Object.entries(world.riddles||{})){
      check(Number.isInteger(riddle.stake)&&riddle.stake>0&&riddle.stake<=10000,`${id}: invalid riddle stake`);
      check(Array.isArray(riddle.answers)&&riddle.answers.length>=2&&Number.isInteger(riddle.correct)&&riddle.correct>=0&&riddle.correct<riddle.answers.length,`${id}: invalid riddle answers`);
      for(const language of ['en','cs']){for(const text of [riddle.question,riddle.explanation,...riddle.answers])check(typeof text?.[language]==='string'&&text[language].trim(),`${id}: missing riddle translation`);check(new Set(riddle.answers.map(a=>a[language])).size===riddle.answers.length,`${id}: duplicate riddle answers`);}
    }
    const assignedRiddles=new Set();
    if(world.quest.departureRequires){requirements(world.quest.departureRequires,'westward departure');check(milestones.has(world.quest.finalMilestone)&&milestones.has(world.quest.resolutionMilestone),'invalid conclusion milestones');}
    for(const [id,npc]of Object.entries(world.npcs))if(npc.riddles){
      check(Array.isArray(npc.riddles)&&npc.riddles.length>0,`${id}: invalid sage riddles`);
      for(const riddle of npc.riddles){check(world.riddles?.[riddle]&&!assignedRiddles.has(riddle),`${id}: unknown or reused riddle`);assignedRiddles.add(riddle);}
      const location=world.locations.find(place=>place.npcs.includes(id));check(location?.language===npc.language,`${id}: sage must speak the local language`);
      for(const phrase of ['sage_greeting','sage_correct','sage_incorrect','sage_finished'])check(world.phrases[phrase]?.[npc.language],`${id}: missing local sage speech`);
      for(const riddleId of npc.riddles)for(const text of [world.riddles[riddleId].question,world.riddles[riddleId].explanation,...world.riddles[riddleId].answers])check(typeof text[npc.language]==='string'&&text[npc.language].trim(),`${id}: missing local riddle translation`);
    }
    for(const [id,book]of Object.entries(world.items))if(book.type==='reference'){
      check(Array.isArray(book.pages)&&book.pages.length>0,`${id}: empty reference book`);
      for(const language of ['en','cs'])for(const text of [book.title,...book.pages.flatMap(page=>[page.title,page.text])])check(typeof text?.[language]==='string'&&text[language].trim(),`${id}: missing reference translation`);
    }
    for(const location of world.locations)if(location.riddleBooks)check(Array.isArray(location.riddleBooks)&&new Set(location.riddleBooks).size===location.riddleBooks.length&&location.riddleBooks.every(id=>world.items[id]?.type==='reference'),`${location.id}: invalid library shelf`);
    for(const location of world.locations)if(location.loreBooks)check(Array.isArray(location.loreBooks)&&new Set(location.loreBooks).size===location.loreBooks.length&&location.loreBooks.every(id=>world.items[id]?.lore),`${location.id}: invalid lore shelf`);
    for(const [id,book]of Object.entries(world.items))if(book.lore){
      check(book.type==='reference'&&book.pages.length>=3,`${id}: invalid lore book`);
      if(book.scholarTranslationCost!==undefined)check(Number.isInteger(book.scholarTranslationCost)&&book.scholarTranslationCost>0,`${id}: invalid scholar translation price`);
      check(['book','tome'].includes(book.format)&&Number.isFinite(book.weightKg)&&book.weightKg>0,`${id}: invalid book format or weight`);
      if(book.format==='tome')check(Number.isInteger(book.scholarTranslationDays)&&book.scholarTranslationDays>0&&book.scholarTranslationCost>0,`${id}: invalid tome translation service`);
      for(const language of Object.keys(world.languages)){
        for(const text of [book.title,...book.pages.flatMap(page=>[page.title,page.text])])check(typeof text?.[language]==='string'&&text[language].trim(),`${id}: missing lore translation ${language}`);
        for(const page of book.pages)check(page.text[language].split(/\n\s*\n/).filter(text=>text.trim()).length>=2,`${id}: missing lore paragraphs ${language}`);
      }
    }
    for(const [id,dialogue] of Object.entries(world.dialogues)){
      check(dialogue.nodes&&dialogue.nodes[dialogue.start],`${id}: missing start node`);
      for(const [nodeId,node] of Object.entries(dialogue.nodes)){
        const context=`${id}/${nodeId}`;
        check(world.phrases[node.phrase],`${context}: missing phrase ${node.phrase}`);
        check(node.contexts===undefined||Array.isArray(node.contexts),`${context}: invalid contextual lines`);
        for(const variant of node.contexts||[]){check(world.phrases[variant.phrase],`${context}: missing contextual phrase`);requirements(variant.requires,context);}
        check(!node.rumor||typeof node.rumor==='string'&&!node.outcome,`${context}: invalid rumor node`);
        check(Array.isArray(node.choices),`${context}: choices must be an array`);
        check(!node.outcome||['success','dismissed'].includes(node.outcome)&&node.choices.length===0,`${context}: invalid terminal outcome`);
        for(const choice of node.choices){
          check(choice.phrase&&world.phrases[choice.phrase],`${context}: missing response phrase ${choice.phrase}`);
          check(!choice.language||world.languages[choice.language]&&world.phrases[choice.phrase][choice.language],`${context}: invalid response language`);
          check(['sensible','nonsense','rude'].includes(choice.quality),`${context}: invalid response quality`);
          check(!choice.next||dialogue.nodes[choice.next],`${context}: missing next node ${choice.next}`);
          check(choice.companionOnly===undefined||typeof choice.companionOnly==='boolean',`${context}: invalid companion-only response`);
          check(choice.practice===undefined||typeof choice.practice==='boolean',`${context}: invalid practice flag`);
          check(!choice.recruitBlocked||dialogue.nodes[choice.recruitBlocked],`${context}: missing recruitment refusal node`);
          check((choice.effects||[]).filter(effect=>effect.type==='recruit').length<=1,`${context}: only one companion can join`);
          requirements(choice.requires,context);
          requirements(choice.visibleWhen,context);
          for(const effect of choice.effects||[]){
            check(['give','milestone','recruit','dismiss','reward','setback','resolve'].includes(effect.type),`${context}: unknown effect`);
            if(effect.type==='setback'||effect.type==='resolve')check(world.quests[effect.id]?.kind==='recovery',`${context}: unknown setback effect ${effect.id}`);
            if(effect.type==='reward'){check(typeof effect.id==='string'&&effect.id&&Number.isFinite(effect.gold||0)&&(effect.gold||0)>=0,`${context}: invalid reward`);for(const entry of [...(effect.take||[]),...(effect.items||[])])check(world.items[entry.item]&&Number.isInteger(entry.count)&&entry.count>0,`${context}: invalid reward item`);}
            if(effect.type==='give')check(world.items[effect.item],`${context}: missing reward item`);
            if(effect.type==='recruit')check(world.companions[effect.id]&&choice.recruitBlocked,`${context}: missing companion or recruitment refusal`);
            if(effect.type==='dismiss')check(world.companions[effect.id]&&choice.companionOnly,`${context}: invalid companion dismissal`);
            if(effect.type==='milestone')check(milestones.has(effect.id),`${context}: unknown milestone`);
          }
        }
      }
    }
    for(const [id,npc] of Object.entries(world.npcs)){
      check(world.languages[npc.language],`${id}: unknown language`);
      requirements(npc.requires,id);
      const dialogue=world.dialogues[npc.dialogue];check(dialogue,`${id}: missing dialogue`);
      for(const node of Object.values(dialogue.nodes))for(const phrase of [node.phrase,...(node.contexts||[]).map(c=>c.phrase),...node.choices.map(c=>c.phrase)])check(world.phrases[phrase][node.language||npc.language],`${id}: ${phrase} has no ${node.language||npc.language} text`);
      for(const item of npc.stock||[])check(world.items[item]&&Number.isFinite(world.items[item].price)&&world.items[item].price>=0,`${id}: invalid stock item ${item}`);
    }
    const actionIds=new Set();
    for(const location of world.locations){
      if(location.realm){check(typeof location.realm==='string'&&location.realm.trim(),`${location.id}: invalid realm title`);for(const language of ['en','cs'])check(typeof location.realmContext?.[language]==='string'&&location.realmContext[language].trim(),`${location.id}: missing realm brief`);}
      if(location.coordinates)check(Number.isFinite(location.coordinates.lon)&&location.coordinates.lon>=-180&&location.coordinates.lon<=180&&Number.isFinite(location.coordinates.lat)&&location.coordinates.lat>=-90&&location.coordinates.lat<=90,`${location.id}: invalid map coordinates`);
      check(world.languages[location.language],`${location.id}: unknown language`);
      check(Array.isArray(location.npcs)&&location.npcs.length>0,`${location.id}: missing NPCs`);
      for(const id of location.riddleBooks||[]){const book=world.items[id];check(book?.title?.[location.language]&&book.pages.every(page=>page.title[location.language]&&page.text[location.language]),`${location.id}: missing original reference-book edition ${id}`);}
      for(const npc of location.npcs)check(world.npcs[npc],`${location.id}: unknown NPC ${npc}`);
      requirements(location.requires,location.id);
      check(location.recoveryAccess===undefined||Array.isArray(location.recoveryAccess)&&location.recoveryAccess.every(id=>world.quests[id]?.kind==='recovery'),`${location.id}: invalid recovery access`);
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
    for(const [id,quest]of Object.entries(world.quests||{}))if(quest.kind==='recovery'){
      check(Number.isInteger(quest.delayDays)&&quest.delayDays>0,`${id}: invalid setback delay`);
      check(typeof quest.title==='string'&&quest.title&&typeof quest.description==='string'&&quest.description,`${id}: missing recovery text`);
      check(world.locations.find(l=>l.id===quest.location)?.npcs.includes(quest.giver),`${id}: invalid recovery giver`);
      const source=world.locations.find(l=>l.id===quest.sourceLocation)?.actions?.find(action=>action.id===quest.sourceAction);
      check(source&&source.item===quest.repairItem&&world.items[quest.repairItem],`${id}: missing recovery evidence`);
    }else if(quest.completion){
      check(milestones.has(quest.completion),`${id}: unknown quest completion`);
      if(quest.kind==='investigation'){
        check(milestones.has(quest.started)&&Array.isArray(quest.steps)&&quest.steps.length>0,`${id}: invalid investigation`);
        for(const step of quest.steps)check(milestones.has(step.milestone)&&typeof step.label==='string'&&step.label&&world.locations.find(l=>l.id===step.location)?.npcs.includes(step.giver),`${id}: invalid investigation lead`);
      }else{check(world.items[quest.fetchItem],`${id}: invalid side quest`);check(quest.fetchCount===undefined||Number.isInteger(quest.fetchCount)&&quest.fetchCount>0,`${id}: invalid fetch count`);}
      if(quest.giver)check(world.npcs[quest.giver]&&world.locations.find(l=>l.id===quest.location)?.npcs.includes(quest.giver),`${id}: invalid quest giver location`);
    }
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
      const npc=world.npcs[id],nodes=world.dialogues[npc?.dialogue]?.nodes;
      check(npc&&locationIds.has(companion.home)&&world.locations.find(l=>l.id===companion.home).npcs.includes(id),`${id}: invalid companion home`);
      check(nodes?.[companion.chatStart]&&nodes?.[companion.dismissedNode],`${id}: missing companion conversation or farewell`);
      requirements(companion.requires,id);
      for(const key of ['route','leaveAt','leaveBefore'])if(companion[key]!==undefined)check(Array.isArray(companion[key])&&companion[key].length>0&&companion[key].every(location=>locationIds.has(location)),`${id}: invalid companion travel rule`);
      if(companion.route||companion.leaveBefore)check(world.phrases[companion.departurePhrase]?.[npc.language],`${id}: missing departure line`);
      if(companion.leaveAt)check(world.phrases[companion.arrivalPhrase]?.[npc.language],`${id}: missing arrival line`);
    }
    return world;
  }
  const groups=['characters','items','locations','quests','dialogues','phrases','riddles','books'];
  function validateManifest(manifest){
    if(manifest.schemaVersion!==1||!manifest.content)throw Error('Invalid game content: unsupported or missing manifest schema');
    for(const group of groups){const paths=manifest.content[group];if(!Array.isArray(paths)||!paths.length||new Set(paths).size!==paths.length||paths.some(path=>typeof path!=='string'||! /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.json$/.test(path)))throw Error(`Invalid game content: invalid ${group} file list`);}
  }
  function assembleContent(manifest,bundles){
    validateManifest(manifest);
    const index=group=>{const result={};const entries=bundles[group];if(!Array.isArray(entries)||entries.length!==manifest.content[group].length)throw Error(`Invalid game content: incomplete ${group}`);for(const entry of entries){if(!entry||typeof entry.id!=='string'||!entry.id||result[entry.id])throw Error(`Invalid game content: missing or duplicate ${group} ID`);const {id,...data}=entry;result[id]=data;}return result;};
    const characters=index('characters'),items=index('items'),locations=index('locations'),quests=index('quests'),dialogues=index('dialogues');
    if(!Array.isArray(bundles.books)||bundles.books.length!==manifest.content.books.length)throw Error('Invalid game content: incomplete books');
    for(const pack of bundles.books)for(const [id,book]of Object.entries(pack)){if(items[id]||!book?.lore)throw Error(`Invalid game content: invalid or duplicate book ${id}`);items[id]=book;}
    const npcs={},companions={};for(const [id,character]of Object.entries(characters)){const {companion,...npc}=character;npcs[id]=npc;if(companion)companions[id]=companion;}
    const phrases={};if(!Array.isArray(bundles.phrases)||bundles.phrases.length!==manifest.content.phrases.length)throw Error('Invalid game content: incomplete phrases');
    for(const pack of bundles.phrases)for(const [id,texts]of Object.entries(pack)){if(phrases[id])throw Error(`Invalid game content: duplicate phrase ${id}`);phrases[id]=texts;}
    const quest=quests[manifest.activeQuest];if(!quest)throw Error('Invalid game content: missing active quest');
    return assembleWorld({languages:manifest.languages,languageLearning:manifest.languageLearning,riddles:index('riddles'),quest:{id:manifest.activeQuest,...quest},quests,items,npcs,companions,locations:Object.entries(locations).map(([id,data])=>({id,...data}))},{dialogues,phrases});
  }
  async function loadWorld(fetcher=root.fetch.bind(root)){
    const read=async path=>{const response=await fetcher(path,{cache:'no-cache'});if(!response.ok)throw Error(`Cannot load ${path}: HTTP ${response.status}`);return response.json();};
    const manifest=await read('data/world.json');validateManifest(manifest);
    const bundles=Object.fromEntries(await Promise.all(groups.map(async group=>[group,await Promise.all(manifest.content[group].map(path=>read('data/'+path)))])));
    return assembleContent(manifest,bundles);
  }
  const api={assembleWorld,assembleContent,loadWorld};
  if(typeof module!=='undefined')module.exports=api;else root.WorldContent=api;
})(globalThis);
