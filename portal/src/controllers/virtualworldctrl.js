
/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('virtualworldController', [function() {

    //accessible controller initialization
    this.menu1 = new MuController.Menu("menu1", "enter");

    //game engine initialization
    var canvas = document.getElementById("c");

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
    var grid = new MuEngine.Grid(8, 8, 1.0, "#888888");
    var gridNode = new MuEngine.Node(grid);
    gridNode.transform.setPos(0.3, 0.0, 0.3);

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
    var root = new MuEngine.Node();
    root.addChild(axis);
    root.addChild(gridNode);

    //create the camera
    camera = new MuEngine.Camera(canvas);

    MuEngine.setActiveCamera(camera);

    camera.setEye(vec3.fromValues(5, 5, -10));
    camera.setCenter(vec3.fromValues(0, 0, 0));

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

    window.addEventListener('keydown', onkeydown,false);

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


}]);