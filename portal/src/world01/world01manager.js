'use strict';

//where is the best place to put this piece of code?
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * World01Manager class
 */
var World01Manager = (function(engine){


  //----- PRIVATE CONSTANTS --------------

  //distance between the camera and the avatar
  var CAMERA_DISTANCE = 10;

  //number of cells by side of the grid
  var GRID_SIZE = 9;

  var CELL_SIZE = 1.5;

  //----- PRIVATE MODULE VARS ------------
  var grid = null;

  //root node
  var root = null;

  //array of sprites
  var fruits = null;

  var camera = null;


  //move this to engine?
  var running = false;

  var sounds = {
    background: null
  };


var _narrationdiv = null;


	//array of custom zone objects
	var _zones =  [];


  //-------------------- CLASS MANAGER -------------------
  /**
   *
   * @constructor
   */
  var manager = function(canvas, accesibilityProfile, localizeSrv){
    this.canvas = canvas;
    this.profile = accesibilityProfile;
    this.localizeSrv= localizeSrv;
    this.avatarNode = null;

  };

  /**
   * load all the stuff
   */
  manager.prototype.buildAssets = function(){
    MuEngine.setActiveCanvas(this.canvas);

    var p0  = vec3.fromValues(0, 0,  0);
    var px = vec3.fromValues(1, 0, 0);
    var py = vec3.fromValues(0, 1, 0);
    var pz = vec3.fromValues(0, 0, 1);

    //create the axis
    var axis = new MuEngine.Node();

    var linex = new MuEngine.Line(p0, px, "#ff0000");
    var nodex = new MuEngine.Node(linex);
    axis.addChild(nodex);

    var liney = new MuEngine.Line(p0, py, "#00ff00");
    axis.addChild( new MuEngine.Node(liney));

    var linez= new MuEngine.Line(p0, pz, "#0000ff");
    axis.addChild( new MuEngine.Node(linez));

    //create the grid
    grid = new MuEngine.Grid(GRID_SIZE, GRID_SIZE, CELL_SIZE, "#888888");
    var gridNode = new MuEngine.Node(grid);
    //center the grid
    gridNode.transform.setPos(GRID_SIZE*CELL_SIZE*-0.5, 0.0, GRID_SIZE*CELL_SIZE*-0.5);

    //putSprite(0, 0, "assets/arbol.png");
    //putSprite(0, 1, "assets/casa.png");
    //putSprite(0, 2, "assets/flor.png");

    //create root node
    root = new MuEngine.Node();
    root.addChild(axis);
    root.addChild(gridNode);


    //create the camera
    camera = new MuEngine.Camera(this.canvas);
    camera.setOrtho(0, 10, -10, 10, -5, 5);

    MuEngine.setActiveCamera(camera);

    //the camera is located at 5 units over the floor, ten units toward the monitor.
    //this setup will produce a view with x to the right, y up and z toward the monitor.
    camera.setCenter(vec3.fromValues(0, 10, 10));
    camera.lookAt(vec3.fromValues(0, 0, -5));

    //create an avatar. it will be an avatar node plus an animated sprite primitive.
    this.avatarNode = new MuEngine.Avatar({
      row: 5,
      col: 5,
      grid: grid,
      speed:1.0
    });
    var avatarSprite = new MuEngine.Sprite("assets/"+this.profile.engine.assetdetail+"/muvia.png");
    //invoking "addAnimation" on a normal sprite transform it into an animated sprite
    avatarSprite.width = 2.0;
    avatarSprite.height = 2.48;
    avatarSprite.tilew = 128;
    avatarSprite.tileh = 128;
    avatarSprite.addAnimation("walk-front", 0, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("walk-right", 1, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("walk-left", 2, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("walk-back", 3, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("wave-front", 12, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1000);
    avatarSprite.addAnimation("idle1", 8, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2000);
    avatarSprite.anchor = MuEngine.Sprite.prototype.ANCHOR_BOTTOM;

    this.avatarNode.primitive = avatarSprite;
    this.avatarNode.mapWalkAnimation("walk-front","south");
    this.avatarNode.mapWalkAnimation("walk-back","north");
    this.avatarNode.mapWalkAnimation("walk-right","west");
    this.avatarNode.mapWalkAnimation("walk-left","east");

    //avatarNode.addIdleAnimation("wave-front");
    this.avatarNode.addIdleAnimation("idle1");

    this.avatarNode.primitive.play("idle1", true);
    //attachment of the avatarNode to the grid occurs within avatarNode constructor

    //initialize sounds
    this.initSounds();


		this.initZones();


    //temporal, just for debug!
    window.avatarNode = this.avatarNode;
    window.gridNode = gridNode;
		window.zones = _zones;
		window.worldman = this;

    _narrationdiv = document.getElementById("narration");
  };


  /**
  *
  */
  manager.prototype.initSounds = function(){

    if(this.profile.sounds.background){
      sounds.background = new Howl({
        urls: ['assets/sounds/170515__devlab__forest-ambient-01-loop.wav'],
        autoplay: true,
        loop: true,
        volume: 0.5
      });
    }

  };

  /**
  *
  */
  manager.prototype.playSound = function(name){
    if(sounds[name]){
      sounds[name].play();
    }
  };

  /**
  *
  */
  manager.prototype.stopSound = function(name){
    if(sounds[name]){
      sounds[name].stop();
    }
  };

  /**
   * render method to update the engine
   */
  manager.prototype.render = function(){
    var dt = MuEngine.tick();
    MuNarrator.update();
    MuEngine.clear();

    //update of camera position. it is a feature that must be offered by the engine.
    MuEngine.p0[0] = this.avatarNode.wp[0];
    MuEngine.p0[1] = camera.center[1];
    MuEngine.p0[2] = Math.min(this.avatarNode.wp[2]+CAMERA_DISTANCE, CAMERA_DISTANCE);
    camera.setCenter(MuEngine.p0);
    camera.update();

    MuEngine.updateNode(root, dt);
    MuEngine.renderNode(root);
  };

  /**
   * unload all the stuff
   */
  manager.prototype.stop = function(){
    if(running){
      running = false;

      this.stopSound("background");

    }
  };

  /**
   *
   */
  manager.prototype.start = function(){
    running = true;
    var self = this;
    MuNarrator.setActiveStage("welcome");
    function animloop(){
        if(running) {
          requestAnimFrame(animloop);
          self.render();
        }else{
          self.destroy();
        }
    }
    animloop();
  };

  /**
   *
   */
  manager.prototype.destroy = function(){

  };

  /**
   * helper method
   * @param i
   * @param j
   * @param path
   * @returns {MuEngine.Node}
   */
  var putSprite = function(i, j, path){
    var sprite = new MuEngine.Sprite(path);
    sprite.width = 2.0;
    sprite.height = 2.0;
    sprite.anchor = sprite.ANCHOR_BOTTOM;
    var spriteNode = new MuEngine.Node(sprite);
    grid.getCell(i, j).addChild(spriteNode);
    return spriteNode;
  };

  /**
   * helper method
   * @param zonename
   * @param cellname (relative to zone center)
   * @param tiley
   * @returns {MuEngine.Node}
   */
  manager.prototype.putFruit = function(zonename, cellname, tiley){
    var sprite = new MuEngine.Sprite("assets/"+this.profile.engine.assetdetail+"/fruits.png");
    sprite.width = 1.5;
    sprite.height = 1.5;
    sprite.anchor = sprite.ANCHOR_BOTTOM;
    sprite.tilew = 64;
    sprite.tileh = 64;
    sprite.tiley = tiley;
    var spriteNode = new MuEngine.Node(sprite);
    spriteNode.transform.setPos(0.5, 0, 0.9);
		var zone = this.getZoneByName(zonename);
		var cell = zone.getCellByName(cellname);
    cell.addChild(spriteNode);
    return spriteNode;
  };


	/**
	* return the zone object based on its name
	*/
	manager.prototype.getZoneByName = function(name){
		for(var i=0; i<9; ++i){
			if(_zones[i].name === name) return _zones[i];
		}
	};



	/**
	* helper
	*/
	manager.prototype.initZones = function(){
		var zi, fi, zone;
		_zones = [];

		for(zi=0; zi<9; ++zi){
			_zones.push(new World01Manager.Zone(zi, this));
		}

		//select random zones for the five fruits. avoid the center, and with-fruit zones.
		/*for(fi=0; fi<5; ++fi){
			do{
				zone = _zones[Math.floor(Math.random()*9)];
			}while(zone.name === "center" || zone.fruitid != undefined);
		}*/

		fruits = [];

		//naranja zona norte
    fruits.push(this.putFruit("north", "center", 0));

		//limon zona sur
		fruits.push(this.putFruit("south", "center", 1));

		//fresa zona sur este
		fruits.push(this.putFruit("east", "center", 2));

		//cereza zona oeste
		fruits.push(this.putFruit("west", "center", 3));

		//pera zona nor este
		fruits.push(this.putFruit("northeast", "center", 4));

	};



  /**
  * supports interpolation of parameters into the localized strings!
   * use the '%' character to indicate the position of a parameter.
   * @param {String} symbol for i18n. you can pass additional params for interpolation!
   * @return {String} translated string (for testing)
  */
  manager.prototype.say = function(symbol){

    var localsymbol = this.localizeSrv.getLocalizedString(symbol);

    if(arguments.length > 1){
      //time to interpolate!
      for(var i=1; i<arguments.length; ++i){
        var arg = arguments[i];
        if(typeof arg === "string"){
          arg = this.localizeSrv.getLocalizedString(arg);
        }
        localsymbol = localsymbol.replace("%"+i, arg);
      }
    }


    if(_narrationdiv)
      _narrationdiv.innerHTML = localsymbol;
    return localsymbol;
  };


  /**
  * initializes all the stages and actions required for this world
  */
  manager.prototype.buildStages = function(){
    MuNarrator.addStage("welcome", new  World01Manager.StageWelcome(this));
  };

	/**
	* return the id of the zone where the avatar is currently localed.
	* it has the form: "center", "north", "west", "northwest", ..
	*/
	manager.prototype.getCurrZone = function(){
		var x, y;
		x = Math.floor(window.avatarNode.cell.row / 3);
		y = Math.floor(window.avatarNode.cell.col / 3);

		if(x == 1 && y == 1){
			return "center";
		}else if(x == 1){
			if(y === 0){
				return "north";
			}else{
				return "south";
			}
		}else if(y == 1){
			if(x === 0){
				return "west";
			}else{
				return "east";
			}
		}else{
			var id = null;
			if(y > 1){
				id = "south";
			}else{
				 id = "north";
			}
			id += (x > 1)?"east":"west";
			return id;
		}
	};


  return manager;

})(MuEngine);
