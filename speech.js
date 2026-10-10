(function(root){
 'use strict';
 const blocked=new Set(['la','eo']);
 const base=language=>String(language||'').toLowerCase().split(/[-_]/)[0];
 class BrowserSpeechProvider{
  constructor(env=root){this.env=env;}
  available(){return !!(this.env.speechSynthesis&&this.env.SpeechSynthesisUtterance);}
  matchingVoices(language){const code=base(language);return (this.env.speechSynthesis?.getVoices()||[]).filter(v=>base(v.lang)===code||(code==='no'&&['nb','nn'].includes(base(v.lang))));}
  listVoices(language){return this.matchingVoices(language).map(v=>({id:v.voiceURI||v.name,name:v.name,language:v.lang,local:v.localService,gender:null}));}
  voice(language,options={}){const voices=this.matchingVoices(language);if(options.voiceId)return voices.find(v=>(v.voiceURI||v.name)===options.voiceId);if(options.variant)return voices.find(v=>v.name===options.variant);return voices.find(v=>v.lang.toLowerCase()===String(language).toLowerCase())||voices[0];}
  supports(language){return this.available()&&!!this.voice(language);}
  speak(text,language,options={}){const voice=this.voice(language,options);if(!voice)return false;this.cancel();const utterance=new this.env.SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;this.utterance=utterance;this.env.speechSynthesis.speak(utterance);return true;}
  cancel(){this.env.speechSynthesis?.cancel();this.utterance=null;}
 }
 class VoyageSpeech{
  constructor(provider=new BrowserSpeechProvider(),storage){this.provider=provider;this.enabled=false;try{this.storage=storage===undefined?root.localStorage:storage;this.enabled=this.storage?.getItem('voyage-speech')==='on';}catch{}}
  setProvider(provider){this.cancel();this.provider=provider;}
  listVoices(language){return blocked.has(base(language))?[]:(this.provider.listVoices?.(language)||[]);}
  setVoicePreferences(language,options){this.preferences??={};this.preferences[base(language)]={...options};}
  supports(language){return !!base(language)&&!blocked.has(base(language))&&this.provider.supports(language);}
  setEnabled(enabled){this.enabled=!!enabled;if(!this.enabled)this.cancel();try{this.storage?.setItem('voyage-speech',this.enabled?'on':'off');}catch{}}
  speak(text,language,options={}){if(!this.enabled||!text.trim()||!this.supports(language))return false;try{return this.provider.speak(text,language,{...this.preferences?.[base(language)],...options});}catch{return false;}}
  cancel(){this.provider.cancel();}
 }
 if(typeof module!=='undefined')module.exports={VoyageSpeech,BrowserSpeechProvider};else{root.VoyageSpeech=VoyageSpeech;root.BrowserSpeechProvider=BrowserSpeechProvider;}
})(globalThis);
