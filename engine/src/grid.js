	//------- GRID CLASS ------------------

	/**
	 * Grid constructor 
	 * width x height
	 * @param width num of rows
	 * @param height num of columns
	 * @param cellsize length of a cell side 
	 */
	MuEngine.Grid = function(width, height, cellsize, color){
		this.width = width;
		this.height = height;
	 	this.cellsize = cellsize;
		this.color = color || "#cccccc"; 
		this.cells = new Array(width * height);
		for(var i=0; i<this.width; ++i){
				for(var j=0; j< this.height; ++j)
					this.cells[(i*this.width)+j] = new Cell(i, j);
		};
	};

	/*
	* Grid static attributes
	*/
	MuEngine.Grid.prototype.g_p0 = vec3.create();
  MuEngine.Grid.prototype.g_p1 = vec3.create();


	/**
	 * return a Cell object for the given i,j coordinate.
	 * null if wrong coords. 
	 */ 
	MuEngine.Grid.prototype.getCell = function(i, j){
		if(i < 0 || j < 0 || i >= this.width || j >= this.height) 
			return null;
		return this.cells[i*this.width+ j];	
	};

	MuEngine.Grid.prototype.render = function(node, cam){
		var w = this.width*this.cellsize;
		this.g_p0[1] = 0;
		this.g_p0[2] = 0;
		this.g_p1[1] = 0;
		this.g_p1[2] = w; 		
		//draw rows
		var aux = 0;
		for(var i=0; i<=this.height; ++i){
			this.g_p0[0] = aux;
			this.g_p1[0] = aux; 
			node.transform.multP(this.g_p0, this.g_p0);
			node.transform.multP(this.g_p1, this.g_p1);
			cam.renderLine(this.g_p0, this.g_p1, this.color);
			aux += this.cellsize;
		};
		var h = this.height*this.cellsize;
		this.g_p0[0] = 0;
		this.g_p0[1] = 0;
		this.g_p1[0] = h;
		this.g_p1[1] = 0; 		
		aux = 0;
		for(var j=0; j<=this.width; ++j){
			this.g_p0[2] = aux;
			this.g_p1[2] = aux; 
			vec3.transformMat4(this.g_p0, this.g_p0, mat); 
			vec3.transformMat4(this.g_p1, this.g_p1, mat); 
			cam.renderLine(this.g_p0, this.g_p1, this.color);
			aux += this.cellsize;
		};
	};
