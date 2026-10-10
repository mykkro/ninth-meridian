function say(game,phrase){
 const index=game.node.choices.findIndex(choice=>choice.phrase===phrase);
 if(index<0)throw Error('Missing finale response: '+phrase);
 game.choose(index);
}
function investigateSanctuary(game,id){
 game.travel(id,'carriage');
 say(game,'sanctuary_ask');
 game.gather(id+'_search');
 say(game,'sanctuary_study');
 say(game,id+'_answer');
 say(game,'sanctuary_confirm');
}
function finishIreland(game,order=['ash-temple','tide-shrine','star-abbey']){
 if(game.state.location!=='galway')game.travel('galway','boat');
 game.open('niamh');say(game,'niamh_ask');say(game,'niamh_search');
 for(const id of order)investigateSanctuary(game,id);
 game.travel('galway','carriage');game.open('niamh');say(game,'niamh_ask');say(game,'niamh_accept');
}
module.exports={say,investigateSanctuary,finishIreland};
