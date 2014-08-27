
/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('virtualworldController', [function() {
    'use strict';

    var self = this;
    //accessible controller initialization
    this.menu1 = new MuController.Menu("menu1", function(entryid){
        self.onMenuEntryTriggered(entryid);
    });

    //game engine initialization
    this.canvas = document.getElementById("c");

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
    var grid = new MuEngine.Grid(9, 9, 1.0, "#888888");
    var gridNode = new MuEngine.Node(grid);
    gridNode.transform.setPos(-4.5, 0.0, -4.5);

    var putSprite = function(i, j, path){
        var sprite = new MuEngine.Sprite(path);
        sprite.anchor = sprite.ANCHOR_BOTTOM;
        var spriteNode = new MuEngine.Node(sprite);
        grid.getCell(i, j).addChild(spriteNode);
    };

    putSprite(0, 0, "assets/arbol.png");
    putSprite(1, 1, "assets/casa.png");
    putSprite(2, 2, "assets/flor.png");

    //create root node
    this.root = new MuEngine.Node();
    this.root.addChild(axis);
    this.root.addChild(gridNode);

    //create the camera
    this.camera = new MuEngine.Camera(this.canvas);

    MuEngine.setActiveCamera(this.camera);

    //the camera is located at 5 units over the floor, ten units toward the monitor.
    //this setup will produce a view with x to the right, y up and z toward the monitor.
    this.camera.setCenter(vec3.fromValues(0, 10, 10));
    this.camera.lookAt(vec3.fromValues(0, 0, -5));

    //create an avatar. it will be an avatar node plus an animated sprite primitive.
    this.avatarNode = new MuEngine.Avatar({
        row: 5,
        col: 5,
        grid: grid,
        speed:0.1
    });
    var avatarSprite = new MuEngine.Sprite("assets/muvia.png");
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
    avatarSprite.anchor = MuEngine.Sprite.ANCHOR_BOTTOM;
    this.avatarNode.primitive = avatarSprite;
    this.avatarNode.primitive.play("wave-front", true);
    //attachment of the avatarNode to the grid occurs within avatarNode constructor

    this.onMenuEntryTriggered = function(entryid){
      console.log("triggered ", entryid);
    };

    /**
     * render method to update the engine
     */
    this.render = function(){
        var dt = MuEngine.tick();
        MuEngine.clear();
        MuEngine.updateNode(self.root, dt);
        MuEngine.renderNode(self.root);
    };



    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    (function animloop(){
        requestAnimFrame(animloop);
        self.render();
    })();


}]);
