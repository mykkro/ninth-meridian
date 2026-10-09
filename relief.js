(function(root){
 'use strict';
 // One fitted conic projection; the source photograph is never warped.
 const calibration={"n":0.7590000000000006,"coefficients":[[1839.3527850888718,497.5716270333809,592.3976060519666],[492.7974630806372,-1812.3836533776416,-648.8295416152816]],"landmarks":[[-9.5,37,48,707],[-5.6,36,111,758],[3.3,42.3,289,643],[-9,43,91,566],[-4.8,48.4,198,476],[1.5,50.9,314,413],[-5.7,50,206,433],[-6,58.6,260,248],[-10.4,51.5,151,374],[8.5,41.5,384,690],[9.6,40.9,391,707],[15.1,36.7,491,796],[18.5,40,548,739],[12.3,45.4,460,599],[23.5,35.5,665,846],[29,41,757,727],[36.5,45.3,910,579],[5,58,406,292],[7,58,427,301],[12.6,55.7,482,377],[10.6,57.7,459,316],[18,59.3,550,270],[23,60,605,262],[28.2,59.5,708,263],[30.3,59.9,736,249],[-22,64,177,46]],"rmsPixels":17.258483598846926};
 function sourcePoint([lon,lat]){
  const phi=Math.max(-85,Math.min(85,lat))*Math.PI/180;
  const rho=Math.pow(Math.tan(Math.PI/4+phi/2),-calibration.n)/calibration.n;
  const p=[rho*Math.sin(calibration.n*lon*Math.PI/180),-rho*Math.cos(calibration.n*lon*Math.PI/180),1];
  return calibration.coefficients.map(c=>c.reduce((sum,value,i)=>sum+value*p[i],0));
 }
 function project(point){const [x,y]=sourcePoint(point);return [300+x*.1,30+y*.1];}
 function append(svg,defs,create){
  const layer=create('g',{class:'map-relief','clip-path':'url(#voyage-relief-land)','aria-hidden':'true'});
  layer.append(create('image',{href:'media/europe-blank-physical-hd.jpg',x:300,y:30,width:110,height:86.7,preserveAspectRatio:'xMidYMid meet'}));
  svg.append(layer);
 }
 const image={href:'media/europe-blank-physical-hd.jpg',width:1100,height:867};
 const api={calibration,image,sourcePoint,project,append};if(typeof module!=='undefined')module.exports=api;else root.VoyageRelief=api;
})(globalThis);
