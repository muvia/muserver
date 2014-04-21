//------- AVATAR CLASS EXTENDS NODE ------------

/**
 * an avatar is a special node that is attached to a grid, and provided special animators and callbacks
 * to move through the grid. 
 * movement is cell-based: it will move from a cell into another. 
 */

/**
 * avatar constructor
 * config object:
 * 	grid: grid this avatar is attached to
 *  row: inicial row
 *  col: inicial col
 *  speed: time required to move from one cell to another (seconds)
 */
MuEngine.Avatar = function(config){
	MuEngine.Node.call(this);
	this.row = 0 | config.row;
	this.col = 0 | config.col;
	this.grid = config.grid;
	this.speed = 0.1 | config.speed; 
	if(this.grid == undefined){
		throw "Avatar.constructor: grid must be defined"; 
	}
	//the current cell
	this.cell = this.grid.getCell(this.row, this.col);
    this.nextCell = null; //when moving..
    this.cell.addChild(this);
	//this.transform.setPos(this.cell.transform.pos);
	//this.transform.update();

};

//chaining prototypes
MuEngine.Avatar.prototype = new MuEngine.Node();

MuEngine.Avatar.DIR_UP = 1;
MuEngine.Avatar.DIR_DOWN = 2;
MuEngine.Avatar.DIR_LEFT = 4;
MuEngine.Avatar.DIR_RIGHT = 8;

/**
 * create an animator that will move the current node from the current cell
 * to the cell pointed by dir. 
 * if the target dir does not exist (out of grid boundary) or is now walkable
 * (either for static or dynamic obstacles) the method will return false.
 * in the other hand, if the movement is allowed, it will return true. 
 * @param: dir: binary flag, "OR" combination of Avatar.DIR_xxx constants. 
 */
MuEngine.Avatar.prototype.move = function(_dir){
	var row = this.row + ((_dir & MuEngine.Avatar.DIR_UP)?1:((_dir & MuEngine.Avatar.DIR_DOWN)?-1:0));
    var col = this.col + ((_dir & MuEngine.Avatar.DIR_RIGHT)?1:((_dir & MuEngine.Avatar.DIR_LEFT)?-1:0));
	this.nextCell = this.grid.getCell(row, col);
	if(this.nextCell == null){
		//out of boundaries!
		return false;
	}
	if(!this.nextCell.isWalkable()){
		this.nextCell = null;
        return false;
	}
    var animator = new MuEngine.Animator({
        start: this.cell.wp,
        end: this.nextCell.wp,
        target: MuEngine.Animator.TARGET_POS
    });
    this.addAnimator(animator);
}
