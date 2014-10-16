/*
 * An AngularJS Localization Service
 *
 * Written by Jim Lavin
 * http://codingsmackdown.tv
 *
 */
'use strict';
angular.module('localization', [])
    // localization service responsible for retrieving resource files from the server and
    // managing the translation dictionary
    .provider('localize', function localizeProvider() {

        this.languages = ['es-CO','en-US'];
        this.defaultLanguage = 'es-CO';
        this.ext = 'js';

        var provider = this;

        this.$get = ['$http', '$rootScope', '$window', '$filter', function ($http, $rootScope, $window, $filter) {

            var localize = {
                // use the $window service to get the language of the user's browser
                //language:$window.navigator.userLanguage || $window.navigator.language,
                //language:'',
                dictionary:[],
                // location of the resource file
                url: undefined,
                // flag to indicate if the service hs loaded the resource file
                resourceFileLoaded:false,

                // success handler for all server communication
                successCallback:function (data) {
                    // store the returned array in the dictionary
                    localize.dictionary = data;
                    // set the flag that the resource are loaded
                    localize.resourceFileLoaded = true;
                    // broadcast that the file has been loaded
                    $rootScope.$broadcast('localizeResourcesUpdated');
                },

                // allows setting of language on the fly
                setLanguage: function(value) {
                    localize.language = this.fallbackLanguage(value);
                    localize.initLocalizedResources();
                },

                fallbackLanguage: function(value) {

                    value = String(value);

                    if (provider.languages.indexOf(value) > -1) {
                        return value;
                    }

                    value = value.split('-')[0];

                    if (provider.languages.indexOf(value) > -1) {
                        return value;
                    }

                    return provider.defaultLanguage;
                },

                // allows setting of resource url on the fly
                setUrl: function(value) {
                    localize.url = value;
                    localize.initLocalizedResources();
                },

                // builds the url for locating the resource file
                buildUrl: function() {
                    if(!localize.language){
                        var lang, androidLang;
                        // works for earlier version of Android (2.3.x)
                        if ($window.navigator && $window.navigator.userAgent && (androidLang = $window.navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
                            lang = androidLang[1];
                        } else {
                            // works for iOS, Android 4.x and other devices
                            lang = $window.navigator.userLanguage || $window.navigator.language;
                        }
                        // set language
                        localize.language = this.fallbackLanguage(lang);
                    }
                    return '/i18n/resources-locale_' + localize.language + '.' + provider.ext;
                },

                // loads the language resource file from the server
                initLocalizedResources:function () {
                    // build the url to retrieve the localized resource file
                    var url = localize.url || localize.buildUrl();
                    // request the resource file
                    $http({ method:"GET", url:url, cache:false }).success(localize.successCallback).error(function () {
                        // the request failed set the url to the default resource file
                        var url = 'i18n/resources-locale_default' + '.' + provider.ext;
                        // request the default resource file
                        $http({ method:"GET", url:url, cache:false }).success(localize.successCallback);
                    });
                },

                // checks the dictionary for a localized resource string
                getLocalizedString: function(value) {
                    // default the result to an empty string
                    var result = '';

                    // make sure the dictionary has valid data
                    if ((localize.dictionary !== []) && (localize.dictionary.length > 0)) {
                        // use the filter service to only return those entries which match the value
                        // and only take the first result
                        var entry = $filter('filter')(localize.dictionary, function(element) {
                                return element.key === value;
                            }
                        );

                        // set the result
                        result = entry[0] ? entry[0].value : value;
                    }
                    // return the value to the call
                    return result;
                }
            };

            // force the load of the resource file
            localize.initLocalizedResources();

            // return the local instance when called
            return localize;
        } ];
    })
    // simple translation filter
    // usage {{ TOKEN | i18n }}
    .filter('i18n', ['localize', function (localize) {
        return function (input) {
            return localize.getLocalizedString(input);
        };
    }])
    // translation directive that can handle dynamic strings
    // updates the text value of the attached element
    // usage <span data-i18n="TOKEN" ></span>
    // or
    // <span data-i18n="TOKEN|VALUE1|VALUE2" ></span>
    .directive('i18n', ['localize', function(localize){
        var i18nDirective = {
            restrict:"EAC",
            updateText:function(elm, token){
                var values = token.split('|');
                if (values.length >= 1) {
                    // construct the tag to insert into the element
                    var tag = localize.getLocalizedString(values[0]);
                    // update the element only if data was returned
                    if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
                        if (values.length > 1) {
                            for (var index = 1; index < values.length; index++) {
                                var target = '{' + (index - 1) + '}';
                                tag = tag.replace(target, values[index]);
                            }
                        }
                        // insert the text into the element
                        elm.text(tag);
                    }
                }
            },

            link:function (scope, elm, attrs) {
                scope.$on('localizeResourcesUpdated', function() {
                    i18nDirective.updateText(elm, attrs.i18n);
                });

                attrs.$observe('i18n', function (value) {
                    i18nDirective.updateText(elm, attrs.i18n);
                });
            }
        };

        return i18nDirective;
    }])
    // translation directive that can handle dynamic strings
    // updates the attribute value of the attached element
    // usage <span data-i18n-attr="TOKEN|ATTRIBUTE" ></span>
    // or
    // <span data-i18n-attr="TOKEN|ATTRIBUTE|VALUE1|VALUE2" ></span>
    .directive('i18nAttr', ['localize', function (localize) {
        var i18NAttrDirective = {
            restrict: "EAC",
            updateText:function(elm, token){
                var values = token.split('|');
                // construct the tag to insert into the element
                var tag = localize.getLocalizedString(values[0]);
                // update the element only if data was returned
                if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
                    if (values.length > 2) {
                        for (var index = 2; index < values.length; index++) {
                            var target = '{' + (index - 2) + '}';
                            tag = tag.replace(target, values[index]);
                        }
                    }
                    // insert the text into the element
                    elm.attr(values[1], tag);
                }
            },
            link: function (scope, elm, attrs) {
                scope.$on('localizeResourcesUpdated', function() {
                    i18NAttrDirective.updateText(elm, attrs.i18nAttr);
                });

                attrs.$observe('i18nAttr', function (value) {
                    i18NAttrDirective.updateText(elm, value);
                });
            }
        };

        return i18NAttrDirective;
    }]);

//------
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
//------
'use strict';
(function(World01Manager, MuEngine){

	/**
	* @param id {number} id of the zone
	* @param name {string} name of the zone ("north", "northwest"..)
	* @constructor
	*/
  var Zone =  function(id, worldmanager){
    this._worldman = worldmanager;
		this.id = id;
		if(this.id === 0){
			this.name = "northwest";
			this.minx = 0;
			this.miny = 0;
			this.maxx = 2;
			this.maxy = 2;

		}else if(this.id === 1){
			this.name = "north";
			this.minx = 3;
			this.miny = 0;
			this.maxx = 5;
			this.maxy = 2;

		}else if(this.id === 2){
			this.name = "northeast";
			this.minx = 6;
			this.miny = 0;
			this.maxx = 8;
			this.maxy = 2;

		}else if(this.id === 3){
			this.name = "west";
			this.minx = 0;
			this.miny = 3;
			this.maxx = 2;
			this.maxy = 5;

		}else if(this.id === 4){
			this.name = "center";
			this.minx = 3;
			this.miny = 3;
			this.maxx = 5;
			this.maxy = 5;
		}else if(this.id === 5){
			this.name = "east";
			this.minx = 6;
			this.miny = 3;
			this.maxx = 8;
			this.maxy = 5;

		}else if(this.id === 6){
			this.name = "southwest";
			this.minx = 0;
			this.miny = 6;
			this.maxx = 2;
			this.maxy = 8;

		}else if(this.id === 7){
			this.name = "south";
			this.minx = 3;
			this.miny = 6;
			this.maxx = 5;
			this.maxy = 8;

		}else if(this.id === 8){
			this.name = "southeast";
			this.minx = 6;
			this.miny = 6;
			this.maxx = 8;
			this.maxy = 8;
		}

  };

	/**
	* return a cell by its relative name (relative to the center of the zone)
	* like north, south, center..
	*/
	Zone.prototype.getCellByName = function(name){
		if(name === "northwest"){
				return this._worldman.grid.getCell(this.minx, this.miny);
		}else if(name === "north"){
				return this._worldman.grid.getCell(this.minx+1, this.miny);
		}else if(name === "northeast"){
				return this._worldman.grid.getCell(this.minx+2, this.miny);
		}else if(name === "west"){
				return this._worldman.grid.getCell(this.minx, this.miny+1);
		}else if(name === "center"){
				return this._worldman.grid.getCell(this.minx+1, this.miny+1);
		}else if(name === "east"){
				return this._worldman.grid.getCell(this.minx+2, this.miny+1);
		}else if(name === "southwest"){
				return this._worldman.grid.getCell(this.minx, this.miny+2);
		}else if(name === "south"){
				return this._worldman.grid.getCell(this.minx+1, this.miny+2);
		}else if(name === "southeast"){
				return this._worldman.grid.getCell(this.minx+2, this.miny+2);
		}
	};

	/**
	* the inverse of getCellByName: given a cell that belongs to this zone, returns its
	* relative name ("north", "center"..)
	*/
	Zone.prototype.getCellName = function(cell){
		var x, y;
		x = cell.row - this.minx;
		y = cell.col - this.miny;
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
	* return true if there are objects of interest in this zone (fruits, by now)
	*/
	Zone.prototype.hasObjects = function(){
		return this.fruit !== undefined;
	};


  World01Manager.Zone = Zone;

})(World01Manager, MuEngine);
//------
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
      this._move_avatar("east");
    }
    else if(args.entryid === "caminar_occidente"){
      this._move_avatar("west");
    }
		else if(args.entryid === "describir_mundo"){
			this._worldman.say("_world_description_");
		}
		else if(args.entryid === "describir_zona"){
			this._worldman.say("_zone_description_", this._worldman.getCurrZoneName());
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
  * check if clicked cell is in the same row or col (not both!) of avatar, and make it walk one cell toward the new direction
  */
  stage.prototype.on_cell_clicked = function(args){
    var dx, dy, zone;
    dx = args.cell.row - this._avatarNode.cell.row;
    dy = args.cell.col - this._avatarNode.cell.col;
    zone = this._worldman.getVectorDirection(dx, dy);
    console.log(dx, dy, zone);
    if((dx === 0 || dy === 0) && zone != "center"){
      this._move_avatar(zone);
    }
  };


	/**
	*
	*@private
	*/
	stage.prototype._take_object = function(){
		var zone = this._worldman.getZoneByName(this._worldman.getCurrZoneName());
		if(zone.hasObjects()){
			var cell = zone.getCellByName(zone.fruit.cellname);
			cell.removeChild(zone.fruit.spriteNode);
			this._worldman.say("_object_taked_", zone.fruit.name);
			cell.fruit = undefined;
			//pending: remove the fruit from the fruits array, or at least mark it as taken
			zone.fruit.zonename = undefined;
			zone.fruit.cellname = undefined;
			zone.fruit.spriteNode = undefined;
			zone.fruit = undefined;
		}
	};


	/**
	*
	*@private
	*/
	stage.prototype._describe_object = function(){
		var zone = this._worldman.getZoneByName(this._worldman.getCurrZoneName());
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
		var zone = this._worldman.getZoneByName(this._worldman.getCurrZoneName());
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
    var oldzone = this._worldman.getZoneByName(this._worldman.getCurrZoneName());
		var self = this;
    var errcode = this._avatarNode.move(dir, function(){
      //what to do here?
      /*
      if changed_zone: say "you had entered the zone XXX "
      else say: "you are now in the cell XXX of the zone XXX".
      * */
      var newzone = self._worldman.getZoneByName(self._worldman.getCurrZoneName());

      if(oldzone != newzone){
  			self._worldman.say("_entered_new_zone_", newzone.name);
      }else{
 				var cellname = newzone.getCellName(self._worldman.avatarNode.cell);
				self._worldman.say("_same_zone_new_cell_", newzone.name, cellname);
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
//------

/**
 * muportalapp.js
 * app main module
 */
'use strict';

var muPortalApp = angular.module('muPortal', ['ngRoute', 'ui.bootstrap', 'localization']).
    config(['$routeProvider', function ($routeProvider) {

    	//configure navigation paths in client side
        $routeProvider.
            when('/', {templateUrl:'partials/welcome.html'}).
            when('/login', {templateUrl:'partials/login.html'}).
            when('/logout', {templateUrl:'partials/logout.html', controller:'logoutController'}).
            when('/register', {templateUrl:'partials/register.html'}).
            when('/welcome', {templateUrl:'partials/welcome.html'}).
            when('/profile', {templateUrl:'partials/profile.html', controller:'profileController'}).
            when('/contact', {templateUrl:'partials/contact.html'}).
            when('/virtualworld', {templateUrl:'partials/virtualworld.html', controller: 'virtualworldController'}).
            otherwise({redirectTo:'/'});
    
    }]);

muPortalApp.run(function($rootScope, $http) {
});

//------
/**
 * this service encapsulates the /login and /logout api endpoint.
 * it is in charge of setting and removing the authtoken and propagate
 */

muPortalApp.service("authsrv", [ "$rootScope", "$http", function($rootScope, $http){
  'use strict';

    /**
     * only allow anonymous users
     * @type {number}
     */
    this.LEVEL_ANON = 0x1;

    /**
     * allow anonymous and logged users
     * @type {number}
     */
    this.LEVEL_ALL = 0x3;


    /**
     * only allow authenticated users
     * @type {number}
     */
    this.LEVEL_AUTH = 0x2;


	this.ROLE_ANON = 0x1;
	this.ROLE_AUTH = 0x2;

    /**
     * this property will be used to monitor login/logout events in the whole app.
     * zero means logged out, >1 logged in. in the future, other values (maybe binary flags)
     * may enrich the meaning of it.
    */
    $rootScope.authcode = this.ROLE_ANON;

    /**
     *
     * @param usr
     * @param psw
     * @cb success callback, signature function(errorcode). if null, it means login was successful.
     * error codes:
     * AUTHENTICATION_ERROR
     *
     */
	this.login= function(usr, psw, cb){
        var self = this;
        $http({
            method: 'POST',
            url: '/api/login',
            data: {usr: usr, psw:psw}
        }).
            success(function(data, status, headers, config) {
                $rootScope.authcode = self.ROLE_AUTH;
                $http.defaults.headers.common.Authorization = data.tkn;
                cb(null);
            }).
            error(function(data, status, headers, config) {
                console.log("error loggin in", data, status);
                cb("AUTHENTICATION_ERROR");
            });
	};

    /**
     *
     */
	this.logout = function(){
		var self = this;
        $http({
            method: 'POST',
            url: '/api/logout'
        }).
            success(function(data, status, headers, config) {
                $rootScope.authcode = self.LEVEL_ANON;
                $http.defaults.headers.common.Authorization = null;
                //console.log("logged out!", $rootScope.authcode);
            }).
            error(function(data, status, headers, config) {
                //console.log("error logging out", data, status);
            });
	};

    /**
     * returns true or false if the accesslevel matches the $rootscope.authcode.
     * use the LEVEL_xxxx variables as accesslevel integer codes or as strings: 
     * anon, auth, all, none
     * @param accesslevel
     */
    this.authorize = function(accesslevel){
    	if(accesslevel === "none") accesslevel = 0;
    	else if(accesslevel === "anon") accesslevel = 1; 
    	else if(accesslevel === "auth") accesslevel = 2; 
    	else if(accesslevel == "all") accesslevel = 3;
    	else accesslevel =  parseInt(accesslevel);
        //console.log("authsrv.authorize acesslevel ", accesslevel, $rootScope.authcode, ($rootScope.authcode & accesslevel));
        return ($rootScope.authcode & accesslevel) > 0;
    };
	
}]);
//------
/**
 * src/services/contactsrv.js
 * this service encapsulate the /contact api endpoint
 */




muPortalApp.service("contactsrv", ["$http", function($http){
  'use strict';
    /**
     * send a contact message filled in the contact form
     */
	this.sendMessage = function(name, email, message, cb){
        var self = this;
        $http({
            method: 'POST',
            url: '/api/contact',
            data: {name: name, email:email, message: message}
        }).
            success(function(data, status, headers, config) {
                //$rootScope.authcode = self.ROLE_AUTH;
                //$http.defaults.headers.common.Authorization = data.tkn;
                cb(null);
            }).
            error(function(data, status, headers, config) {
                console.log("error sending contact message", data, status);
                cb("API_ERROR");
            });
	};
	
}]);
//------
/**
 * this service encapsulate the /profile api endpoint 
 * and keeps the user profile in memory
 */
muPortalApp.service("profilesrv", ["$http", function($http){
  'use strict';

  var _profile = null;

	this.getProfile = function(cb){
		if(_profile){
      cb(_profile);
    }else{
      $http.get('api/profile')
        .success(function(data) {
          console.log("profilesrv.js:getProfile:", data);
          _profile = data;
          cb(_profile);
        });
    }
	};
	
	this.saveProfile = function(profile){
		console.log("profilesrv.js saving profile", profile);

    $http({
      url: 'api/profile',
      method: "POST",
      data: profile
    }).success(function (data, status, headers, config) {
        _profile = profile;
    }).error(function (data, status, headers, config) {
      console.log("profilesrv.js error saving profile", data, status);
    });



  };
	
}]);
//------
/**
 * Created by cesar on 6/18/14.
based on this article:
 http://www.frederiknakstad.com/2013/01/21/authentication-in-single-page-applications-with-angular-js/
 */

muPortalApp.directive('accessLevel', ['$rootScope', 'authsrv', function($rootScope, authsrv) {
  'use strict';
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var prevDisp = element.css('display');
                $rootScope.$watch('authcode', function(role) {
                    if(!authsrv.authorize(attrs.accessLevel))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                });
            }
        };
    }]);//------
/**
params: id
the id is used for:
labelledby: {{id}}_label
describedby: {{id}}_desc
i18n: _{{id}}_
i18n: _{{id}}_desc_
*/
muPortalApp.directive("muCheckbox", function () {
  'use strict';
  return {
    restrict: 'A',
    transclude: true,
    scope:true,
    link: function(scope, element, attrs) {

      scope.id = attrs['id'];

      var tokens = attrs['bindvar'].split('.');
      //"profile.group.item"
      //console.log(tokens);

      scope.bindvar = (scope.profile[tokens[1]])[tokens[2]];


    },
    templateUrl: "partials/mucheckbox.dir.html"
  };
});
//------

/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController', ["$scope", "$window", "authsrv", "profilesrv", function($scope, $window, authsrv, profilesrv) {
  'use strict';
    this.usr = null;
    this.psw = null;

    this.error = null;

    this.success = false;

    this.doLogin = function(){
        var self = this;
        authsrv.login(this.usr, this.psw, function(error){
            self.error = error;
            if(!self.error){
                //succefull login!
                self.success = true;
                //good point to pre-load the profile?? yeahp, at least for testing..
                profilesrv.getProfile(function(profile){
                   console.log("authController.login:loading profile: got: ", profile);
                });
            }
        });
    };

}]);//------

/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('contactController', ['contactsrv', function(contactsrv) {
  'use strict';
    this.name = null;
    this.email = null;
    this.message = null;

    this.error = null;

    this.doContact = function(){
        var self = this;
        //console.log("contactController.doContact ", this.name, this.email, this.message);
        contactsrv.sendMessage(this.name, this.email, this.message, function(error){
            self.error = error;
            if(self.error === null){
                console.log("contact message sent! how to notify the user?");
            }
            else{
                console.log("contact message failed! self.error had been set.");
            }
        });
    };

}]);//------

/**
 * controllers/logoutctrl.js
 * controller for the logout operation. it execute the logout code at construction time.
 */

muPortalApp.controller('logoutController', ["$scope", "$window", "authsrv", function($scope, $window, authsrv) {
  'use strict';
    authsrv.logout();

}]);//------

/**
 * controllers/mainctrl.js
 * controller for the index
 */

muPortalApp.controller('mainController', ["$rootScope", "$scope", "$window",
   function($rootScope, $scope, $window) {
     'use strict';
        /**
         * status inform the current screen and if the user is logged in.
         * @type {string}
         */
        this.status = "_login_anon_";

        /*var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;
        */

        $scope.locale = ($window.navigator.userLanguage || $window.navigator.language);
        console.log("your locale is: " +$scope.locale);

        /**
         * given a partialname, like "welcome_intro.html", return the relative
         * localized path, like "partials/en/welcome_intro.html"
         * @param partialname
         */
        $scope.getLocalizedPartial= function(partialname){
            return "partials/"+$scope.locale.substr(0, 2) + "/" + partialname;
        };

       /**
       *  keep track of changes in route to update the status bar
        */
       var self = this;
       $rootScope.$on("$routeChangeStart",function(event, next, current){
           console.log("routeChangeStart",next.originalPath);
           //parse the route (in the form "/path") to the form "_path_". we expect to match some i18n symbol!
           if(next.originalPath === "/")
            self.status ="_welcome_";
           else{
               self.status = "_"+next.originalPath.substring(1)+"_";
           }
       });



    } ]);//------

/**
 * controllers/logoutctrl.js
 * controller for the logout operation. it execute the logout code at construction time.
 */

muPortalApp.controller('profileController', ["$scope", "profilesrv", function($scope, profilesrv) {
  'use strict';

  $scope.profile = {
    sounds: null,
    engine: null,
    controls: null
  };

  profilesrv.getProfile(function(profile){
    $scope.profile = profile;
  });


  $scope.save = function(){
    console.log("saving profile:", $scope.profile);

    /**
     * temporal fix: right now the directive returns the "bindvar" string as the value of the fields that
     * had not changed. we are going to manually check here that everything is a boolean.

    function _checkField(group, item){
      if(($scope.profile[group])[item] !== true){ ($scope.profile[group])[item] = false;}
    }
    _checkField("sounds", "background");
    _checkField("sounds", "effects");
    _checkField("sounds", "narration");
    _checkField("engine", "clicktowalk");
    _checkField("engine", "mouse");
    _checkField("controls", "clickenabled");
    _checkField("controls", "requireconfirmation");

    console.log("cleaned profile:", $scope.profile);
     */
    profilesrv.saveProfile($scope.profile);

  };

  $scope.onChange = function(){
    console.log("something changed");
  };

}]);//------

/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('virtualworldController', ["$scope", "profilesrv", "localize", function($scope, profilesrv, localize) {
  'use strict';


  var self = this;


  /**
   *
   * @param profile
   */
  this.init = function(profile){
    this.canvas = document.getElementById("c");
    this.manager  = new World01Manager(this.canvas, profile, localize);

    //accessible controller initialization
    this.menu1 = new MuController.Menu("menu1", function(type, entryid){
      /*
      * clever trick! instead of "if .. else" for each MuController.event type,
      * we pass the type as a MuNarrator command so the active stage will receive
      * four different calls: on_selected_menu, on_executed_menu, on_selected_entry, on_executed_entry
      */
      MuNarrator.send(type, {entryid: entryid});
      //return self.manager.onMenuEntryTriggered(entryid);
    },
		function(symbol){
			return localize.getLocalizedString(symbol);
		});

    this.manager.buildAssets();
    MuNarrator.clear();
    this.manager.buildStages();
    this.manager.start();

    $scope.$on('$destroy', function () {
      self.manager.stop();
    });
  };

  /**
   *
   */
  profilesrv.getProfile(function(profile){
    self.init(profile);
  });


}]);
