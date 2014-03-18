	//-------- CELL CLASS -----------------

	/**
	 * Cell constructor. 
	 * Cell is a subclass of Node.   
	 * it is private to the module, only Grid is able to 
	 * instantiate cells.
	 */ 
	Cell = function(row, col){
		//execute constructor on parent class
		MuEngine.Node.call(this);
		this.row = row;
		this.col = col;
	};

	// Cell inherits from Node
	Cell.prototype = new MuEngine.Node();

	// correct the constructor pointer because it points to Node
	Cell.prototype.constructor = Cell;
