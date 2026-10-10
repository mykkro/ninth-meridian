const Engine=require('../engine.js');
module.exports=class StoryEngine extends Engine {
  travel(id,transport){
    if(transport||id===this.state.location||!this.canTravel(id))return super.travel(id,transport);
    let options=this.transportOptions(id);
    if(!options.length){
      if(this.state.location==='london'||this.state.location==='galway')super.travel('hamburg','boat');
      else super.travel('hamburg','carriage');
      options=this.transportOptions(id);
    }
    return super.travel(id,options[0].id);
  }
};
