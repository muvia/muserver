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
	this.grid = config.grid;
	this.speed = 0.1 | config.speed; 
	if(this.grid == undefined){
		throw "Avatar.constructor: grid must be defined"; 
	}
	//the current cell
	this.cell = this.grid.getCell(config.row, config.col);
  this.nextCell = null; //when moving..
  this.cell.addChild(this);
	this.dir = 0; //zero if not moving. DIR_XX flag if moving.
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
  //return if already moving
  if(this.dir != 0) return;
    var row = this.cell.row + ((_dir & MuEngine.Avatar.DIR_UP)?1:((_dir & MuEngine.Avatar.DIR_DOWN)?-1:0));
    var col = this.cell.col + ((_dir & MuEngine.Avatar.DIR_RIGHT)?1:((_dir & MuEngine.Avatar.DIR_LEFT)?-1:0));
    this.nextCell = this.grid.getCell(row, col);
    if(this.nextCell == null){
        //out of boundaries!
        return false;
    }
    if(!this.nextCell.isWalkable()){
        this.nextCell = null;
        return false;
    }
    console.log("moving dir ", _dir, " from ", this.cell.row , ",", this.cell.col, " to ", row, ",", col);
    this.dir = _dir;
    _this = this;
  var animator = new MuEngine.AnimatorPos({
      start: this.cell.wp,
      end: this.nextCell.wp,
			cb: function(){
				_this.cell.removeChild(_this);
				_this.cell = _this.nextCell;
				_this.cell.addChild(_this);
				_this.nextCell = null;	
				_this.dir = 0;
				_this.transform.setPos(0, 0, 0);
				//_this.transform.update();
			}
    });
    this.addAnimator(animator);
}
