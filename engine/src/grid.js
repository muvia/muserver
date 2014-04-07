	//------- GRID CLASS ------------------

	/**
	 * helper sort function for the render queue of the grid
	 */
	_compareCellsByEyePos = function(cellA, cellB){
		return cellA.eyePos[2] < cellB.eyePos[2];
	};

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
		this.queue = new MuEngine.PriorityQueue(_compareCellsByEyePos);
		for(var i=0; i<this.width; ++i){
				for(var j=0; j< this.height; ++j){
					var cell = new MuEngine.Node();
					//enrich the node with cell attributes..
					cell.row = i;
					cell.col = j;
					//a vector to store eye coordinates
					cell.eyePos = vec3.create();
					cell.transform.setPos(i*cellsize, 0, j*cellsize);
					cell.transform.update();
					this.cells[(i*this.height)+j] = cell;
				}
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
		return this.cells[(i*this.height)+ j];	
	};

	MuEngine.Grid.prototype.render = function(node, cam){
		this._renderGrid(node, cam);
		for(var i=0; i<this.cells.length; ++i){
			var cell = this.cells[i];
			cam.world2eye(cell.transform.pos, cell.eyePos);
			//here its a good point to perform occlusion culling..
			this.queue.push(cell);
		}	
		//hopefully, here we have a list of visible cells sorted by depth..
		var cell = this.queue.pop();
		while(cell!=null){
			cell.render(node.wm);
			cell = this.queue.pop();
		} 
		
	};

	MuEngine.Grid.prototype._renderGrid = function(node, cam){
		var w = this.width*this.cellsize;
		//draw rows
		var aux = 0;
		for(var i=0; i<=this.height; ++i){
			vec3.set(this.g_p0, aux, 0, 0);
			vec3.set(this.g_p1, aux, 0, w);
			node.transform.multP(this.g_p0, this.g_p0);
			node.transform.multP(this.g_p1, this.g_p1);
			cam.renderLine(this.g_p0, this.g_p1, this.color);
			aux += this.cellsize;
		};
		var h = this.height*this.cellsize;
		aux = 0;
		for(var j=0; j<=this.width; ++j){
			vec3.set(this.g_p0, 0, 0, aux);
			vec3.set(this.g_p1, h, 0, aux);
			node.transform.multP(this.g_p0, this.g_p0);
			node.transform.multP(this.g_p1, this.g_p1);
			cam.renderLine(this.g_p0, this.g_p1, this.color);
			aux += this.cellsize;
		};
	};


	MuEngine.Grid.prototype.update = function(dt){
		for(var i=0; i<this.cells.length; i++){
			this.cells[i].update(dt);
		}	
	};
