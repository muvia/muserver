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
		}
		else if(args.entryid === "describir_objetos"){
			this._describe_objects();
		}
		else if(args.entryid === "describe_object"){
			this._describe_object();
		}
		else if(args.entryid === "take_object"){
			this._take_object();
		}

  };


	/**
	*
	*@private
	*/
	stage.prototype._take_object = function(){
		var zone = this._worldman.getZoneByName(this._worldman.getCurrZone());
		if(zone.hasObjects()){
			var cell = zone.getCellByName(zone.fruit.cellname);
			cell.removeChild(zone.fruit.spriteNode);
			this._worldman.say("_object_taked_", zone.fruit.name);
			cell.fruit = undefined;
			zone.fruit = undefined;
			//pending: remove the fruit from the fruits array, or at least mark it as taken
			zone.fruit.zonename = undefined;
			zone.fruit.cellname = undefined;
			zone.fruit.spriteNode = undefined;
		}
	};


	/**
	*
	*@private
	*/
	stage.prototype._describe_object = function(){
		var zone = this._worldman.getZoneByName(this._worldman.getCurrZone());
		if(zone.hasObjects()){
			var cell = zone.getCellByName(zone.fruit.cellname);

			var dx = cell.row - this._worldman.avatarNode.cell.row;
			var dy = cell.col - this._worldman.avatarNode.cell.col;

			var dist = Math.abs(dx) + Math.abs(dy);
			if(dist > 0){
				this._worldman.say("_distance_to_object_", zone.fruit.name, dist, this._worldman.getVectorDirection(dx, dy));
			}else{
				this._worldman.say("_same_cell_than_object_", zone.fruit.name);
			}
		}else{
			this._worldman.say("_no_objects_in_zone_");
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
    var oldzone = this._worldman.getCurrZone();
		var self = this;
    var errcode = this._avatarNode.move(dir, function(){
      //what to do here?
      /*
      if changed_zone: say "you had entered the zone XXX "
      else say: "you are now in the cell XXX of the zone XXX".
      * */
      var newzone = self._worldman.getCurrZone();
      if(oldzone != newzone){
  			console.log("new zone!");
      }else{
				console.log("same zone..");
      }
    });
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
