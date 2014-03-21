MuEngine  = (function(){
	
	MuEngine = {};

	//--- INTERNAL ATTRIBUTES ----
	
	//active grid
	var g_grid = null;

	//active camera
	var g_camera = null;

	//active canvas
	var g_canvas = null;

	//active context
	var g_ctx = null; 

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

 //a reusable, read-only (I hope) zero vector.
	var g_pZero = vec3.fromValues(0, 0, 0);
	
  //a reusable, read-only (I hope) unit vector.
	var g_pOne = vec3.fromValues(1, 1, 1);

	/**
	* cache of MuEngine.imageHandler.
	*/
	var g_imageHandlers =[]; 

 /**
  * default image to be used while the imageHandlers are fully loaded.
	* it is initializaded in lazy-load by MuEngine.getImage method.
 */
	var g_defimg = null;
	
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
		if(this._dirty) this.update();
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


//-------- ANIMATOR CLASS -----------------

/**
 * Animator class constructor
 * @param target: one of Animator.prototype.TARGET_XXX
 * @param type: One of Animator.prototype.TYPE_XXX
 * @param  loops
 * N > 0: Number of executions
 * N <= 0: infinite loop
 */
MuEngine.Animator = function(target, startVal, endVal, type, duration, loops ){
	//configuration parameters
    this.target = target;
		this.loops = loops;
    this.startVal = startVal;
    this.endVal = endVal;
    this.duration = duration;

	//internal status variables
    this.starttime = 0;
		this.status = 0; //idle
		this.val = null;
		this.step = 0.0;
};

//a few public static constants
MuEngine.Animator.prototype.TARGET_POS = 0;
MuEngine.Animator.prototype.TARGET_ROTY  = 1;  

MuEngine.Animator.prototype.TYPE_LINEAR = 0;

MuEngine.Animator.prototype.STATUS_IDLE = 0;
MuEngine.Animator.prototype.STATUS_RUNNING = 1;
MuEngine.Animator.prototype.STATUS_FINISHED = 2; 

MuEngine.Animator.prototype.update = function(dt, node){
	if(this.status === this.STATUS_IDLE){
			this.status = this.STATUS_RUNNING; 
			this.elapsedtime= 0; 
			this.step = 0;
			this.apply(node);
	}
	else if(this.status === this.STATUS_RUNNING){ 
			this.elapsedtime  += dt;
			if(this.elapsedtime > this.duration){
				this.loops--;
				this.step = 1.0;
				this.status = this.STATUS_FINISHED;	
			}else{
				this.step = this.elapsedtime/duration;
			}
			this.apply(node);		
	}
	else if(this.status === this.STATUS_FINISHED){
	}else throw "unknown animator status: " + this.status; 	
};

/**
* private method. apply the current value to the node
*/
MuEngine.Animator.prototype.apply = function(node){
	if(this.target === this.TARGET_POS){
//		node.transform.	
	}else if(this.target === this.TARGET_ROTY){
		
	}else{
		throw "unknown animator target: " + this.target ;
	}		
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
	//world matrix.
	this.wm = mat4.create(); 
	//world position
	this.wp = vec3.create();
};

MuEngine.Node.prototype.addChild = function(node){
	this.children.push(node);
};

/**
* use the given matrix as parent matrix, compute world transformation using local transform
*/
MuEngine.Node.prototype.updateWorldMat = function(worldmat){
	this.transform.multiply(worldmat, this.wm);
	vec3.transformMat4(this.wp, g_pZero, this.wm); 
};


/**
 * recursive function used by MuEngine.renderNode
 */ 
MuEngine.Node.prototype.render = function(mat){
	this.updateWorldMat(mat);
	if(this.primitive != null){
			this.primitive.render(this, g_camera);
	};
	for(var i=0; i<this.children.length; ++i){
		//we flip the matrix to avoid the need to copy mat_aux in mat. 			
		console.log(this.children[i]);
		this.children[i].render(this.wm);
	};	  
};

				
	//-------- CAMERA CLASS -------------
	/**
	 * Camera constructor. 
	 * a camera is always attached to a cell. 
	 * it is a polar camera, whose focus is its parent cell.
	 * it performs basic perspective transformation. 
	 */
	MuEngine.Camera = function(){
		this.eye = vec3.fromValues(0, 0, -10);
		this.fixed_eye = true; 
		this.center = vec3.fromValues( 0, 0, 0);
		this.up = vec3.fromValues( 0, 1, 0);
		this.view_mat = mat4.create();
		this.proj_mat = mat4.create();
		
		//this is for a projection matrix, but we are going to try first 
		//with a ortographic view 
		this.fovy = Math.PI / 180.0;
		this.aspect = g_canvas.width / g_canvas.height;
		this.near = 0.0; 
		this.far = 10000.0;

		//orthographic
		this.near = 0;
		this.far = 10; 
		this.left = -5;
		this.right = 5;
		this.top = 5;
		this.bottom = -5; 
			
		//store the view and proj matrix product to avoid constant multiplication of them.
		this.view_proj_mat = mat4.create();
		this.dirty = true;
	};


	/*
	* camera static attributes (mainly helpers)
	*/		
	MuEngine.Camera.prototype.g_p0 = vec3.create();
	MuEngine.Camera.prototype.g_p1 = vec3.create(); 


	MuEngine.Camera.prototype.update = function(){
		mat4.lookAt(this.view_mat, this.eye, this.center, this.up); 
		//mat4.perspective(this.proj_mat, this.fovy, this.aspect, this.near, this.far);
		mat4.ortho(this.proj_mat, this.left, this.right, this.bottom, this.top, this.near, this.far);
		mat4.multiply(this.view_proj_mat, this.proj_mat, this.view_mat);		
		this.dirty = false;
	};


	/*
	* transforms a point from world coordinates to eye coordinates
	*/
	MuEngine.Camera.prototype.world2eye = function(point, pointout){
		if(this.dirty) this.update();
		vec3.transformMat4(pointout, point, this.view_proj_mat); 
	}

	/**
	 * given a point in world space, multiply by view_mat and proj_mat and store 
	 * result in pointout, in viewport coordinates (pixels)
	 */ 
	MuEngine.Camera.prototype.project = function(point, pointout){
		this.world2eye(point, pointout);
		//transform from normalized device coords to viewport coords..
		pointout[0] = (pointout[0]*g_canvas.width) + (g_canvas.width>>1) ;
		pointout[1] = (pointout[1]*g_canvas.height) + (g_canvas.width>>1) ;
		//pointout[2] = aux2[2];

		//invert Y!
		pointout[1] = g_canvas.height - pointout[1];
		//console.log("Camera.project: device: ",aux2,"->",pointout);
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
	MuEngine.Camera.prototype.moveEye = function(delta){
		var temp =  vec3.create();
		vec3.add(this.eye, this.eye, delta);
		if(!this.fixed_center){
			vec3.add(this.center, this.center, delta);
		}
		this.dirty = true;
	};

	MuEngine.Camera.prototype.centerFixed = function(flag){
		this.fixed_center = flag;
	};

  MuEngine.Camera.prototype.setEye = function(pos){
		this.eye = pos;
		this.dirty = true;
	};

	/**
	* performs frustum culling against a sphere in world coordinates
	* @param center: vec3 in world coordinates
	*	@param radius: radius
	*/
	MuEngine.Camera.prototype.containsSphere = function(center, radious){
		//@todo: implement!
		console.log("Camera.containsSphere: not implemented!");
	};

	/**
	* convenient method to perform culling against sphere, it expects
	* parameters already pre-computed
	* param: center: center in VIEW coordinates. 
	* param: radious: 
	*/
	MuEngine.Camera.prototype.containsSphere2 = function(center, radious){
		
	};


 /**
	* lines are expected in world coordinates
	*/
	MuEngine.Camera.prototype.renderLine = function(ori, end, color){
		this.project(ori,this.g_p0);
		this.project(end,this.g_p1);
		g_ctx.beginPath();
		g_ctx.moveTo(this.g_p0[0],this.g_p0[1]);
		g_ctx.lineTo(this.g_p1[0],this.g_p1[1]);
		g_ctx.closePath();
		g_ctx.strokeStyle = color;
		g_ctx.stroke();
	};

	/**
	* render a sprite. 
	* @param:: x,y, w, h:  origin and extend  of the sprite, world coordinates
	* @param: imghandler: a image handler 
	*/
	MuEngine.Camera.prototype.renderSprite = function(ori, w, h, anchor,  imghandler){
		this.project(ori, this.g_p0);
		//w, h are in world coords.. transform to pixels:
		var wpx = (w * g_canvas.width) / (this.right - this.left);  
		var wpy = (h * g_canvas.height) / (this.top - this.bottom);  
		//how about the anchor?
		var offy = ((1 & anchor) > 0) ? 0 : (((2 & anchor) > 0)? -wpy :-(wpy>>1)); 
		var offx = ((4 & anchor) > 0) ? 0 : (((8 & anchor) > 0)? -wpx :-(wpx>>1)); 
		g_ctx.drawImage(imghandler.img, this.g_p0[0]+offx, this.g_p0[1]+offy, wpx, wpy);
	}
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
	* line static attributes
	*/
	MuEngine.Line.prototype.g_p0 = vec3.create();
  MuEngine.Line.prototype.g_p1 = vec3.create();

	/*
	 * renders the primitive (line)
	 * @param: node: The node this primitive belongs to 
	 */
	MuEngine.Line.prototype.render = function(node, cam){

		vec3.transformMat4(this.g_p0, this.ori, node.wm); 
		vec3.transformMat4(this.g_p1, this.end, node.wm); 
		cam.renderLine(this.g_p0, this.g_p1, this.color);
	};



	//-------- IMAGE HANDLER CLASS -----------------

	/**
	 * Image Handler constructor
	 * it will load imgurl, and use g_defimg while imgurl is fully loaded.
	 */ 
	ImageHandler = function(imgurl){
		this.img = g_defimg;
		//start the async loading process..
		var self = this;
		var realimg = new Image();
		realimg.onload = function(){
			console.log("ImageHandler:loaded " + imgurl);
			self.img = realimg;
		};
		realimg.src = imgurl;  		
	};


	//------------ SPRITE CLASS ----------

	/**
	* Sprite constructor
	* a sprite is a type of node who will render a bitmap.
	* bitmap is loaded through a ImageHandler.
	* width, height will be taken from picture attributes
	*/
	MuEngine.Sprite = function(path /*,width, height*/){
		this.width = 1.0;
		this.height = 1.0;
		this.path = path;
		this.imghandler = MuEngine.getImageHandler(path);
		//bit flag to control anchor. ORed of ANCHOR_XXX flags. 
		this.anchor = 0; 

	};

	/*
	* sprite static attributes
	*/
	MuEngine.Sprite.prototype.g_p0 = vec3.create();
	MuEngine.Sprite.prototype.g_p1 = vec3.create();
	
	MuEngine.Sprite.prototype.ANCHOR_HCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_VCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_CENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_TOP = 1; 
	MuEngine.Sprite.prototype.ANCHOR_BOTTOM = 2;
	MuEngine.Sprite.prototype.ANCHOR_LEFT = 4;
	MuEngine.Sprite.prototype.ANCHOR_RIGHT = 8;

	MuEngine.Sprite.prototype.render = function(node, cam){
		//vec3.set(this.g_p1, this.imghandler.img.width, this.imghandler.img.height, 0.0);	
		vec3.transformMat4(this.g_p0, g_pZero, node.wm); 
		cam.renderSprite(this.g_p0, this.width, this.height, this.anchor,  this.imghandler);
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

//calculate the matrix center and dump to console
MuEngine.mat4centerLog= function(label, mat){
	p = vec3.fromValues(0, 0, 0);
	vec3.transformMat4(p, p, mat);
	console.info("MuEngine.mat4centerLog: "+label+":"+p[0].toFixed(2)+", "+p[1].toFixed(2)+", "+p[2].toFixed(2));
};

				//------- PRIORITY QUEUE CLASS ------------

				/**
				 * Priority Queue
				 * Sort nodes by distance to camera 
				 * internal pnode structure is:
				 * pnode{data, next}
				 * @param: comparator: a function to compare elements:
				 * comparator(a, b): return true if a > b, false if a <= b
				 */ 
				MuEngine.PriorityQueue= function(comparator){
					this.size = 0; 
					this.head = null; 	
					this.comparator = comparator;
				};

				MuEngine.PriorityQueue.prototype.push = function(node){
					if(this.head == null){
						this.head = {data: node, next: null }; 
						this.size = 1; 
					}else{
						if(this.comparator(node, this.head.data)){
							var aux = this.head;
							this.head = {data:node, next:aux};
						}else{
							var prev = this.head;
							var curr = this.head.next;
						do{	
							if(curr == null){
								prev.next = {data:node, next:null};	
								this.size += 1;
								return;
							}

							if(this.comparator(node,curr.data)){
								prev.next = {data:node, next:curr};	
								this.size += 1;
								return;
							}
							prev = curr;
							curr = curr.next;
							}while(true);
						}
						this.size += 1;
					}
				};

				MuEngine.PriorityQueue.prototype.dump = function(){
					var pnode = this.head; 
					var out = "";
					while(pnode != null){
						out += pnode.data;
						pnode = pnode.next; 
					}
					return out;
				};
				
				MuEngine.PriorityQueue.prototype.peek = function(){
					if(this.head == null) return null;
					return this.head.data; 
				}
				
				MuEngine.PriorityQueue.prototype.pop = function(){
					if(this.head == null) return null;
					var _head = this.head;
					this.head = this.head.next;
					var data = _head.data;
					this.size -= 1; 
					_head.next = _head.data = null;
					return data; 
				}

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
* utility method 
*/
MuEngine.deg2rad = function(deg){
  //@todo: the division would be stored in a private static var
  return  deg * (Math.PI / 180);
};


/**
 * recursive function used by MuEngine.renderNode
 */ 
_renderNode = function(node, mat){

	node.updateWorldMat(mat);
	if(node.primitive != null){
			node.primitive.render(node, g_camera);
	};
	for(var i=0; i<node.children.length; ++i){
		//we flip the matrix to avoid the need to copy mat_aux in mat. 			
		_renderNode(node.children[i], node.wm);
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
