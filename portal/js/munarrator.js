"use strict";
var MuNarrator = (function(){

  var MuNarrator = {};

  //----------- PRIVATE MODULE VARIABLES ---------------

  //a map to store reusable microactions
  var _actions = {};

  //a map to store stages
  var _stages = {};

  //the active stage
  var _currstage = null;


  //------------ PUBLIC MODULE METHODS -------------------

  /**
  *
  */
  MuNarrator.update = function(){
    if(_currstage && _currstage.action)
        if(_currstage.action.update()){
          _currstage.action = null;
        }
  };

  /**
  *
  */
  MuNarrator.addAction = function(name, microaction){
    _actions[name] = microaction;
  };

  /**
  *
  */
  MuNarrator.getAction = function(name){
    return _actions[name];
  };

  /**
  * @param name {string} name of the stage
  * @param stage {function} method that receives msg calls: signature: msg_type, params
  */
  MuNarrator.addStage = function(name, stage){
    _stages[name] = stage;
  };


  /**
  * set the active stage.
  * it also generates a flow of events as follows:
  * 1. send a 'exit' message to the old active stage, if any.
  * 2. send a 'enter' message to the new stage.
  */
  MuNarrator.setActiveStage = function(name){
    var nextstage = _stages[name];
    if(!nextstage){
      throw 'unexisting_stage';
    }
    if(_currstage && _currstage['exit']){
      _currstage['exit']();
    }
    _currstage = nextstage;
    if(_currstage && _currstage['enter']){
      _currstage['enter']();
    }
  };


  /**
  * execute the action identified by action_name in the context of the current stage.
  * if force is false, the action is executed only if there are not other action being executed in the current stage.
  * if force is true, the action will force the termination of the existing action.
  */
  MuNarrator.execute = function(action_name, force){
    if(_currstage){
      if(!_currstage.action || force){
        if(_actions[action_name]){
          _currstage.action = _actions[action_name];
          _currstage.action.reset();
        }
      }
    }
  };

  /**
  * delete all registered stages and microactions
  */
  MuNarrator.clear = function(){
     _actions = {};
     _stages = {};
     _currstage = null;
  };

  /**
  * send a message to the current stage.
  * a stage is known to accept a message if has a method named "on_XXX" where XXX is the value of the param "msg".
  * @params msg {String} name of the message.
  */
  MuNarrator.send = function(msg, args){
    if(_currstage && _currstage["on_"+msg]){
      _currstage["on_"+msg](args);
    }
  };


  return MuNarrator;

})();


(function(MuNarrator){
"use strict";



  /**
  * basic constructor for all microactions. there are some Microaction.newXXX methods
  * to facilitate specific cases.
  * @param {string} name
  * @param {function} startcb start callback. signature: function()
  * @param {function} updatecb update callback. signature: function(elapsedtime): bool. must return true if finished.
  * @param {function} donecb done callback. signature: function()
  * @constructor
  */
  MuNarrator.Microaction = function(name, startcb, updatecb, donecb){
    this.startcb = startcb;
    this.updatecb = updatecb;
    this.donecb = donecb;
    this.reset();
  };

  /**
  * factory method to create a single step microaction.
  * @param {string} name
  * @param updatecb {function} empty callback to trigger single behaviour
  * @return {object} microaction
  */
  MuNarrator.Microaction.newSingleStep = function(name, updatecb){
    return new MuNarrator.Microaction(name,
                                      null,
                                      function(){
                                        updatecb();
                                        return true;
                                      },
                                      null);
  };


  /**
  * factory method to create a fixed time  microaction.
  * the endcb callback will be invoked after passed 'duration' miliseconds
  * @param duration {long} milliseconds
  */
  MuNarrator.Microaction.newFixedTime = function(name, duration, startcb, endcb){
    var _t = null;
    return new MuNarrator.Microaction(name,
      function(){
        _t = Date.now();
        if(startcb) startcb();
      },
      function(){
        return (Date.now() - _t) >= duration;
      },
      endcb);
  };


  /**
  * factory method to create a sequencial execution of microactions.
  * this microaction will begin processing the array of microactions in order, and will
  * finish only when the last one in the array is finished.
  */
  MuNarrator.Microaction.newSequential = function(name, microactions){
    var current = 0;
    return new MuNarrator.Microaction(name,
      function(){
        microactions[current].update();
      },
      function(){
        microactions[current].update();
        if(microactions[current].isDone()){
          current++;
          if(current >= microactions.length){
            this.status = "finished";
            return true; //signal for termination
          }else{
            return false;
          }
        }
      },
      null
    );
  };


  /**
  * factory method to create a concurrent microaction
  * @param micros array of microactions to execute in parallel. it will finish once all of them are finished.
  */
  MuNarrator.Microaction.newConcurrent = function(name, microactions){
      return new MuNarrator.Microaction(name,
        function(){
          microactions.forEach(function(micro){
            micro.update();
          });
        },
        function(){
          var counter = 0;
          microactions.forEach(function(micro){
            micro.update();
            counter += micro.isDone()?1:0;
          });
          if(counter >= microactions.length){
            this.status = "finished";
            return true; //signal for termination
          }else{
            return false;
          }
        },
        null
      );
  };


  MuNarrator.Microaction.prototype.isDone = function(){
    return this.status === "finished";
  };

  MuNarrator.Microaction.prototype.update = function(){
    if(this.status === "idle"){
      if(this.startcb) this.startcb();
      this.status = "running";
      return false;
    }else if(this.status === "running"){
      if(this.updatecb()){
        this.status = "finished";
        if(this.donecb) this.donecb();
        return true;
      }
    }
    return false;
  };

  MuNarrator.Microaction.prototype.reset = function(){
    this.status = "idle"; //running, finished
  };

})(MuNarrator);

