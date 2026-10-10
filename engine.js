(function(root){
  'use strict';
  class DialogueEngine {
    constructor(world){this.world=world;this.reset();}
    reset(){this.state={native:'cs',easy:true,gold:60,location:'prague',visitedLocations:['prague'],inventory:{scroll_en:1,scroll_native:1},learned:[],companions:[],metCompanions:[],companionLocations:{},companionNotice:null,milestones:[],knowledge:{cs:100},studiedEntries:[],practicedExchanges:[],rumors:[],rewarded:[],gathered:{}};this.open('ada');}
    get companionId(){return this.state.companions[0]||null;}
    companionLocation(id){return this.state.companionLocations[id]||this.world.companions[id]?.home;}
    npcsHere(){const place=this.world.locations.find(l=>l.id===this.state.location);return [...new Set([...place.npcs.filter(id=>!this.world.companions[id]||this.companionLocation(id)===place.id),...Object.keys(this.world.companions).filter(id=>id!==this.companionId&&this.companionLocation(id)===place.id)])];}
    recruitCompanion(id){const companion=this.world.companions[id];if(companion&&this.companionId===id)return;if(!companion||!this.npcsHere().includes(id)||!this.meets(this.world.npcs[id].requires)||!this.meets(companion.requires))throw Error('This companion cannot join you here yet.');if(this.companionId&&this.companionId!==id)throw Error('Dismiss your current companion before recruiting another.');this.state.companions=[id];if(!this.state.metCompanions.includes(id))this.state.metCompanions.push(id);if(this.state.companionNotice?.id===id)this.state.companionNotice=null;}
    dismissCompanion(id=this.companionId,showFarewell=true){if(!id||this.companionId!==id)throw Error('That companion is not travelling with you.');this.state.companionLocations[id]=this.state.location;this.state.companions=[];this.companionConversation=false;if(showFarewell){this.open(id);this.nodeId=this.world.companions[id].dismissedNode;this.ended=!!this.node.outcome;}}
    talkCompanion(){if(!this.companionId)throw Error('You have no travelling companion.');this.open(this.companionId);this.nodeId=this.world.companions[this.companionId].chatStart;this.companionConversation=true;this.ended=!!this.node.outcome;this.recordCurrentRumor();}
    leaveCompanion(id,location,reason){const companion=this.world.companions[id];const phrase=reason==='arrival'?companion.arrivalPhrase:companion.departurePhrase;this.state.companionNotice={id,location,reason,phrase,language:this.world.npcs[id].language,notes:this.notes(phrase,this.world.npcs[id].language,null)};this.state.companionLocations[id]=location;this.state.companions=[];}
    gatheringActions(){return this.world.locations.find(l=>l.id===this.state.location).actions||[];}
    canGather(id){const action=this.gatheringActions().find(a=>a.id===id);return !!action&&this.meets(action.requires)&&(this.state.gathered[id]||0)+action.count<=action.limit;}
    gather(id){const action=this.gatheringActions().find(a=>a.id===id);if(!action||!this.canGather(id))throw Error('Cannot gather here yet, or this source is exhausted.');this.state.inventory[action.item]=(this.state.inventory[action.item]||0)+action.count;this.state.gathered[id]=(this.state.gathered[id]||0)+action.count;return action;}
    missingRequirements(requirements){if(!requirements)return [];if(typeof requirements==='string')requirements={milestone:requirements};return [...Object.entries(requirements.quantities||{}).filter(([id,count])=>(this.state.inventory[id]||0)<count).map(([id,count])=>({type:'item',id,count:count-(this.state.inventory[id]||0)})),...[...(requirements.items||[]),...(requirements.item?[requirements.item]:[])].filter(id=>!this.state.inventory[id]).map(id=>({type:'item',id})),...[...(requirements.milestones||[]),...(requirements.milestone?[requirements.milestone]:[])].filter(id=>!this.state.milestones.includes(id)).map(id=>({type:'milestone',id}))];}
    reward(effect){if(this.state.rewarded.includes(effect.id))return;for(const entry of effect.take||[])if((this.state.inventory[entry.item]||0)<entry.count)throw Error('Required item missing');for(const entry of effect.take||[])this.state.inventory[entry.item]-=entry.count;this.state.gold+=effect.gold||0;for(const entry of effect.items||[])this.state.inventory[entry.item]=(this.state.inventory[entry.item]||0)+entry.count;this.state.rewarded.push(effect.id);}
    knowledge(language=this.language){return language===this.state.native?100:(this.state.knowledge[language]||0);}
    gainKnowledge(language,points){if(language!==this.state.native)this.state.knowledge[language]=Math.min(100,this.knowledge(language)+points);}
    visible(choice){const rules=this.world.languageLearning;const score=this.knowledge();return !(choice.companionOnly&&this.companionId!==this.npcId||choice.quality==='rude'&&score>=rules.rudeThreshold||choice.quality==='nonsense'&&score>=rules.nonsenseThreshold);}
    visibleChoices(){return this.node.choices.map((choice,index)=>({choice,index})).filter(({choice})=>this.visible(choice));}
    get npc(){return this.world.npcs[this.npcId];}
    get language(){return this.node.language||this.npc.language;}
    meets(requirements){if(!requirements)return true;if(typeof requirements==='string')return this.state.milestones.includes(requirements);return (!requirements.location||requirements.location===this.state.location)&&Object.entries(requirements.quantities||{}).every(([id,count])=>(this.state.inventory[id]||0)>=count)&&(!requirements.item||!!this.state.inventory[requirements.item])&&(!requirements.milestone||this.state.milestones.includes(requirements.milestone))&&(requirements.items||[]).every(id=>!!this.state.inventory[id])&&(requirements.milestones||[]).every(id=>this.state.milestones.includes(id));}
    canTravel(id){const place=this.world.locations.find(l=>l.id===id);return !!place&&this.meets(place.requires);}
    get node(){return this.world.dialogues[this.npc.dialogue].nodes[this.nodeId];}
    get phraseId(){return this.node.contexts?.find(context=>this.meets(context.requires))?.phrase||this.node.phrase;}
    get phrase(){return this.world.phrases[this.phraseId];}
    open(id){const carriedBook=Object.entries(this.world.items).some(([itemId,item])=>item.type==='book'&&item.npc===id&&this.state.inventory[itemId]);if(!this.world.npcs[id]||!this.npcsHere().includes(id)&&this.companionId!==id&&!carriedBook)throw Error('NPC is not here.');if(!this.meets(this.world.npcs[id].requires))throw Error('Required item missing');if(this.world.companions[id]&&!this.state.metCompanions.includes(id))this.state.metCompanions.push(id);this.npcId=id;this.nodeId=this.world.dialogues[this.npc.dialogue].start;this.companionConversation=false;this.state.knowledge[this.language]??=0;this.scrollNote=null;this.lastResponse=null;this.ended=!!this.node.outcome;this.recordCurrentRumor();}
    travel(id){const moving=id!==this.state.location;const place=this.world.locations.find(l=>l.id===id);if(!this.canTravel(id))throw Error('Follow the quest trail before travelling here.');if(moving){const companion=this.world.companions[this.companionId];if(companion&&(companion.route&&!companion.route.includes(id)||companion.leaveBefore?.includes(id)))this.leaveCompanion(this.companionId,this.state.location,'departure');}this.state.location=id;if(!this.state.visitedLocations.includes(id))this.state.visitedLocations.push(id);const companion=this.world.companions[this.companionId];if(moving&&companion?.leaveAt?.includes(id))this.leaveCompanion(this.companionId,id,'arrival');this.open(this.npcsHere()[0]);}
    canBuy(id){const item=this.world.items[id];return !!item&&!!this.node.shop&&!!this.npc.stock?.includes(id)&&Number.isFinite(item.price)&&item.price>=0&&this.state.gold>=item.price&&!((item.type==='dictionary'||item.stackable===false)&&this.state.inventory[id]);}
    buy(id){const item=this.world.items[id];if(!this.node.shop||!this.npc.stock?.includes(id))throw Error('This item is not sold here.');if((item.type==='dictionary'||item.stackable===false)&&this.state.inventory[id])throw Error(item.type==='dictionary'?'You already own this book.':'You already own this equipment.');if(!this.canBuy(id))throw Error('Not enough coins.');this.state.gold-=item.price;this.state.inventory[id]=(this.state.inventory[id]||0)+(item.purchaseQuantity||1);}
    dictionaryEntries(book){return [...(book.entries||[]),...(book.phrases||[]).map(phrase=>({type:'phrase',phrase}))];}
    read(id){if(this.state.inventory[id]&&this.world.items[id].type==='book'){this.open(this.world.items[id].npc);return;}if(!this.state.inventory[id]||this.world.items[id].type!=='dictionary')throw Error('You need to own this phrasebook.');if(!this.state.learned.includes(id))this.state.learned.push(id);const book=this.world.items[id];for(const value of this.dictionaryEntries(book)){const entry=`${book.from}:${value.type==='phrase'?'phrase:'+value.phrase:'lexeme:'+value.source.normalize('NFC').toLocaleLowerCase()}`;if(!this.state.studiedEntries.includes(entry)){this.state.studiedEntries.push(entry);this.gainKnowledge(book.from,value.type==='phrase'?this.world.languageLearning.pointsPerEntry:(this.world.languageLearning.pointsPerWord??1));}}}
    notes(phraseId=this.phraseId,source=this.language,scrollNote=this.scrollNote){const result=[];const phrase=this.world.phrases[phraseId];if(!phrase)return result;const add=(language,text,via,kind='phrase')=>{if(text&&!result.some(n=>n.language===language&&n.text===text&&n.kind===kind))result.push({language,text,via,kind});};
      if(this.state.easy){const tokens=new Set((phrase[source]||'').normalize('NFC').toLocaleLowerCase().match(/[\p{L}\p{M}]+(?:[’'-][\p{L}\p{M}]+)*/gu)||[]);for(const id of this.state.learned){const book=this.world.items[id];if(book.from!==source)continue;for(const entry of this.dictionaryEntries(book)){if(entry.type==='phrase'){if(entry.phrase===phraseId)add(book.to,phrase[book.to],book.name);}else{const forms=[entry.source,...(entry.forms||[])];const matched=forms.find(form=>tokens.has(form.normalize('NFC').toLocaleLowerCase()));if(matched)add(book.to,`${matched} → ${entry.translation}`,book.name,entry.type);}}}}
      for(const id of this.state.companions){const c=this.world.companions[id];if(c.knows.includes(source))for(const language of c.outputs)if(language!==source)add(language,phrase[language],c.name);}
      if(scrollNote&&scrollNote.phrases.includes(phraseId))add(scrollNote.language,phrase[scrollNote.language],'Translation scroll');return result;
    }
    cast(id){const item=this.world.items[id];if(!item||item.type!=='scroll'||!this.state.inventory[id])throw Error('No scroll available.');const language=item.target==='native'?this.state.native:item.target;const phrases=[this.phraseId,...this.visibleChoices().map(({choice})=>choice.phrase).filter(Boolean)];if(!phrases.every(p=>this.world.phrases[p]?.[language]))throw Error('No authored translation exists for this language; scroll was kept.');if(this.scrollNote)throw Error('This line already has a scroll translation.');this.state.inventory[id]--;this.scrollNote={language,text:this.phrase[language],phrases};this.recordCurrentRumor();}
    recordCurrentRumor(){if(!this.node.rumor)return;let rumor=this.state.rumors.find(r=>r.id===this.node.rumor);if(!rumor){rumor={id:this.node.rumor,phrase:this.phraseId,npcId:this.npcId,language:this.language,scrollNotes:[]};this.state.rumors.push(rumor);}if(this.scrollNote)rumor.scrollNotes=this.notes(rumor.phrase).filter(n=>n.via==='Translation scroll');}
    rumorNotes(rumor){const notes=this.notes(rumor.phrase,rumor.language,null);for(const note of rumor.scrollNotes)if(!notes.some(n=>n.language===note.language&&n.text===note.text))notes.push(note);return notes;}
    available(choice){return this.visible(choice)&&this.meets(choice.requires)&&!(choice.effects||[]).some(e=>e.type==='reward'&&(this.state.rewarded.includes(e.id)||(e.take||[]).some(entry=>(this.state.inventory[entry.item]||0)<entry.count)));}
    choose(index){
      const choice=this.node.choices[index];
      if(this.ended||!choice||!this.available(choice))throw Error('That choice is unavailable.');
      this.lastResponse=choice.phrase?{phrase:choice.phrase,language:choice.language||this.language,notes:this.notes(choice.phrase,choice.language||this.language)}:null;
      const recruit=(choice.effects||[]).find(effect=>effect.type==='recruit');
      if(recruit&&this.companionId&&this.companionId!==recruit.id){
        if(!choice.recruitBlocked)throw Error('Dismiss your current companion before recruiting another.');
        this.nodeId=choice.recruitBlocked;this.scrollNote=null;this.ended=!!this.node.outcome;this.recordCurrentRumor();return;
      }
      for(const effect of choice.effects||[]){
        if(effect.type==='reward')this.reward(effect);
        else if(effect.type==='give')this.state.inventory[effect.item]=Math.max(1,this.state.inventory[effect.item]||0);
        else if(effect.type==='milestone'){if(!this.state.milestones.includes(effect.id))this.state.milestones.push(effect.id);}
        else if(effect.type==='recruit')this.recruitCompanion(effect.id);
        else if(effect.type==='dismiss')this.dismissCompanion(effect.id,false);
        else throw Error('Unknown effect.');
      }
      const exchange=`${this.npcId}:${this.nodeId}`;
      if(choice.quality==='sensible'&&!this.state.practicedExchanges.includes(exchange)){this.state.practicedExchanges.push(exchange);this.gainKnowledge(this.language,this.world.languageLearning.pointsPerExchange);}
      this.scrollNote=null;
      if(choice.next){this.nodeId=choice.next;this.ended=!!this.node.outcome;}else this.ended=true;
      this.recordCurrentRumor();
    }

  }
  if(typeof module!=='undefined')module.exports=DialogueEngine;else root.DialogueEngine=DialogueEngine;
})(globalThis);
