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
    this.grid = new MuEngine.Grid(GRID_SIZE, GRID_SIZE, CELL_SIZE, "#888888");
    var gridNode = new MuEngine.Node(this.grid);
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
      grid: this.grid,
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
    this.avatarNode.mapWalkAnimation("walk-right","east");
    this.avatarNode.mapWalkAnimation("walk-left","west");

    //avatarNode.addIdleAnimation("wave-front");
    this.avatarNode.addIdleAnimation("idle1");

    this.avatarNode.primitive.play("idle1", true);
    //attachment of the avatarNode to the grid occurs within avatarNode constructor

    //initialize sounds
    this.initSounds();


		this.initZones();

    var self = this;
    //manage click events
    this.canvas.addEventListener('click', function(ev){

      if(!self.profile.engine.mouse){
        console.log("world01manager.addEventListener:click: ignoring clicks due to profile setting: self.profile.engine.mouse", self.profile.engine.mouse);
        return;
      }

      if(!self.profile.engine.clicktowalk){
        console.log("world01manager.addEventListener:click: ignoring click to walk due to profile setting: self.profile.engine.clicktowalk", self.profile.engine.clicktowalk);
        return;
      }

      var rect = self.canvas.getBoundingClientRect();
      var x = ev.clientX - rect.left;
      var y = ev.clientY - rect.top;
      var _cell = self.grid.collision(x, y, root, camera);
      if(_cell){
        console.log(x, y, _cell.row, _cell.col);
        MuNarrator.send("cell_clicked", {cell: _cell});
      }
}, false);


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

		//by now, ignore locale..
		function _load_speech(symbol){
			sounds[symbol] = new Howl({
        urls: ['assets/speech/'+symbol+".ogg"],
        autoplay: false,
        loop: false,
        volume: 1.0
      });
			console.log("_load_speech loading ", symbol);
		}

		if(this.profile.sounds.narration){
			_load_speech("_say_loading_");
			_load_speech("_say_welcome_");
			_load_speech("_say_goal_");
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


    if(this.profile.engine.cam3d){
      MuEngine.p0[0] = this.avatarNode.wp[0];
      MuEngine.p0[1] = this.avatarNode.wp[1];
      MuEngine.p0[2] = this.avatarNode.wp[2]-CAMERA_DISTANCE;
      camera.lookAt(MuEngine.p0);
    }else{
      MuEngine.p0[0] = this.avatarNode.wp[0];
      MuEngine.p0[1] = camera.center[1];
      MuEngine.p0[2] = Math.min(this.avatarNode.wp[2]+CAMERA_DISTANCE, CAMERA_DISTANCE);
      camera.setCenter(MuEngine.p0);
    }



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
    this.grid.getCell(i, j).addChild(spriteNode);
    return spriteNode;
  };

  /**
   * helper method
   * @param zonename
   * @param cellname (relative to zone center)
   * @param tiley
   * @returns {Object} fruit structure
   */
  manager.prototype.putFruit = function(fruitname, zonename, cellname, tiley){
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
		//storing references for faster queries
		var fruit = {
			name: fruitname,
			zonename: zonename,
			cellname: cellname,
			spriteNode: spriteNode
		};
		zone.fruit = fruit;
		cell.fruit = fruit;
		//sprite.fruit = fruitname;
    return fruit;
  };


	 /**
   * helper method
   * @param zonename
   * @param cellname (relative to zone center)
   * @param tiley
   */
  manager.prototype.putTree = function(zonename, cellname, treeid){
    var sprite = new MuEngine.Sprite("assets/"+this.profile.engine.assetdetail+"/trees.png");
    sprite.width = 2.0;
    sprite.height = 3.5;
    sprite.anchor = sprite.ANCHOR_BOTTOM;
    if(treeid === 0){
      sprite.tilex = 0;
      sprite.w = 130;
		}else if(treeid === 1){
      sprite.tilex = 130;
      sprite.w = 257-sprite.tilex;
		}else if(treeid === 2){
      sprite.tilex = 257;
      sprite.w = 349-sprite.tilex;
		}else if(treeid === 3){
      sprite.tilex = 349;
      sprite.w = 458-sprite.tilex;
		}else if(treeid === 4){
      sprite.tilex = 458;
      sprite.w = 565-sprite.tilex;
		}
    sprite.tiley = 0;
    sprite.h = 172;
    var spriteNode = new MuEngine.Node(sprite);
    spriteNode.transform.setPos(0.3, 0, 0.0);
		var zone = this.getZoneByName(zonename);
		var cell = zone.getCellByName(cellname);
    cell.addChild(spriteNode);
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
    fruits.push(this.putFruit("orange", "north", "center", 0));

		//limon zona sur
		fruits.push(this.putFruit("lemon", "south", "center", 1));

		//fresa zona sur este
		fruits.push(this.putFruit("strawberry","east", "center", 2));

		//cereza zona oeste
		fruits.push(this.putFruit("cherry","west", "center", 3));

		//pera zona nor este
		fruits.push(this.putFruit("pear", "northeast", "center", 4));


		//lets add some trees here
		this.putTree("center", "northwest", 0);
		this.putTree("center", "southeast", 1);
		this.putTree("south", "northwest", 2);
		this.putTree("north", "east", 3);
		this.putTree("northeast", "west", 4);

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


		//speech enabled?
		if(this.profile.sounds.narration){
			this.playSound(symbol);
		}

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
	manager.prototype.getCurrZoneName = function(){
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

	/**
	* given a vector, return its direction (north, south..)
	*/
	manager.prototype.getVectorDirection = function(dx, dy){
	if(dx === 0 && dy === 0){
			return "center";
		}else if(dy < 0){
			if(dx === 0){
				return "north";
			}else if(dx < 0){
				return "northwest";
			}else{
				return "northeast";
			}
		}else if(dy === 0){
			if(dx < 0){
				return "west";
			}else{
				return "east";
			}
		}else{
			if(dx === 0){
				return "south";
			}else if(dx < 0){
				return "southwest";
			}else{
				return "southeast";
			}
		}

	};


  return manager;

})(MuEngine);
