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
	var pt = $V(0.0, 0.0, 0.0);
	/**
	 * when invoking MuEngine.transformLine, pt will store
	 * the first coord of the line, and pt2 the last one. 
	 */
	var pt2 = $V(0.0, 0.0, 0.0);
	


	//--- CONSTRUCTORS AND METHODS ---




	//------- OBJECT CLASS ------------

	/**
	 * Object constructor. 
	 * Objects are attached to cells in order to be rendered.
	 */ 
	MuEngine.Object = function(){
	};


	//------- LINE CLASS -------------------
	

	MuEngine.Line	= function(){
		this.ori = V3.$(0, 0, 0);
	  this.end = V3.$(100.0, 100.0, 100.0);
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
	 * Camera constructor. 
	 * a camera is always attached to a cell. 
	 * it is a polar camera, whose focus is its parent cell.
	 * it performs basic perspective transformation. 
	 */
	MuEngine.Camera = function(canvas){
		this.canvas = canvas;
		//view matrix
	};
	

	/**
	 * set the current grid to be rendered by the engine
	 */
	MuEngine.setActiveGrid = function(grid){
		this.g_grid = grid;
	}; 

	/**
	 * set the active camera to be used to render the world
	 */ 
	MuEngine.setActiveCamera = function(camera){
		this.g_camera = camera;
	};


	/**
	 * set the target fps for running the engine
	 */ 
	MuEngine.setTargetFps = function(fps){
		this.g_fps = fps;
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
	MuEngine.transformPoint(p, pt){
			
	};

	/**
	 * transform a line l into lt, using the current  grid and camera for world and 
	 * view transform. 
	 * lt is optional, to store the transformed line. result is always applied 
	 * to local variable MuEngine.pt and MuEngine.pt2. 
	 */  
	MuEngine.transformLine(l, lt){
	
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
