MuEngine  = (function(){
	
	MuEngine = {};

	//--- INTERNAL ATTRIBUTES ----
	
	//active grid
	var g_grid = null;

	//active camera
	var g_camera = null;

	//target fps
	var g_fps = 2;

	//the interval for the event loop
	var g_interval = null;

	var g_start_time = null;


	/**
	 * last result of invoking MuEngine.transformPoint.
	 * it is also used to store the first coord when
	 * invoking MuEngine.transformLine. 
	 */ 
	var pt = vec3.create();
	/**
	 * when invoking MuEngine.transformLine, pt will store
	 * the first coord of the line, and pt2 the last one. 
	 */
	var pt2 = vec3.create();
	


	//--- CONSTRUCTORS AND METHODS ---

 
    
	//------- TRANSFORM CLASS --------
	
	MuEngine.Transform = function(){
		this.pos = vec3.create();
		this.rot = quat.create();
		this.mat = mat4.create();
		this.update();
	};

	/**
	 * call whenever pos or rot changes to update matrix
	 */
	MuEngine.Transform.update = function(){
		mat4.fromRotationTranslation(this.mat, this.rot, this.pos);
	};

	/**
	 * multiply given matrix by this.mat, store result in out
	 */
	MuEngine.Transform.multiply = function(mat, out){
		
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



//------- NODE CLASS ------------

/**
 * Node Constructor
 * implements scene graph.
 * a node has a transform, a primitive and a list of children nodes.  
  */ 
MuEngine.Node = function(primitive){
	this.transform = new MuEngine.transform();	
	this.primitive = primitive; 
	this.children = [ ];
};



	
//-------- CAMERA CLASS -------------
	
	/**
	 * Camera constructor. 
	 * a camera is always attached to a cell. 
	 * it is a polar camera, whose focus is its parent cell.
	 * it performs basic perspective transformation. 
	 */
	MuEngine.Camera = function(canvas){
		this.canvas = canvas;
		this.eye = vec3.create();
		vec3.set(this.eye, 0, 0, -10);
		this.center = vec3.create();
		vec3.set(this.center, 0, 0, 0);
		this.up = vec3.create();
		vec3.set(this.up, 0, 1, 0);
		this.view_mat = mat4.create();
		mat4.lookAt(this.view_mat, this.eye, this.center, this.up); 
		this.proj_mat = mat4.create();
		this.fovy = Math.PI / 180.0;
	    this.aspect = this.canvas.width / this.canvas.height;
		this.near = 0.0; 
		this.far = 10000.0;
		mat4.perspective(this.proj_mat, this.fovy, this.aspect, this.near, this.far);
		
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


	//------- LINE CLASS -------------------
	

	/**
	 * Line is a primitive. it holds two points of type Vector3. 
	 */
	MuEngine.Line	= function(ori, end){
		this.ori =ori;
	  this.end = end;
 	};

	/*
	 * renders the primitive (line)
	 * @param ctx: drawing context
	 * @param wm: modelview matrix (with parent node transformations applied if it is the case)
	 */
	MuEngine.Line.render = function(mat, cam){
		
	};



/**
 * set the current grid to be rendered by the engine
 */
MuEngine.setActiveGrid = function(grid){
	g_grid = grid;
}; 

/**
 * set the active camera to be used to render the world
 */ 
MuEngine.setActiveCamera = function(camera){
	g_camera = camera;
};


/**
 * set the target fps for running the engine
 */ 
MuEngine.setTargetFps = function(fps){
	g_fps = fps;
};

/**
 * starts the gameloop with the given fps.
 * @see MuEngine.setTargetFps to change fps,
 * @see MuEngine.stop to terminate the loop.
 */ 
	MuEngine.start = function(){
	if(this.g_interval != null) return false;
	this.g_interval = setInterval(tick, 1000.0 / this.g_fps);
	this.g_start_time = Date.now();
	return true;	
};

/**
 * stops the game loop (if it is running) and clear the interval
 */ 
MuEngine.stop = function(){
 if(this.g_interval == null) return false;
 clearInterval(this.g_interval);
 this.g_interval = null;
 return true;
};
	
/**
 * transform a point p into pt, using the current grid as world transform,
 * current camera as view transform. 
 * pt is optional, to store the transformed point. result is always applied
 * to local variable MuEngine.pt 
 */
MuEngine.transformPoint = function(p, pt){
			
};

/**
 * transform a line pt-pt2 into ptt-pt2t, using the current  grid and camera for world and 
 * view transform. 
 * pt, pt2 are assumed in world coordinates.
 * if ptt or pt2t are null or undefined, result will be stored in MuEngine.pt and MuEngine pt2  
 */  
MuEngine.transformLine = function(pt, pt2, ptt, pt2t){
   if(ptt == undefined || ptt == null){
		ptt = this.pt;
		pt2t = this.pt2;
	}
	//multiply by view matrix (or inverse view matrix?)

	//multiply by projection matrix

	//multiply by device-to screen matrix

	//store results		

};

/**
 * render a node and all its children. 
 * node is assumed to be the root of the world. 
 * this method will generate recursive calls. 
 */
MuEngine.renderNode = function(node){
	//@todo: move this to private module attributes 
  mat = mat4.create();	
  mat_aux= mat4.create();
  _renderNode(node, mat, mat_aux);	
};

/**
 * recursive function used by MuEngine.renderNode
 * mat_parent  is the previous (stacked) model transformation. this is read-only (locally)
 * mat is the current stacked transformation (after mat_parent). this will be the new parent in the next recursive call.
 */ 
_renderNode = function(node, mat, mat_aux){
  //mat will store mat_parent * node.transform.mat
  node.transform.multiply(mat, mat_aux);	
	if(node.primitive != null){
			node.primitive.render(mat_aux, g_camera);
	};
	for(var i=0; i<node.children.length; ++i){
		//we flip the matrix to avoid the need to copy mat_aux in mat. 			
		_renderNode(node.children[i], mat_aux, mat);
	};	  
};

/**
 *
 */ 
update = function(dt){
};

/**
 *
 */ 
render = function(){
	ctx = this.g_camera.canvas.getContext('2d');
 	ctx.beginPath();
	ctx.moveTo(10, 10);
	ctx.moveTo(110, 10);
	ctx.stroke();
	ctx.beginPath();
 	ctx.moveTo(100, 150);
 	ctx.lineTo(450, 50);		
 	ctx.stroke();	
};

/**
 * compute the elapsed time and invoke update and render methods
 */ 
tick = function(){
	var dt = Date.now() - MuEngine.g_start_time;
	//console.log("tick! "+ dt);
	update(dt);
	render();
};

return MuEngine;
}());
