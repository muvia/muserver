MuEngine  = (function(){
	
	MuEngine = {};

	//--- INTERNAL ATTRIBUTES ----
	
	//active grid
	var g_grid = null;

	//--- CONSTRUCTORS AND METHODS ---


	//------- OBJECT CLASS ------------

	/**
	 * Object constructor. 
	 * Objects are attached to cells in order to be rendered.
	 */ 
	MuEngine.Object = function(){
	};


	//-------- CELL CLASS -----------------

	/**
	 * Cell constructor. 
	 * it is private to the module, only Grid is able to 
	 * instantiate cells.
	 */ 
	Cell = function(row, col){
		this.row = row;
		this.col = col;
		this.objects = {};
	};

	//------- GRID CLASS ------------------

	/**
	 * Grid constructor 
	 * width x height
	 */
	MuEngine.Grid = function(width, height){
		this.width = width;
		this.height = height;
		this.cells = new Array(width * height);
		for(var i=0; i<this.width; ++i){
				for(var j=0; j< this.height; ++j)
					this.cells[(i*this.width)+j] = new Cell(i, j);
		};
	};

	/**
	 * return a Cell object for the given i,j coordinate.
	 * null if wrong coords. 
	 */ 
	MuEngine.Grid.prototype.getCell = function(i, j){
		if(i < 0 || j < 0 || i >= this.width || j >= this.height) 
			return null;
		return this.cells[i*this.width+ j];	
	};

	//-------- CAMERA CLASS -------------
	



	/**
	 * set the current grid to be rendered by the engine
	 */
	MuEngine.setActiveGrid = function(grid){
		this.g_grid = grid;
	}; 




	return MuEngine;
}());
