//------- CELL CLASS EXTENDS NODE ------------

/**
 * this is a private class, not expected to be instantiated for the user
 */

var Cell = function(i, j, cellsize){
	MuEngine.Node.call(this);
	this.row = i;
	this.col = j;
	//a vector to store eye coordinates
	this.eyePos = vec3.create();
	this.transform.setPos(i*cellsize, 0, j*cellsize);
	this.transform.update();
};

//chaining prototypes
Cell.prototype = new MuEngine.Node();


