(function(root){
 'use strict';
 class VoyageSounds{
  constructor(){this.context=null;this.master=null;this.enabled=true;try{this.enabled=root.localStorage.getItem('voyage-sound')!=='off';}catch{}}
  setEnabled(enabled){this.enabled=!!enabled;try{root.localStorage.setItem('voyage-sound',enabled?'on':'off');}catch{}if(this.master)this.master.gain.setValueAtTime(enabled?.18:0,this.context.currentTime);if(enabled)this.unlock();}
  unlock(){if(!this.enabled)return;try{const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return;if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=.18;this.master.connect(this.context.destination);}if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{}}
  play(kind){
   if(!this.enabled||root.document?.hidden)return;this.unlock();const ctx=this.context;if(!ctx||ctx.state!=='running')return;
   const melody=kind==='coins'?[1318.51,1760,2093]:kind==='quest'?[523.25,659.25,783.99,1046.5]:[392,523.25,659.25];
   try{melody.forEach((frequency,index)=>{const start=ctx.currentTime+index*.13,oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.22,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+.32);oscillator.connect(gain);gain.connect(this.master);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(start);oscillator.stop(start+.34);});}catch{}
  }
 }
 if(typeof module!=='undefined')module.exports=VoyageSounds;else root.VoyageSounds=VoyageSounds;
})(globalThis);
