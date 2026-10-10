function say(game,phrase){
 const index=game.node.choices.findIndex(choice=>choice.phrase===phrase);
 if(index<0)throw Error(`Missing regional response ${phrase}`);
 game.choose(index);
}
const routes={
 german_route:{home:'berlin',giver:'otto',cities:[['leipzig','greta','konrad'],['hamburg','hannes','marta']]},
 italian_route:{home:'florence',giver:'luca',cities:[['bologna','paolo','chiara'],['venice','nadia','vittorio']]}
};
function investigateCity(game,[city,witness,expert],method='archive'){
 game.travel(city);game.open(witness);say(game,'regional_ask');say(game,'regional_record');
 game.open(expert);say(game,'regional_investigate');say(game,'regional_'+method);
 say(game,city+'_answer'+(method==='archive'?'A':'B'));say(game,'regional_confirm');
}
function investigateCountry(game,id,reverse=false,method='archive'){
 const route=routes[id];
 for(const city of reverse?[...route.cities].reverse():route.cities)investigateCity(game,city,method);
 game.travel(route.home);game.open(route.giver);say(game,'regional_regionAsk');say(game,'regional_report');
}
module.exports={say,routes,investigateCity,investigateCountry};
