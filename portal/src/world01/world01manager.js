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

  var avatarNode = null;

  //move this to engine?
  var running = false;

  var sounds = {
    background: null
  };





  //-------------------- CLASS MANAGER -------------------
  /**
   *
   * @constructor
   */
  var manager = function(canvas, accesibilityProfile){
    this.canvas = canvas;
    this.profile = accesibilityProfile;
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

    fruits = [];

    fruits.push(this.putFruit(1, 0, 0));
    fruits.push(this.putFruit(2, 0, 1));
    fruits.push(this.putFruit(3, 0, 2));
    fruits.push(this.putFruit(4, 0, 3));
    fruits.push(this.putFruit(5, 0, 4));

    //create the camera
    camera = new MuEngine.Camera(this.canvas);
    camera.setOrtho(0, 10, -10, 10, -5, 5);

    MuEngine.setActiveCamera(camera);

    //the camera is located at 5 units over the floor, ten units toward the monitor.
    //this setup will produce a view with x to the right, y up and z toward the monitor.
    camera.setCenter(vec3.fromValues(0, 10, 10));
    camera.lookAt(vec3.fromValues(0, 0, -5));

    //create an avatar. it will be an avatar node plus an animated sprite primitive.
    avatarNode = new MuEngine.Avatar({
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
    avatarSprite.anchor = MuEngine.Sprite.prototype.ANCHOR_BOTTOM;

    avatarNode.primitive = avatarSprite;
    avatarNode.mapWalkAnimation("walk-front","south");
    avatarNode.mapWalkAnimation("walk-back","north");
    avatarNode.mapWalkAnimation("walk-right","west");
    avatarNode.mapWalkAnimation("walk-left","east");

    avatarNode.addIdleAnimation("wave-front");

    avatarNode.primitive.play("wave-front", true);
    //attachment of the avatarNode to the grid occurs within avatarNode constructor

    //initialize sounds
    this.initSounds();

    //temporal, just for debug!
    window.avatarNode = avatarNode;
    window.gridNode = gridNode;

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

  manager.prototype.playSound = function(name){
    if(sounds[name]){
      sounds[name].play();
    }
  };

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
    MuEngine.p0[0] = avatarNode.wp[0];
    MuEngine.p0[1] = camera.center[1];
    MuEngine.p0[2] = Math.min(avatarNode.wp[2]+CAMERA_DISTANCE, CAMERA_DISTANCE);
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



  manager.prototype.onMenuEntryTriggered = function(entryid){
    console.log("triggered ", entryid);

    if(entryid === "caminar_norte"){
      avatarNode.move("north");
    }
    else if(entryid === "caminar_sur"){
      avatarNode.move("south");
    }
    else if(entryid === "caminar_oriente"){
      avatarNode.move("west");
    }
    else if(entryid === "caminar_occidente"){
      avatarNode.move("east");
    }
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
   * @param i
   * @param j
   * @param tiley
   * @returns {MuEngine.Node}
   */
  manager.prototype.putFruit = function(i, j, tiley){
    var sprite = new MuEngine.Sprite("assets/"+this.profile.engine.assetdetail+"/fruits.png");
    sprite.width = 1.5;
    sprite.height = 1.5;
    sprite.anchor = sprite.ANCHOR_BOTTOM;
    sprite.tilew = 64;
    sprite.tileh = 64;
    sprite.tiley = tiley;
    var spriteNode = new MuEngine.Node(sprite);
    spriteNode.transform.setPos(0.5, 0, 0.9);
    grid.getCell(i, j).addChild(spriteNode);
    return spriteNode;
  };


  /**
  * initializes all the stages and actions required for this world
  */
  manager.prototype.buildStages = function(){
    var self = this;
    MuNarrator.clear();
    MuNarrator.addStage("welcome", function(msg_type, params){ self.welcomeStage(msg_type, params);});
  };

  /**
  * function that implements the welcome stage
  */
  manager.prototype.welcomeStage = function(msg_type, params){
    if(msg_type === "enter"){
      console.log("entering welcome stage!");
    }
  };




  return manager;

})(MuEngine);
