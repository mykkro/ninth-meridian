(function(root){
  const countries={"Czechia": "bohemia", "Slovakia": "upper-hungary", "Poland": "poland", "Ukraine": "ruthenia", "Russia": "novgorod", "England (Britain)": "england", "Germany": "empire", "Netherlands": "netherlands", "Denmark": "denmark", "Italy": "italy", "Republic of Florence": "florence", "Republic of Venice": "venice", "Papal States": "papal-states", "Crown of Castile": "castile", "County of Holland": "holland", "Kingdom of Denmark · Kalmar Union": "denmark", "Kingdom of Norway · Kalmar Union": "norway", "Kingdom of Sweden": "sweden", "Österland · Kingdom of Sweden": "sweden", "Duchy of Athens": "greece", "France": "france", "Spain": "spain", "Greece": "greece", "Norway": "norway", "Sweden": "sweden", "Finland": "sweden", "Hungary": "hungary", "Ireland": "ireland"};
  const country=name=>'assets/heraldry/country-'+countries[name]+'.svg';
  const city=id=>'assets/heraldry/city-'+id+'.svg';
  const api={countries,country,city};
  if(typeof module!=='undefined')module.exports=api;else root.VoyageHeraldry=api;
})(globalThis);
