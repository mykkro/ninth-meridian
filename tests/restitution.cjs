const {say}=require('./irish-finale.cjs');
function makeRestitution(game,id){
 const quest=game.world.quests[id];
 const go=destination=>{
  if(game.state.location===destination)return;
  let options=game.transportOptions(destination);
  if(!options.length){
   if(game.world.locations.find(place=>place.id===game.state.location).country==='Ireland'){
    if(game.state.location!=='galway')game.travel('galway','carriage');
    game.travel('oslo','boat');
   }else if(game.world.locations.find(place=>place.id===destination).country==='Ireland'){
    game.travel('oslo','carriage');game.travel('galway','boat');
   }
   options=game.transportOptions(destination);
  }
  game.travel(destination,options[0].id);
 };
 go(quest.sourceLocation);game.gather(quest.sourceAction);
 go(quest.location);game.open(quest.giver);say(game,id+'_ask');say(game,'recovery_confirm');
}
module.exports={makeRestitution};
