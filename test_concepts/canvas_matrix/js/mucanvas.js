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

	//--- CONSTRUCTORS AND METHODS ---


	//-----  TRANSFORM CLASS ---------
	/**
	 * represents a transformation in mu-space (that, btw, is 
	 * a simplified version of a semi-3d space.. )
	 * in other words, it handle 2d translation, 2d-uniform scale, 
	 * no-rotation (over floor plane). but it add a 3rd dimension for 
	 * camera and basic  perspective correction with simple painter algorithm z-ordering.
	 */ 	
	MuEngine.Transform = function(tx=0, ty=0, s=1.0, parent=null){
		this.tx = tx;
		this.ty = ty;
		this.s = s;	
		this.parent = null;
	};




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
		//model-world matrix
		this.transform = new MuEngine.Transform();
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
		this.transform = new MuEngine.Transform();
		//projection matrix
		this.transform = new MuEngine.Transform();
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
