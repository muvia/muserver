/**
 MuEngine: accesible multiplayer game engine
 Copyright (C) 2014 mundopato inc 

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 contact: http://www.mundopato.com
 */
MuEngine  = (function(){
    'use strict';
	
	var MuEngine = {};

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

	var g_start_time = Date.now();

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
		mat4.multiply(out, mat, this.mat);
	};

 /**
	* multiply a given point for this.mat, store the result in out
    * when used within a node object, it is equivalent to a LOCAL transform!
    * for obtain a GLOBAL transform use the node.multP method.
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
	quat.identity(this.rot);
 	quat.rotateZ(this.rot, this.rot, anglerad); 
	this._dirty = true; 
};

 /**
 * rotation over axis Y is used to rotate some 3d objects, like nodes and grids, 
 around the vertical axis.
 */
 MuEngine.Transform.prototype.setRotY= function(anglerad){
	quat.identity(this.rot);
 	quat.rotateY(this.rot, this.rot, anglerad); 
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
	 parameters as attributes of a config object: 
		target, startVal, endVal, type, duration, loops 
 * @param target: one of Animator.prototype.TARGET_XXX
 * @param type: One of Animator.prototype.TYPE_XXX
 * @param  loops
 * N > 0: Number of executions
 * N <= 0: infinite loop
 */
MuEngine.Animator  = function(config){
  //prototype chaining will call this method with empty parameters
  if(config === undefined) return;	
  //configuration parameters
  this.target = config.target ||  "pos";
  this.loops = config.loops || 0;
  this.startVal = config.start || 0.0;
  this.endVal = config.end || 1.0;
  this.duration = config.duration || 1000;
  this.cb = config.cb;

	//internal status variables
  this.elapsedtime = 0;
  this.status = "idle";
  this.step = 0.0;
};

//a few public static constants
MuEngine.Animator.TARGET_POS ="pos";
MuEngine.Animator.TARGET_ROTY  = "rotY";

MuEngine.Animator.TYPE_LINEAR = "linear";

MuEngine.Animator.STATUS_IDLE = "idle";
MuEngine.Animator.STATUS_RUNNING = "running";
MuEngine.Animator.STATUS_FINISHED = "finished";


MuEngine.Animator.prototype.isFinished = function(){
	return this.status === MuEngine.Animator.STATUS_FINISHED;
};


MuEngine.Animator.prototype.update = function(dt, node){
	if(this.status === MuEngine.Animator.STATUS_IDLE){
			this.status = MuEngine.Animator.STATUS_RUNNING;
			this.elapsedtime= 0; 
			this.step = 0;
			this.apply(node);
	}
	else if(this.status === MuEngine.Animator.STATUS_RUNNING){
			this.elapsedtime  += dt;
			if(this.elapsedtime > this.duration){
                if(this.loops > 0){
                    this.loops--;
                    this.step = 1.0;
                    this.status = MuEngine.Animator.STATUS_FINISHED;
    				console.log("status: " + this.status + " step:"+ this.step +  " loops "+ this.loops);
	                if(this.cb !== undefined) this.cb();
                    //return;
                }else{
                    //keep looping..
                    this.elapsedtime = this.elapsedtime - this.duration;
                    this.step = this.elapsedtime/this.duration;
                }
            }else{
				this.step = this.elapsedtime/this.duration;
			}
			this.apply(node);		
	}
	else if(this.status === MuEngine.Animator.STATUS_FINISHED){
	}else throw "unknown animator status: " + this.status; 	
};


//---------------- class AnimatorPos extends Animator ----------------


MuEngine.AnimatorPos  = function(config){
	config.target =  MuEngine.Animator.TARGET_POS;
	MuEngine.Animator.call(this, config);	
	this.val = vec3.clone(this.startVal);
};
//chaining prototypes

MuEngine.AnimatorPos.prototype  = new MuEngine.Animator;

MuEngine.AnimatorPos.prototype.apply = function(node){
	vec3.subtract(this.val, this.endVal, this.startVal);
	vec3.scale(this.val, this.val, this.step); 
	node.transform.setPos(this.val[0], this.val[1], this.val[2]);	
};

//---------------- class AnimatorRotY extends Animator ----------------
MuEngine.AnimatorRotY  = function(config){
	config.target =  MuEngine.Animator.TARGET_ROTY;
	MuEngine.Animator.call(this, config);	
	this.val = this.startVal;
};

//chaining prototypes
MuEngine.AnimatorRotY.prototype = new MuEngine.Animator;

MuEngine.AnimatorRotY.prototype.apply = function(node){
		this.val = this.startVal + this.step*(this.endVal - this.startVal);	
		node.transform.setRotY(this.val);
};


//---------------- class AnimatorMoveCell extends Animator -------------

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


MuEngine.Node.prototype.removeChild = function(node){
	for(i=0; i<this.children.length; ++i){
		if(this.children[i] === node){
			this.children.splice(i, 1);
			return;
		}
	}
};


/**
* use the given matrix as parent matrix, compute world transformation using local transform
*/
MuEngine.Node.prototype.updateWorldMat = function(worldmat){
	this.transform.multiply(worldmat, this.wm);
	vec3.transformMat4(this.wp, g_pZero, this.wm); 
};


/**
 * recursive function 
 */ 
MuEngine.Node.prototype.render = function(mat){
	this.updateWorldMat(mat);
	if(this.primitive != null){
			this.primitive.render(this, g_camera);
	};
	for(var i=0; i<this.children.length; ++i){
		this.children[i].render(this.wm);
	};	  
};


/**
* animators are temporal objects. they are added on demand, and once they
* reach the finished status, they are removed from the collection. 
*/
MuEngine.Node.prototype.addAnimator= function (animator){
	if(this.animators == undefined){
		this.animators = [];
	}		
	this.animators.push(animator);
};


MuEngine.Node.prototype.update = function(dt){
	if(this.animators != undefined){
		for(var i=0; i<this.animators.length; ){
			var animator = this.animators[i];
			animator.update(dt, this);
			if(animator.isFinished()){
				this.animators.splice(i, 1);
			}else{
				++i;
			}
		}
	}
	if(this.primitive != null){
		this.primitive.update(dt);
	}
	for(var i=0; i<this.children.length; ++i){
		this.children[i].update(dt);
	};	
};


/**
 * global transform a point. if you want to local transform the point,
 * use node.transform.multP instead.
 * @param p
 * @param out
 */
MuEngine.Node.prototype.multP = function(p, out){
    //local transform..
    //this.transform.multP(p, out);
    //local to global..
    vec3.transformMat4(out, p, this.wm);
};
				
	//-------- CAMERA CLASS -------------
	/**
	 * Camera constructor. 
	 * a camera is always attached to a cell. 
	 * it is a polar camera, whose focus is its parent cell.
	 * it performs basic perspective transformation. 
	 */
	MuEngine.Camera = function(){
        //this must be always a normalized vector
		this.eye = vec3.fromValues(0, 0, -1);
		//this.fixed_center = true;
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
    MuEngine.Camera.prototype.g_p2 = vec3.create();
    MuEngine.Camera.prototype.g_p3 = vec3.create();



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
	};

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
	 * move the center and the eye of the camera using a delta vector
	 */
	MuEngine.Camera.prototype.move = function(delta){
		vec3.add(this.center, this.center, delta);
        vec3.add(this.eye, this.eye, delta);
		this.dirty = true;
	};

    /**
     * receives a global point and update the eye vector so it points toward there.
     * eye must always be kept normalized
     * @param pos point in global coords
     */
  MuEngine.Camera.prototype.setEye = function(pos){
      vec3.subtract(this.eye, pos, this.center);
      vec3.normalize(this.eye, this.eye);
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

    MuEngine.Camera.prototype.log = function(){
        console.log("Camera: center:", this.center, " eye:", this.eye);
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
	* @param ori: point in 3d world coords of the anchor position

	*/
	MuEngine.Camera.prototype.renderSprite = function(node, sprite){
        var img = sprite.imghandler.img;
        if(!sprite._3d){
		this.project(node.wp, this.g_p0);
		//w, h are in world coords.. transform to pixels:
		var wpx = (sprite.width * g_canvas.width) / (this.right - this.left);  
		var wpy = (sprite.height * g_canvas.height) / (this.top - this.bottom);  
		//how about the anchor?
		var offy = ((1 & sprite.anchor) > 0) ? 0 : (((2 & sprite.anchor) > 0)? -wpy :-(wpy>>1)); 
		var offx = ((4 & sprite.anchor) > 0) ? 0 : (((8 & sprite.anchor) > 0)? -wpx :-(wpx>>1)); 
		if(sprite.tilew != null && sprite.tileh != null)
			g_ctx.drawImage(img, sprite.tilex*sprite.tilew, sprite.tiley*sprite.tileh, sprite.tilew, sprite.tileh, this.g_p0[0]+offx, this.g_p0[1]+offy, wpx, wpy);
		else
			g_ctx.drawImage(img, this.g_p0[0]+offx, this.g_p0[1]+offy, wpx, wpy);
	  }else{
            //this is a 3d sprite!

        var w2 =sprite.width*0.5;
        var h2 = sprite.height*0.5;

        //compute the projected corners and paint as lines
        //notice that for 2dsprites the anchor computation is done in screen space (pixels) but for 3d it must be done in world space
        var offy = ((1 & sprite.anchor) > 0) ? 0 : (((2 & sprite.anchor) > 0)? 0:h2);
        var offx = ((4 & sprite.anchor) > 0) ? 0 : (((8 & sprite.anchor) > 0)? -sprite.width:-w2);

        //lower left corner:
        vec3.set(this.g_p0, offx, offy, 0);
        node.multP(this.g_p0, this.g_p0);
        this.project(this.g_p0, this.g_p0);
        //lower right corner:
        vec3.set(this.g_p1, sprite.width+offx, offy, 0);
        node.multP(this.g_p1, this.g_p1);
        this.project(this.g_p1, this.g_p1);
       //upper left corner:
       vec3.set(this.g_p2, sprite.width+offx, sprite.height+offy, 0);
       node.multP(this.g_p2, this.g_p2);
        this.project(this.g_p2, this.g_p2);
       //upper right corner:
       vec3.set(this.g_p3, offx, sprite.height+offy, 0);
       node.multP(this.g_p3, this.g_p3);
        this.project(this.g_p3, this.g_p3);


        this.drawTriangle(img,
            this.g_p0[0],this.g_p0[1], this.g_p1[0],this.g_p1[1], this.g_p2[0],this.g_p2[1],
            0, img.height, img.width, img.height, img.width, 0);

        this.drawTriangle(img,
            this.g_p0[0],this.g_p0[1], this.g_p2[0],this.g_p2[1], this.g_p3[0],this.g_p3[1],
            0, img.height, img.width, 0, 0, 0);

            /*
            //for debugging
           g_ctx.beginPath();
           g_ctx.moveTo(this.g_p0[0],this.g_p0[1]);
           g_ctx.lineTo(this.g_p1[0],this.g_p1[1]);
           g_ctx.lineTo(this.g_p2[0],this.g_p2[1]);
           g_ctx.lineTo(this.g_p3[0],this.g_p3[1]);
           g_ctx.lineTo(this.g_p0[0],this.g_p0[1]);
           g_ctx.closePath();
           g_ctx.strokeStyle =  "#00FFFF";
           g_ctx.stroke();
            */
       }
    };


    /*
     this code is adapted from:
     http://tulrich.com/geekstuff/canvas/jsgl.js
     https://github.com/cesarpachon/pre3d/blob/master/pre3d.js
     refered by dean McNamee
     https://github.com/deanm
    */
    MuEngine.Camera.prototype.drawTriangle = function(im, x0, y0, x1, y1, x2, y2,
     sx0, sy0, sx1, sy1, sx2, sy2) {
        g_ctx.save();

     // Clip the output to the on-screen triangle boundaries.
        g_ctx.beginPath();
        g_ctx.moveTo(x0, y0);
        g_ctx.lineTo(x1, y1);
        g_ctx.lineTo(x2, y2);
        g_ctx.closePath();
     //ctx.stroke();//xxxxxxx for wireframe
        g_ctx.clip();

     /*
     ctx.transform(m11, m12, m21, m22, dx, dy) sets the context transform matrix.

     The context matrix is:

     [ m11 m21 dx ]
     [ m12 m22 dy ]
     [  0   0   1 ]

     Coords are column vectors with a 1 in the z coord, so the transform is:
     x_out = m11 * x + m21 * y + dx;
     y_out = m12 * x + m22 * y + dy;

     From Maxima, these are the transform values that map the source
     coords to the dest coords:

     sy0 (x2 - x1) - sy1 x2 + sy2 x1 + (sy1 - sy2) x0
     [m11 = - -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sy1 y2 + sy0 (y1 - y2) - sy2 y1 + (sy2 - sy1) y0
     m12 = -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx0 (x2 - x1) - sx1 x2 + sx2 x1 + (sx1 - sx2) x0
     m21 = -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx1 y2 + sx0 (y1 - y2) - sx2 y1 + (sx2 - sx1) y0
     m22 = - -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx0 (sy2 x1 - sy1 x2) + sy0 (sx1 x2 - sx2 x1) + (sx2 sy1 - sx1 sy2) x0
     dx = ----------------------------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx0 (sy2 y1 - sy1 y2) + sy0 (sx1 y2 - sx2 y1) + (sx2 sy1 - sx1 sy2) y0
     dy = ----------------------------------------------------------------------]
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
     */

    // TODO: eliminate common subexpressions.
    var denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
    if (denom == 0) {
        return;
    }
    var m11 = - (sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
    var m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
    var m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
    var m22 = - (sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
    var dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
    var dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;

        g_ctx.transform(m11, m12, m21, m22, dx, dy);

    // Draw the whole image.  Transform and clip will map it onto the
    // correct output triangle.
    //
    // TODO: figure out if drawImage goes faster if we specify the rectangle that
    // bounds the source coords.
        g_ctx.drawImage(im, 0, 0);
        g_ctx.restore();
    };
//------- CELL CLASS EXTENDS NODE ------------

/**
 * this is a private class, not expected to be instantiated for the user
 */

var Cell = function(i, j, cellsize){
	MuEngine.Node.call(this);
	this.row = i;
	this.col = j;
	//a vector to store eye coordinates
	this.eyePos = vec3.create();
	this.transform.setPos(i*cellsize, 0, j*cellsize);
	this.transform.update();
  this.walkable = true;
};

//chaining prototypes
Cell.prototype = new MuEngine.Node();


Cell.prototype.isWalkable = function(){
    return this.walkable; // || is full.. || has other dynamic obstacles
}
	//------- GRID CLASS ------------------

	/**
	 * helper sort function for the render queue of the grid
	 */
	var _compareCellsByEyePos = function(cellA, cellB){
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
		//this.queue = new MuEngine.PriorityQueue(_compareCellsByEyePos);
		this.sorted_cells = new Array(width * height);
		for(var i=0; i<this.width; ++i){
				for(var j=0; j< this.height; ++j){
					var cell = new Cell(i, j, cellsize);
					var p = (i*this.height)+j;
					this.cells[p] = cell;
					this.sorted_cells[p] = cell;
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

/**
 * 
 * @param {Object} node
 * @param {Object} cam
 */
	MuEngine.Grid.prototype.render = function(node, cam){
		this._renderGrid(node, cam);
		for(var i=0; i<this.cells.length; ++i){
			var cell = this.cells[i];
			cam.world2eye(cell.wp, cell.eyePos);
			//here its a good point to perform occlusion culling..
			//this.queue.push(cell);
		}	
		this.sorted_cells.sort(_compareCellsByEyePos);
		//hopefully, here we have a list of visible cells sorted by depth..
		//var cell = this.queue.pop();
		//while(cell!=null){
	    for(var i=0; i<this.sorted_cells.length; ++i){
			var cell = this.sorted_cells[i];
			cell.render(node.wm);
			//cell = this.queue.pop();
		} 
		
	};

/**
 * 
 * @param {Object} node
 * @param {Object} cam
 */
	MuEngine.Grid.prototype._renderGrid = function(node, cam){
		var w = this.width*this.cellsize;
		//draw rows
		var aux = 0;
		for(var i=0; i<=this.height; ++i){
			vec3.set(this.g_p0, aux, 0, 0);
			vec3.set(this.g_p1, aux, 0, w);
			node.multP(this.g_p0, this.g_p0);
			node.multP(this.g_p1, this.g_p1);
			cam.renderLine(this.g_p0, this.g_p1, this.color);
			aux += this.cellsize;
		};
		var h = this.height*this.cellsize;
		aux = 0;
		for(var j=0; j<=this.width; ++j){
			vec3.set(this.g_p0, 0, 0, aux);
			vec3.set(this.g_p1, h, 0, aux);
			node.multP(this.g_p0, this.g_p0);
			node.multP(this.g_p1, this.g_p1);
			cam.renderLine(this.g_p0, this.g_p1, this.color);
			aux += this.cellsize;
		};
	};


	MuEngine.Grid.prototype.update = function(dt){
		for(var i=0; i<this.cells.length; i++){
			this.cells[i].update(dt);
		}	
	};
//------- AVATAR CLASS EXTENDS NODE ------------

/**
 * an avatar is a special node that is attached to a grid, and provided special animators and callbacks
 * to move through the grid. 
 * movement is cell-based: it will move from a cell into another. 
 */

/**
 * avatar constructor
 * config object:
 * 	grid: grid this avatar is attached to
 *  row: inicial row
 *  col: inicial col
 *  speed: time required to move from one cell to another (seconds)
 */
MuEngine.Avatar = function(config){
	MuEngine.Node.call(this);
	this.grid = config.grid;
	this.speed = 0.1 | config.speed; 
	if(this.grid == undefined){
		throw "Avatar.constructor: grid must be defined"; 
	}
	//the current cell
	this.cell = this.grid.getCell(config.row, config.col);
  this.nextCell = null; //when moving..
  this.cell.addChild(this);
	this.dir = 0; //zero if not moving. DIR_XX flag if moving.
};

//chaining prototypes
MuEngine.Avatar.prototype = new MuEngine.Node();

MuEngine.Avatar.DIR_UP = 1;
MuEngine.Avatar.DIR_DOWN = 2;
MuEngine.Avatar.DIR_LEFT = 4;
MuEngine.Avatar.DIR_RIGHT = 8;

/**
 * create an animator that will move the current node from the current cell
 * to the cell pointed by dir. 
 * if the target dir does not exist (out of grid boundary) or is now walkable
 * (either for static or dynamic obstacles) the method will return false.
 * in the other hand, if the movement is allowed, it will return true. 
 * @param: dir: binary flag, "OR" combination of Avatar.DIR_xxx constants. 
 */
MuEngine.Avatar.prototype.move = function(_dir){
  //return if already moving
  if(this.dir != 0) return;
    var row = this.cell.row + ((_dir & MuEngine.Avatar.DIR_UP)?1:((_dir & MuEngine.Avatar.DIR_DOWN)?-1:0));
    var col = this.cell.col + ((_dir & MuEngine.Avatar.DIR_RIGHT)?1:((_dir & MuEngine.Avatar.DIR_LEFT)?-1:0));
    this.nextCell = this.grid.getCell(row, col);
    if(this.nextCell == null){
        //out of boundaries!
        return false;
    }
    if(!this.nextCell.isWalkable()){
        this.nextCell = null;
        return false;
    }
    console.log("moving dir ", _dir, " from ", this.cell.row , ",", this.cell.col, " to ", row, ",", col);
    this.dir = _dir;
    _this = this;
  var animator = new MuEngine.AnimatorPos({
      start: this.cell.wp,
      end: this.nextCell.wp,
			cb: function(){
				_this.cell.removeChild(_this);
				_this.cell = _this.nextCell;
				_this.cell.addChild(_this);
				_this.nextCell = null;	
				_this.dir = 0;
				_this.transform.setPos(0, 0, 0);
				//_this.transform.update();
			}
    });
    this.addAnimator(animator);
}
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

	/*do nothing*/
	MuEngine.Line.prototype.update = function(dt){
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
		this.tilex = 0;
		this.tiley = 0;
		this.tilew = null;
		this.tileh = null;
        this._3d = false; //flag that force the sprite to be rendered in 3d mode
	};

	/*
	* sprite static attributes
	*/
	
	MuEngine.Sprite.prototype.ANCHOR_HCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_VCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_CENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_TOP = 1; 
	MuEngine.Sprite.prototype.ANCHOR_BOTTOM = 2;
	MuEngine.Sprite.prototype.ANCHOR_LEFT = 4;
	MuEngine.Sprite.prototype.ANCHOR_RIGHT = 8;

	MuEngine.Sprite.prototype.render = function(node, cam){
		cam.renderSprite(node, this);

	};

	MuEngine.Sprite.prototype.play = function(anim, loop){
		if(this["anims"]  == undefined){
			throw "calling play in sprite without animation data"; 
		}
		if(this["animctrl"] == undefined){
			this["animctrl"] = {};
		}	 
		this.animctrl.curranim = this.anims[anim];
		this.animctrl.elapsed = 0;
	  this.animctrl.loop = loop;		
		this.tiley = this.animctrl.curranim.row;
		this.tilex = this.animctrl.curranim.tiles[0];
	};
	
	/**
	* add a new animation to this sprite 
	* name: name of the animation
	* row: row that contains the tiles
	* tiles: array of column indexes  
	*/
	MuEngine.Sprite.prototype.addAnimation = function(name, row, tiles, duration ){
		if(this['anims']  == undefined){
			this.anims = {};
		}	
		this.anims[name]= {'row': row, 'tiles': tiles, 'duration': duration};
	};	



	MuEngine.Sprite.prototype.update = function(dt){
		if(this.animctrl == undefined) return;
		anim = this.animctrl.curranim;
		if(anim == undefined || anim == null) return;		
		this.animctrl.elapsed += dt;
		if(this.animctrl.elapsed >= anim.duration){
			if(!this.animctrl.loop){
				this.tilex = anim.tiles[anim.tiles.length-1];
				this.animctrl.curranim = null; 
				return;
			}
			else{
				this.animctrl.elapsed = this.animctrl.elapsed % anim.duration; 
			}
		}
		this.tilex = anim.tiles[Math.floor((anim.tiles.length-1)*(this.animctrl.elapsed/anim.duration))];
		console.log("anim x "+ this.tilex + " y "+ this.tiley + " elapsed "+ this.animctrl.elapsed + " duration "+ anim.duration);
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

/**
* utility method 
*/
MuEngine.deg2rad = function(deg){
  return  deg * (Math.PI / 180);
};


MuEngine.rad2deg= function(rad){
  return  rad * 180 / Math.PI;
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
	
}

return MuEngine;
}());
