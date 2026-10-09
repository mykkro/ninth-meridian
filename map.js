(function(root){
 'use strict';
 const EUROPE_VIEW=[300,30,110,86.7];
 const NS='http://www.w3.org/2000/svg';
 const relief=typeof module!=='undefined'?require('./relief.js'):root.VoyageRelief;
 const project=([lon,lat])=>[(lon+180)*2,(90-lat)*2];
 const countryName=name=>name==='England (Britain)'?'United Kingdom':name;
 function countryBounds(feature,projector=project){
  if(feature.properties.ADMIN==='Russia'){const points=[[27,52],[27,66],[38,52],[38,66]].map(projector);return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];} // Western Russia, including Novgorod.
  const points=feature.geometry.coordinates.flat(feature.geometry.type==='MultiPolygon'?2:1).filter(([lon,lat])=>lon>=-25&&lon<=45&&lat>=34&&lat<=72).map(projector);
  return points.length?[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]:null;
 }
 function discoveredView(paths,world,game,projector=project){
  const visitedIds=new Set(game.state.visitedLocations||[game.state.location]);
  const visited=world.locations.filter(location=>visitedIds.has(location.id)||game.canTravel(location.id));
  const names=new Set(visited.map(l=>countryName(l.country)));
  const bounds=paths.filter(p=>names.has(p.name)&&p.bounds).map(p=>p.bounds);
  for(const location of visited){const [x,y]=projector([location.coordinates.lon,location.coordinates.lat]);bounds.push([x,y,x,y]);}
  const left=Math.min(...bounds.map(b=>b[0]))-2,right=Math.max(...bounds.map(b=>b[2]))+2,top=Math.min(...bounds.map(b=>b[1]))-2,bottom=Math.max(...bounds.map(b=>b[3]))+2;
  return [left,top,right-left,bottom-top];
 }
 function geometryPath(geometry,projector=project){const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];return polygons.map(polygon=>polygon.map(ring=>ring.map((point,i)=>{const [x,y]=projector(point);return `${i?'L':'M'}${x.toFixed(3)},${y.toFixed(3)}`;}).join(' ')+' Z').join(' ')).join(' ');}
 function markerState(game,location){return location.id===game.state.location?'current':game.state.milestones.includes(location.milestone||location.id)?'visited':game.canTravel(location.id)?'available':'locked';}
 class VoyageMap{
  constructor(container,geojson,world,game,travel,translate,requirements){this.container=container;this.world=world;this.game=game;this.travel=travel;this.t=translate;this.requirements=requirements;this.view=[...EUROPE_VIEW];this.mode='discovered';this.paths=geojson.features.filter(f=>f.properties.ADMIN!=='Antarctica').map(f=>({feature:f,name:f.properties.ADMIN,code:f.properties.ADM0_A3,color:f.properties.MAPCOLOR7,bounds:countryBounds(f),label:f.properties.ADMIN==='Russia'?[30,61]:[Number(f.properties.LABEL_X),Number(f.properties.LABEL_Y)],path:geometryPath(f.geometry)}));this.render();}
  project(point){return this.mode==='world'?project(point):relief.project(point);}
  svg(tag,attrs,text){const e=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attrs||{}))e.setAttribute(key,value);if(text!==undefined)e.textContent=text;return e;}
  button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=this.t(label);b.onclick=fn;return b;}
  focusCurrent(){const location=this.world.locations.find(l=>l.id===this.game.state.location);const [x,y]=this.project([location.coordinates.lon,location.coordinates.lat]);this.view=[x-32,y-24,64,48];this.mode='current';this.render();}
  zoom(factor){if(this.mode==='discovered')this.mode='manual';const [x,y,w,h]=this.view;const width=Math.max(4,Math.min(720,w*factor)),height=width*h/w;this.view=[x+(w-width)/2,y+(h-height)/2,width,height];this.render();}
  render(){
   this.container.setAttribute('aria-label',this.t('Voyage map'));
   const projection=this.mode==='world'?'world':'europe';
   if(this.pathProjection!==projection){for(const country of this.paths){country.path=geometryPath(country.feature.geometry,p=>this.project(p));country.bounds=countryBounds(country.feature,p=>this.project(p));}this.pathProjection=projection;}
   if(this.mode==='discovered')this.view=discoveredView(this.paths,this.world,this.game,p=>this.project(p));
   if(this.mode==='current'){const location=this.world.locations.find(l=>l.id===this.game.state.location);const [x,y]=this.project([location.coordinates.lon,location.coordinates.lat]);this.view[0]=x-this.view[2]/2;this.view[1]=y-this.view[3]/2;}
   const heading=document.createElement('h2');heading.textContent=this.t('Voyage map');
   const controls=document.createElement('div');controls.className='map-controls';controls.append(this.button('Europe',()=>{this.view=[...EUROPE_VIEW];this.mode='europe';this.render();}),this.button('World',()=>{this.view=[0,0,720,360];this.mode='world';this.render();}),this.button('Around me',()=>this.focusCurrent()),this.button('Zoom in',()=>this.zoom(.75)),this.button('Zoom out',()=>this.zoom(1.333)));
   const caption=document.createElement('p');caption.className='muted';caption.textContent=this.t('Click a marked place to travel. Locked places show what is missing.');
   controls.append(this.button('Discovered regions',()=>{this.mode='discovered';this.render();}));
   const svg=this.svg('svg',{viewBox:this.view.join(' '),class:'voyage-map',role:'group','aria-label':this.t('Interactive world map'),'preserveAspectRatio':'xMidYMid meet'});
   const palette=['#466d70','#657f61','#817954','#786c83','#596b89','#89645c','#5e807e'];
   const current=this.world.locations.find(l=>l.id===this.game.state.location);const currentCountryName=current.country==='England (Britain)'?'United Kingdom':current.country;
   const visitedCountries=new Set((this.game.state.visitedLocations||[this.game.state.location]).map(id=>this.world.locations.find(l=>l.id===id)?.country).map(name=>name==='England (Britain)'?'United Kingdom':name));
   for(const country of this.paths){const path=this.svg('path',{d:country.path,fill:visitedCountries.has(country.name)?(palette[(Number(country.color)||1)-1]||palette[0]):'#74797c',class:'country'+(country.name===currentCountryName?' current-country':''),'fill-rule':'evenodd'});path.append(this.svg('title',{},this.t(country.name)));svg.append(path);}
   const routes=this.svg('g',{class:'map-routes'});
   const defs=this.svg('defs'),land=this.svg('clipPath',{id:'voyage-relief-land',clipPathUnits:'userSpaceOnUse'});
   for(const country of this.paths)land.append(this.svg('path',{d:country.path,'clip-rule':'evenodd'}));defs.append(land);svg.append(defs);
   if(this.mode!=='world')relief.append(svg,defs,(tag,attrs)=>this.svg(tag,attrs));
   const visited=new Set(this.game.state.visitedLocations||[this.game.state.location]);
   for(const location of this.world.locations){if(!visited.has(location.id)&&!this.game.canTravel(location.id))continue;const req=location.requires;const flags=typeof req==='string'?[req]:[...(req?.milestones||[]),...(req?.milestone?[req.milestone]:[])];for(const flag of flags){const from=this.world.locations.find(l=>(l.milestone||l.id)===flag);if(!from?.coordinates||!location.coordinates||!visited.has(from.id))continue;const a=this.project([from.coordinates.lon,from.coordinates.lat]),b=this.project([location.coordinates.lon,location.coordinates.lat]);routes.append(this.svg('path',{d:`M${a.join(',')} L${b.join(',')}`,'data-from':from.id,'data-to':location.id}));}}svg.append(routes);
   const height=this.container.clientWidth<650?340:460;const scale=Math.max(this.view[2]/(this.container.clientWidth||900),this.view[3]/height);
   const labels=this.svg('g',{class:'country-labels'});
   const knownCountries=new Set(this.world.locations.filter(l=>visited.has(l.id)||this.game.canTravel(l.id)).map(l=>countryName(l.country)));
   for(const country of this.paths){if(!knownCountries.has(country.name))continue;const [x,y]=this.project(country.label);if(!Number.isFinite(x)||!Number.isFinite(y)||x<this.view[0]||x>this.view[0]+this.view[2]||y<this.view[1]||y>this.view[1]+this.view[3])continue;labels.append(this.svg('text',{x,y,'font-size':11*scale,'text-anchor':'middle'},this.t(country.name)));}svg.append(labels);
   for(const location of this.world.locations){if(!location.coordinates)continue;const [x,y]=this.project([location.coordinates.lon,location.coordinates.lat]);const status=markerState(this.game,location);const state=this.t({current:'You are here',visited:'Visited',available:'Available',locked:'Locked'}[status]);const missing=status==='locked'?` · ${this.t('Missing')}: ${this.requirements(location.requires)}`:'';
    const marker=this.svg('g',{class:`map-marker ${status}`,transform:`translate(${x} ${y})`,role:'button',tabindex:'0','aria-label':`${this.t(location.name)} · ${state}${missing}`,'aria-disabled':String(status==='locked')});
    marker.append(this.svg('title',{},`${this.t(location.name)} · ${this.t(location.country)} · ${state}${missing}`));
    marker.append(this.svg('circle',{r:15*scale,class:'marker-hit'}));
    if(status==='current')marker.append(this.svg('circle',{r:9*scale,class:'marker-halo'}));
    marker.append(this.svg('circle',{r:5*scale,class:'marker-dot'}));
    if(status==='locked'){const lock=this.svg('g',{class:'marker-lock',transform:`translate(${6*scale} ${2*scale}) scale(${scale})`,'aria-hidden':'true'});lock.append(this.svg('path',{d:'M2 5 V3 A3 3 0 0 1 8 3 V5',class:'lock-shackle'}),this.svg('rect',{x:0,y:5,width:10,height:8,rx:1.5,class:'lock-body'}),this.svg('circle',{cx:5,cy:9,r:1,class:'lock-keyhole'}));marker.append(lock);}
    if(this.view[2]<300||status==='current'){const offset=location.mapLabelOffset||[9,-9];marker.append(this.svg('text',{x:offset[0]*scale,y:offset[1]*scale,'font-size':12*scale,'text-anchor':offset[0]<0?'end':'start'},this.t(location.name)));}
    marker.onclick=()=>this.travel(location.id);marker.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.travel(location.id);}};svg.append(marker);
   }
   const legend=document.createElement('p');legend.className='map-legend';for(const state of ['current','visited','available','locked']){const span=document.createElement('span');span.className=state;span.textContent='● '+this.t({current:'You are here',visited:'Visited',available:'Available',locked:'Locked'}[state]);legend.append(span);}
   const source=document.createElement('a');source.href='https://www.naturalearthdata.com/';source.target='_blank';source.rel='noreferrer';source.className='map-source';source.textContent='Natural Earth · '+this.t('Map data');
   this.container.replaceChildren(heading,controls,caption,svg,legend,source);
  }
 }
 const api={project,geometryPath,markerState,VoyageMap};if(typeof module!=='undefined')module.exports=api;else root.VoyageMapTools=api;
})(globalThis);
