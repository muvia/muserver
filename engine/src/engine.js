
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
* load a image. it will return a MuEngineImageHandler that will allow to use a 
* dummy image while the final one is being loaded. this will simplify the coding because
* the developer won't need to handle load callbacks
*/
MuEngine.getImage = function(imgpath){
	//1. check if default image is loaded, else, create it. 
	if(g_defimg == null){
		
	}
	//2. create an image handler with the default image, and start the loading of the real one.

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
* utility method 
*/
MuEngine.deg2rad = function(deg){
  //@todo: the division would be stored in a private static var
  return  deg * (Math.PI / 180);
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
