'use strict';
(function(World01Manager, MuEngine){

  var stage=  function(worldmanager){
    this._worldman = worldmanager;
    this.buildActions();
  }


  /**
  *
  */
  stage.prototype.enter = function(){
    MuNarrator.execute("welcome");
  };


  /**
  *
  */
  stage.prototype.buildActions = function(){
    var self = this;
    var world = this._worldman;
    MuNarrator.addAction("welcome", MuNarrator.Microaction.newSequential("welcome",
      [
        MuNarrator.Microaction.newFixedTime("say welcome", 3000, null, function(){world.say("_say_welcome_");}),
        MuNarrator.Microaction.newFixedTime("say the goal is", 2000, null, function(){world.say("_say_goal_is_");}),
      ]
      ));
  };

  World01Manager.StageWelcome = stage;

})(World01Manager, MuEngine);
