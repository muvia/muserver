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
		this._dirty = true;
		this.pos = vec3.create();
		this.rot = quat.create();
		this.mat = mat4.create();
		this.scale = 1.0; //we assume a uniform scale
		this.update();
	};

	/**
	 * call whenever pos or rot changes to update matrix
	 */
	MuEngine.Transform.prototype.update = function(){
		mat4.fromRotationTranslation(this.mat, this.rot, this.pos);
	
	/*instead of using glmatrix scale method, we implement a direct transform
  to take adventage of the uniform scale feature*/
		this.mat[0] = this.mat[0] * this.scale;
    this.mat[1] = this.mat[1] * this.scale;
    this.mat[2] = this.mat[2] * this.scale;
    this.mat[3] = this.mat[3] * this.scale;
    this.mat[4] = this.mat[4] * this.scale;
    this.mat[5] = this.mat[5] * this.scale;
    this.mat[6] = this.mat[6] * this.scale;
    this.mat[7] = this.mat[7] * this.scale;
    this.mat[8] = this.mat[8] * this.scale;
    this.mat[9] = this.mat[9] * this.scale;
    this.mat[10] = this.mat[10] * this.scale;
    this.mat[11] = this.mat[11] * this.scale;

		this._dirty = false;
	};

	/**
	 * multiply given matrix by this.mat, store result in out
	 */
	MuEngine.Transform.prototype.multiply = function(mat, out){
		mat4.multiply(out, this.mat, mat);
	};

 /**
	* multiply a given point for this.mat, store the result in out
	*/
	MuEngine.Transform.prototype.multP = function(p, out){
		if(this._dirty) this.update();
		vec3.transformMat4(out, p, this.mat); 		
	};

 /*
 * 
 */
 MuEngine.Transform.prototype.setPos= function(x, y, z){
 	vec3.set(this.pos, x, y, z); 
  this._dirty = true;
 };

 /**
 * rotation over axis Z is the usual rotation used to 
 * rotate in 2d. we expect it to be the most used (maybe the unique?)
 * kind of rotation employed in this engine.
 */
 MuEngine.Transform.prototype.setRotZ= function(anglerad){
 	quat.rotateZ(this.rot, this.rot, anglerad); 

	this._dirty = true; 
};

/**
* we assume uniform scale
*/
MuEngine.Transform.prototype.setScale = function(scale){
	this.scale = scale; 
  this._dirty = true;
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
	this.transform = new MuEngine.Transform();	
	this.primitive = primitive || null; 
	this.children = [ ];
};

MuEngine.Node.prototype.addChild = function(node){
	this.children.push(node);
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
		//@TODO: make sure the context is safe to reuse between render calls
		this.ctx = canvas.getContext('2d');
		this.eye = vec3.create();
		this.fixed_eye = true; 
		vec3.set(this.eye, 0, 0, -10);
		this.center = vec3.create();
		vec3.set(this.center, 0, 0, 0);
		this.up = vec3.create();
		vec3.set(this.up, 0, 1, 0);
		this.view_mat = mat4.create();
		this.proj_mat = mat4.create();
		this.fovy = Math.PI / 180.0;
		this.aspect = this.canvas.width / this.canvas.height;
		this.near = 0.0; 
		this.far = 10000.0;
		//store the view and proj matrix product to avoid constant multiplication of them.
		this.view_proj_mat = mat4.create();
		this.dirty = true;
	};

	MuEngine.Camera.prototype.update = function(){
		mat4.lookAt(this.view_mat, this.eye, this.center, this.up); 
		mat4.perspective(this.proj_mat, this.fovy, this.aspect, this.near, this.far);
		mat4.multiply(this.view_proj_mat, this.view_mat, this.proj_mat);		
		this.dirty = false;
	};

	/**
	 * given a point in world space, multiply by view_mat and proj_mat and store 
	 * result in pointout
	 */ 
	MuEngine.Camera.prototype.project = function(point, pointout){
		if(this.dirty) this.update();
		//transform from world space to normalized device coords..
		vec3.transformMat4(pointout, point, this.view_proj_mat); 
		//transform from normalized device coords to viewport coords..
		//@todo: the zeroes at the end are the viewport origin coordinates
		pointout[0] = (pointout[0]+1)*(this.canvas.width >> 1) + 0;
		pointout[1] = (pointout[1]+1)*(this.canvas.height >> 1) + 0;
		//invert Y!
		pointout[1] = this.canvas.height - pointout[1];
		console.log("Camera.project: ",point,"->", pointout);
	};

  /**
	 * set the center of the camera at the given point. 
	 * if the eyefixed flag is false, the eye will be updated to keep his relative position to the center.
	 */
	MuEngine.Camera.prototype.setCenter = function(pos){
		this.center = pos;
		this.dirty = true;	
	};

	/**
	 * move the center of the camera using a delta vector
	 */
	MuEngine.Camera.prototype.moveCenter = function(delta){
		var temp =  vec3.create();
		vec3.add(this.center, this.center, delta);
		if(!this.fixed_eye){
			vec3.add(this.eye, this.eye, delta);
		}
		this.dirty = true;
	};

	MuEngine.Camera.prototype.eyeFixed = function(flag){
		this.fixed_eye = flag;
	};

  MuEngine.Camera.prototype.setEye = function(pos){
		this.eye = pos;
		this.dirty = true;
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
	MuEngine.Line	= function(ori, end,  color){
		this.ori =ori;
	  this.end = end;
		this.color = color || "#cccccc"; 
 	};

	/*
	 * renders the primitive (line)
	 * @param ctx: drawing context
	 * @param wm: modelview matrix (with parent node transformations applied if it is the case)
	 */
	MuEngine.Line.prototype.render = function(mat, cam){
		/*@todo: MULTIPLY ori, end by mat before cam.project*/
		cam.project(this.ori,pt);
		cam.project(this.end,pt2);
		console.log("line.render: ", this.ori[0],",",this.ori[1],":",this.end[0],",",this.end[1]," to-> ",pt[0], ",",pt[1], ":",pt2[0],",",pt2[1]);
		cam.ctx.beginPath();
		cam.ctx.moveTo(pt[0],pt[1]);
		cam.ctx.lineTo(pt2[0],pt2[1]);
		cam.ctx.closePath();
		cam.ctx.strokeStyle = this.color;
		cam.ctx.stroke();
	};




/**
* common utilities.
* added as static methods to MuEngine module
*/

/**
 * utility method to check for vector equality.
 */
MuEngine.vec3equ = function(a, b){
	return vec3.squaredDistance(a, b) < 0.0001;
};


MuEngine.vec3log = function(label, p){
	console.info("MuEngine.vec3log: "+label+":"+p[0].toFixed(2)+", "+p[1].toFixed(2)+", "+p[2].toFixed(2));
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
