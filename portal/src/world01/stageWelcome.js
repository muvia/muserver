'use strict';
(function(World01Manager, MuEngine){

  var stage=  function(worldmanager){
    this._worldman = worldmanager;
    this._avatarNode = this._worldman.avatarNode;
    this._buildActions();
  };


  /**
  * required method for muNarrator stage convention
  */
  stage.prototype.enter = function(){

    MuNarrator.execute("welcome");
  };


  /**
   * required method for muController, muNarrator conventions
   */
  stage.prototype.on_selected_menu = function(args){
    //console.log("on_selected_menu", args);
    this._worldman.say("selected_"+args.entryid);
  };

  /**
   * required method for muController, muNarrator conventions
   */
  stage.prototype.on_executed_menu = function(args){
    //console.log("on_executed_menu", args);
    this._worldman.say("executed_"+args.entryid);
  };

  /**
   * required method for muController, muNarrator conventions
   */
  stage.prototype.on_selected_entry = function(args){
    //console.log("on_selected_entry", args);
    this._worldman.say("selected_"+args.entryid);
  };

  /**
   * required method for muController, muNarrator conventions
   */
  stage.prototype.on_executed_entry = function(args){
    console.log("on_executed_entry", args);
    if(args.entryid === "caminar_norte"){
      this._move_avatar("north");
    }
    else if(args.entryid === "caminar_sur"){
      this._move_avatar("south");
    }
    else if(args.entryid === "caminar_oriente"){
      this._move_avatar("west");
    }
    else if(args.entryid === "caminar_occidente"){
      this._move_avatar("east");
    }
		else if(args.entryid === "describir_mundo"){
			this._worldman.say("_world_description_");
		}
		else if(args.entryid === "describir_zona"){
			this._worldman.say("_zone_description_", this._worldman.getCurrZone());
		}else if(args.entryid === "describir_objetos"){
			this._describe_objects();
		}
  };

	/**
	*
	* @private
	*/
	stage.prototype._describe_objects = function(){
		var zone = this._worldman.getZoneByName(this._worldman.getCurrZone());
		if(zone.hasObjects()){
			this._worldman.say("_objects_in_zone_", zone.fruit.name);
		}else{
			this._worldman.say("_no_objects_in_zone_");
		}
	};

  /**
   * handles the move avatar events
   * @param args
   * @private
   */
  stage.prototype._move_avatar = function(dir){

    if(this._avatarNode.moving){
      console.log("stage._move_avatar: avatar is yet walking. ignoring walk command.");
      return;
    }
    var errcode = this._avatarNode.move(dir);
    if(errcode === MuEngine.err.OK){
      this._worldman.say("_youre_moving_towards_", dir);
    }else if(errcode === MuEngine.err.WORLD_EDGE){
      this._worldman.say("_world_edge_", dir);
    }else if(errcode === MuEngine.err.CELL_UNWALKABLE){
      this._worldman.say("_cell_unwalkable_", dir);
    }else{
      console.log("moving is invalid.. say something");
    }

  };


  /**
  *
  */
  stage.prototype._buildActions = function(){
    var self = this;
    var world = this._worldman;
    MuNarrator.addAction("welcome", MuNarrator.Microaction.newSequential("welcome",
      [
        MuNarrator.Microaction.newFixedTime("say welcome", 3000, null, function(){world.say("_say_welcome_");}),
        MuNarrator.Microaction.newFixedTime("say the goal is", 2000, null, function(){world.say("_say_goal_is_");})
      ]
      ));
  };






  World01Manager.StageWelcome = stage;

})(World01Manager, MuEngine);
