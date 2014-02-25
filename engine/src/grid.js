	//------- GRID CLASS ------------------

	/**
	 * Grid constructor 
	 * width x height
	 * @param width num of rows
	 * @param height num of columns
	 * @param cellsize length of a cell side 
	 */
	MuEngine.Grid = function(width, height, cellsize){
		this.width = width;
		this.height = height;
	 	this.cellsize = cellsize;
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

	MuEngine.Grid.prototype.render = function(mat, cam){
		var w = this.width*this.cellsize;
		pt[1] = 0;
		pt[2] = 0;
		pt2[1] = w;
		pt2[2] = w; 		
		//draw columns
		var aux = 0;
		for(var i=0; i<=this.width; ++i){
			pt[0] = aux;
			pt2[0] = aux; 
			aux += this.cellsize;
		};

	};
