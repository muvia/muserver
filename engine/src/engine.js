
/**
 * set the current canvas where the engine will draw. 
 * it will init both g_canvas and g_ctx module attributes.
 */
MuEngine.setActiveCanvas = function(canvas){
	g_canvas = canvas;
	g_ctx = g_canvas.getContext('2d');
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
* clear the current canvas
*/
MuEngine.clear = function(){
	g_ctx.clearRect(0, 0, g_canvas.width, g_canvas.height);
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
* load a image. it will return a MuEngineImageHandler that will allow to use a 
* dummy image while the final one is being loaded. this will simplify the coding because
* the developer won't need to handle load callbacks
*/
MuEngine.getImageHandler  = function(imgpath){
	//1. check if image has already been loaded
	if(g_imageHandlers[imgpath] != undefined){
		return g_imageHandlers[imgpath];
	}

	//2. check if default image is loaded, else, create it. 
	if(g_defimg == null){
		g_defimg = new Image();
		g_defimg.src = "data:image/gif;base64,R0lGODlhEAAOALMAAOazToeHh0tLS/7LZv/0jvb29t/f3//Ub//ge8WSLf/rhf/3kdbW1mxsbP//mf///yH5BAAAAAAALAAAAAAQAA4AAARe8L1Ekyky67QZ1hLnjM5UUde0ECwLJoExKcppV0aCcGCmTIHEIUEqjgaORCMxIC6e0CcguWw6aFjsVMkkIr7g77ZKPJjPZqIyd7sJAgVGoEGv2xsBxqNgYPj/gAwXEQA7";
	}	
	//3. create an image handler with the default image, and start the loading of the real one.
	var handler = new ImageHandler(imgpath);	
  g_imageHandlers[imgpath]= handler;	
	return handler;
};

/**
 * render a node and all its children. 
 * node is assumed to be the root of the world. 
 * this method will generate recursive calls. 
 */
MuEngine.renderNode = function(node){
	//@todo: move this to private module attributes 
  mat = mat4.create();	
  node.render(mat);	
};

/**
 * compute the elapsed time 
 */ 
MuEngine.tick = function(){
	var now = Date.now();
	var dt = now - g_start_time;
	g_start_time = now;
	return dt;
};

/**
* Similar to renderNode, but invokes update(dt) in each node.
*/
MuEngine.updateNode = function(node, dt){
	node.update(dt);
		for(var i=0; i<node.children.length; ++i){
		MuEngine.updateNode(node.children[i], dt);
	};	
}

return MuEngine;
}());
