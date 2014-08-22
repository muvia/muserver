
/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('virtualworldController', [function() {

    var self = this;
    //accessible controller initialization
    this.menu1 = new MuController.Menu("menu1", function(entryid){
        self.onMenuEntryTriggered(entryid);
    });

    //game engine initialization
    canvas = document.getElementById("c");

    MuEngine.setActiveCanvas(canvas);

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

    putSprite = function(i, j, path){
        sprite = new MuEngine.Sprite(path);
        sprite.anchor = sprite.ANCHOR_BOTTOM;
        spriteNode = new MuEngine.Node(sprite);
        grid.getCell(i, j).addChild(spriteNode);
    };

    putSprite(0, 0, "assets/arbol.png");
    putSprite(1, 1, "assets/casa.png");
    putSprite(2, 2, "assets/flor.png");

    //create root node
    root = new MuEngine.Node();
    root.addChild(axis);
    root.addChild(gridNode);

    //create the camera
    camera = new MuEngine.Camera(canvas);

    MuEngine.setActiveCamera(camera);

    //the camera is located at 5 units over the floor, ten units toward the monitor.
    //this setup will produce a view with x to the right, y up and z toward the monitor.
    camera.setCenter(vec3.fromValues(0, 10, 10));
    camera.lookAt(vec3.fromValues(0, 0, -5));



    //create an avatar. it will be an avatar node plus an animated sprite primitive.
    var avatarNode = new MuEngine.Avatar({
        row: 5,
        col: 5,
        grid: grid,
        speed:0.1
    });
    avatarSprite = new MuEngine.Sprite("assets/personita.png");
    //invoking "addAnimation" on a normal sprite transform it into an animated sprite
    sprite.width = 1.0;
    sprite.height = 1.28;
    sprite.tilew = 100;
    sprite.tileh = 128;
    spriteNode.primitive.addAnimation("side-walk", 0, [0, 1, 0, 2], 1000);
    spriteNode.primitive.addAnimation("front-walk", 1, [0, 1, 0,  2], 1000);
    avatarSprite.anchor = sprite.ANCHOR_BOTTOM;
    avatarNode.primitive = avatarSprite;
    //attachment of the avatarNode to the grid occurs within avatarNode constructor



//add an animator to the grid, with default values
    addPosAnimator = function(){
        var animator = new MuEngine.AnimatorPos({
            start: vec3.fromValues(0, 0, 0),
            end: vec3.fromValues(1, 0, 1)
        });
        gridNode.addAnimator(animator);
    };

//add an animator to the grid, with default values
    addRotAnimator = function(){
        var animator = new MuEngine.AnimatorRotY({
            start: 0,
            end: MuEngine.deg2rad(180)
        });
        gridNode.addAnimator(animator);
    };

    /*window.addEventListener('keydown', onkeydown,false);

    function onkeydown(e){
        var code = e.keyCode;

        switch (code) {
            case 37://Left key
                console.log("Left");
                camera.move(vec3.fromValues(0.1, 0, 0));
                break;
            case 38: //Up key
                console.log("Up");
                camera.move(vec3.fromValues(0, 0.1, 0));
                break;
            case 39: //Right key
                console.log("Right");
                camera.move(vec3.fromValues(-0.1, 0, 0));
                break;
            case 40: //Down key
                console.log("Down");
                camera.move(vec3.fromValues(0, -0.1, 0));
                break;
            case 80: //P key
                console.log("add pos animator");
                addPosAnimator();
                break;
            case 82: //R key
                console.log("add rot animator");
                addRotAnimator();
                break;
            default: console.log(code); //Everything else
        }
    };
    */

    this.onMenuEntryTriggered = function(entryid){
      console.log("triggered ", entryid);
    };

    /**
     * render method to update the engine
     */
    render = function(){
        var dt = MuEngine.tick();
        MuEngine.clear();
        MuEngine.updateNode(root, dt);
        MuEngine.renderNode(root);
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
        render();
    })();


}]);