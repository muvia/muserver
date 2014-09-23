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
	MuEngine.pZero = vec3.fromValues(0, 0, 0);

  //a reusable, read-only (I hope) unit vector.
	MuEngine.pOne = vec3.fromValues(1, 1, 1);

  /*
   * static helper points to avoid temporal vector creations
   */
  MuEngine.p0 = vec3.create();
  MuEngine.p1 = vec3.create();
  MuEngine.p2 = vec3.create();
  MuEngine.p3 = vec3.create();

  /**
  * a few error code constants to better describe error conditions when invoking methods
  */
  MuEngine.err ={
    OK:0,
    INVALID_STATUS:1,
    WORLD_EDGE:2,
    CELL_UNWALKABLE: 3
  };

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
        if(this.elapsedtime >= this.duration){
            if(this.loops > 0){
                this.loops--;
                this.step = 1.0;
                this.status = MuEngine.Animator.STATUS_FINISHED;
                this.apply(node);
                if(this.cb) this.cb();
                return;
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
    //in parent constructor, startVal and endVal are passed as references.
    this.startVal = vec3.clone(this.startVal);
    this.endVal = vec3.clone(this.endVal);
    //this is the "current value" that we are going to keep changing
	this.val = vec3.clone(this.startVal);
};
//chaining prototypes

MuEngine.AnimatorPos.prototype  = new MuEngine.Animator;

MuEngine.AnimatorPos.prototype.apply = function(node){
	vec3.subtract(this.val, this.endVal, this.startVal);
	vec3.scale(this.val, this.val, this.step);
    vec3.add(this.val, this.val, this.startVal);
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
  //eye position
  this.ep = vec3.create();
};

MuEngine.Node.prototype.addChild = function(node){
	this.children.push(node);
};


MuEngine.Node.prototype.removeChild = function(node){
	for(var i=0; i<this.children.length; ++i){
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
	vec3.transformMat4(this.wp, MuEngine.pZero, this.wm);
  g_camera.project(this.wp, this.ep);
};


/**
 * recursive function
 */
MuEngine.Node.prototype.render = function(mat){
	this.updateWorldMat(mat);
	if(this.primitive){
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
	if(!this.animators){
		this.animators = [];
	}
	this.animators.push(animator);
};


MuEngine.Node.prototype.update = function(dt){
	if(this.animators){
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
	if(this.primitive){
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
		/*this.fovy = Math.PI / 180.0;
		this.aspect = g_canvas.width / g_canvas.height;
		this.near = 0.0;
		this.far = 10000.0;
    */
		//orthographic
		this.setOrtho(0, 10, -5, 5, -5, 5);
		//store the view and proj matrix product to avoid constant multiplication of them.
		this.view_proj_mat = mat4.create();
	};

  /**
  *
  */
  MuEngine.Camera.prototype.setOrtho = function(near, far, left, right, bottom, top){
    this.near = near;
		this.far = far;
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
    this.dirty = true;
  };

  /**
  *
  */
  MuEngine.Camera.prototype.update = function(){

    if(!this.dirty) return;

    //pay attention: in glMatrix, eye is the center of the camera, not the "lookAt" vector..
    vec3.add(MuEngine.p0, this.center, this.eye);
	mat4.lookAt(this.view_mat, this.center, MuEngine.p0, this.up);
	//mat4.perspective(this.proj_mat, this.fovy, this.aspect, this.near, this.far);
	mat4.ortho(this.proj_mat, this.left, this.right, this.bottom, this.top, this.near, this.far);
	mat4.multiply(this.view_proj_mat, this.proj_mat, this.view_mat);
	this.dirty = false;
	};


	/*
	* transforms a point from world coordinates to eye coordinates
	*/
	MuEngine.Camera.prototype.world2eye = function(point, pointout){
		this.update();
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
     * @param pos a global position
	 */
	MuEngine.Camera.prototype.setCenter = function(pos){
		vec3.copy(this.center, pos);
		this.dirty = true;
	};

	/**
	 * move the center and the eye of the camera using a delta vector
	 */
	MuEngine.Camera.prototype.move = function(delta){
		vec3.add(this.center, this.center, delta);
    //no sense! now eye is a vector, not a point! vec3.add(this.eye, this.eye, delta);
		this.dirty = true;
	};

    /**
     * receives a global point and update the eye vector so it points toward there.
     * eye must always be kept normalized
     * @param pos point in global coords
     */
    MuEngine.Camera.prototype.lookAt = function(pos){
      vec3.subtract(this.eye, pos, this.center);
      vec3.normalize(this.eye, this.eye);
      this.dirty = true;
	};


    /**
     * set the eye direction vector
     * @param dir a normalized vector
     */
    MuEngine.Camera.prototype.setEyeDir = function(dir){
      vec3.copy(this.eye, dir);
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
		this.project(ori,MuEngine.p0);
		this.project(end,MuEngine.p1);
		g_ctx.beginPath();
		g_ctx.moveTo(MuEngine.p0[0],MuEngine.p0[1]);
		g_ctx.lineTo(MuEngine.p1[0],MuEngine.p1[1]);
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
     //use node.ep instead of this: this.project(node.wp, MuEngine.p0);
      //w, h are in world coords.. transform to pixels:
      var wpx = (sprite.width * g_canvas.width) / (this.right - this.left);
      var wpy = (sprite.height * g_canvas.height) / (this.top - this.bottom);
      //how about the anchor?
      var offy = ((1 & sprite.anchor) > 0) ? 0 : (((2 & sprite.anchor) > 0)? -wpy :-(wpy>>1));
      var offx = ((4 & sprite.anchor) > 0) ? 0 : (((8 & sprite.anchor) > 0)? -wpx :-(wpx>>1));
      if(sprite.tilew != null && sprite.tileh != null)
        g_ctx.drawImage(img, sprite.tilex*sprite.tilew, sprite.tiley*sprite.tileh, sprite.tilew, sprite.tileh, node.ep[0]+offx, node.ep[1]+offy, wpx, wpy);
		  else
			  g_ctx.drawImage(img, node.ep[0]+offx, node.ep[1]+offy, wpx, wpy);
	  }
    else{
        //this is a 3d sprite!

        var w2 =sprite.width*0.5;
        var h2 = sprite.height*0.5;

        //compute the projected corners and paint as lines
        //notice that for 2dsprites the anchor computation is done in screen space (pixels) but for 3d it must be done in world space
        var offy = ((1 & sprite.anchor) > 0) ? 0 : (((2 & sprite.anchor) > 0)? 0:h2);
        var offx = ((4 & sprite.anchor) > 0) ? 0 : (((8 & sprite.anchor) > 0)? -sprite.width:-w2);

        //lower left corner:
        vec3.set(MuEngine.p0, offx, offy, 0);
        node.multP(MuEngine.p0, MuEngine.p0);
        this.project(MuEngine.p0, MuEngine.p0);
        //lower right corner:
        vec3.set(MuEngine.p1, sprite.width+offx, offy, 0);
        node.multP(MuEngine.p1, MuEngine.p1);
        this.project(MuEngine.p1, MuEngine.p1);
       //upper left corner:
       vec3.set(MuEngine.p2, sprite.width+offx, sprite.height+offy, 0);
       node.multP(MuEngine.p2, MuEngine.p2);
        this.project(MuEngine.p2, MuEngine.p2);
       //upper right corner:
       vec3.set(MuEngine.p3, offx, sprite.height+offy, 0);
       node.multP(MuEngine.p3, MuEngine.p3);
        this.project(MuEngine.p3, MuEngine.p3);


        this.drawTriangle(img,
            MuEngine.p0[0],MuEngine.p0[1], MuEngine.p1[0],MuEngine.p1[1], MuEngine.p2[0],MuEngine.p2[1],
            0, img.height, img.width, img.height, img.width, 0);

        this.drawTriangle(img,
            MuEngine.p0[0],MuEngine.p0[1], MuEngine.p2[0],MuEngine.p2[1], MuEngine.p3[0],MuEngine.p3[1],
            0, img.height, img.width, 0, 0, 0);

            /*
            //for debugging
           g_ctx.beginPath();
           g_ctx.moveTo(MuEngine.p0[0],MuEngine.p0[1]);
           g_ctx.lineTo(MuEngine.p1[0],MuEngine.p1[1]);
           g_ctx.lineTo(MuEngine.p2[0],MuEngine.p2[1]);
           g_ctx.lineTo(MuEngine.p3[0],MuEngine.p3[1]);
           g_ctx.lineTo(MuEngine.p0[0],MuEngine.p0[1]);
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
	 * helper sort function for the internal render in the cell
	 */
	var _compareNodesByEyePos = function(nodeA, nodeB){
    return nodeA.ep[2] < nodeB.ep[2]? 1 : nodeA.ep[2] > nodeB.ep[2]? -1 : 0;
	};

/*
 * this is a private class, not expected to be instantiated for the user
 */

MuEngine.Cell = function(i, j, cellsize){
	MuEngine.Node.call(this);
	this.row = i;
	this.col = j;
	//a vector to store eye coordinates. it is using for render sorting
	this.eyePos = vec3.create();
    MuEngine.Cell.cellsize = cellsize;
	this.transform.setPos(i*MuEngine.Cell.cellsize, 0, j*MuEngine.Cell.cellsize);
	this.transform.update();
  /**
   * binary field. if zero, means the cell is walkable (no blocking flags)
   * we expect this field to be used for types of terrain.. water, mud..
   * @type {number}
   */
  this.walkable = 0;
  /**
   * binary field. first four bits means a wall in a dir.
   * north: 0x1
   * south: 0x2
   * east: 0x4
   * west:0x8
   * @type {number}
   */
  this.walls = 0;
};

//chaining prototypes
MuEngine.Cell.prototype = new MuEngine.Node();

/*
* we store the cellsize at the prototype level to share it between cell instances.
* we dont expect to have grids with differents cellsizes at the same time!
 */
MuEngine.Cell.prototype.cellsize = 0;


MuEngine.Cell.prototype.setWalkable = function(flag){
  this.walkable = flag?0:1;
}

/**
 * may I enter to this cell (no matters the original direction?)
 * @returns {boolean}
 */
MuEngine.Cell.prototype.isWalkable = function(){
    if(this.walkable === 0){
      //no blocking flags!
      return true;
    }
    else{
     return false;
    }
}

/**
 * returns true if an avatar in the current cell can move out of the cell in the current direction,
 * this method only test for the existence of inner walls in the cell. it does not test for walls in the
 * next cell, nor if there is a next cell at all.
 * use it as a quick filter to reject invalid movements in a cheap way before testing for neighbors existence.
 * @param dir {string} direction "north", "south"..
 */
MuEngine.Cell.prototype.hasWall = function(dir){
  if(dir === "north"){
    return (this.walls & 0x1) > 0;
  }else if(dir === "south"){
    return (this.walls & 0x2) > 0;
  }else if(dir === "east"){
    return (this.walls & 0x4) > 0;
  }else if(dir === "west"){
    return (this.walls & 0x8) > 0;
  }
}

/**
 * set a wall in the given dir.
 * @todo: test all this stuff!
 * @param dir
 */
MuEngine.Cell.prototype.setWall = function(dir){
  if(dir === "north"){
    this.walls = this.walls | 0x1;
  }else if(dir === "south"){
    this.walls = this.walls | 0x2;
  }else if(dir === "east"){
    this.walls = this.walls | 0x4;
  }else if(dir === "west"){
    this.walls = this.walls | 0x8;
  }
}

/**
 * returns a new vec3 object with a random point contained within the cell limits.
 * @param absolute {boolean} a flag to indicate if the returned point must be in local or global coords
 * @param padding {float} a percentage (eg: 0.1 == 10%) to limit the area of valid random points by adding padding to
 * each edge. (all four edges will have 10% of padding)
 */
MuEngine.Cell.prototype.getRandomPos = function(absolute, padding){
    var p = vec3.create();
    var border = padding*MuEngine.Cell.cellsize;
    var valid = MuEngine.Cell.cellsize - (border+border);
    p[0] = (absolute?this.wp[0]:0) + border + Math.random()*valid;
    p[1] = this.wp[1];
    p[2] = (absolute?this.wp[2]:0) + border + Math.random()*valid;
    return p;
}


/**
 * @override Node.render.
 * original method assume the node has a primitive before iterating over children (we not).
 * second, it invokes in each children the render method, that updates worldmat and render in each step.
 * here, we separate those steps in two different loops: first update the children matrixes,
 * then, compute eyepos, sort by eyepos and finally render.
 * @todo: if we know that a grid is going to stay static, we dont need to update world mats in each step!
 * @todo: also, if we know some sprites are static, we dont need to update them too.
 */
MuEngine.Cell.prototype.render = function(mat){
	this.updateWorldMat(mat);
	for(var i=0; i<this.children.length; ++i){
		this.children[i].updateWorldMat(this.wm);
  };
  this.children.sort(_compareNodesByEyePos);
 for(var i=0; i<this.children.length; ++i){
		this.children[i].render(this.wm);
	};
};
	//------- GRID CLASS ------------------

	/**
	 * helper sort function for the render queue of the grid
	 */
	var _compareCellsByEyePos = function(cellA, cellB){
    return cellA.eyePos[2] < cellB.eyePos[2]? 1 : cellA.eyePos[2] > cellB.eyePos[2]? -1 : 0;
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
					var cell = new MuEngine.Cell(i, j, cellsize);
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
 * we assume that the associated primitive support the play anim interface.
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
	this.speed = config.speed || 0.1;
	if(!this.grid){
		throw "Avatar.constructor: grid must be defined";
	}
	//the current cell
	this.cell = this.grid.getCell(config.row, config.col);
  this.nextCell = null; //when moving..
  var offset = this.cell.getRandomPos(false, 0.3);
  this.transform.setPos(offset[0],offset[1],offset[2]);
  //this.transform.update();
  this.cell.addChild(this);
  this.moving = false; //false if not moving. "dir" string if moving.
  //used to store mappings between moving directions and animation names. @see mapWalkAnimation
  this.walkanims = {};
  //array of pairs of animname, frequency used for idle behavior. @see addIdleAnimation
  this.idleanims = [];
};

//chaining prototypes
MuEngine.Avatar.prototype = new MuEngine.Node();


/**
 * create an animator that will move the current node from the current cell
 * to the cell pointed by dir.
 * if the target dir does not exist (out of grid boundary) or is not walkable
 * (either for static or dynamic obstacles) the method will return false.
 * in the other hand, if the movement is allowed, it will return true.
 * about the directions:
 * we asume a default view with x axis points to the left and +z points to the screen.
 * then, north is -Z, south is Z, east is +X, east is -X
 * @param dir {string} one of "north", "south", "west", "east".
 * @param cbDone {function} success callback
 * @return {MuEngine.err} OK if can move, MuEngine.err_code if not.
 */
MuEngine.Avatar.prototype.move = function(_dir, cbDone){
    if(!(_dir === "north" || _dir === "south" || _dir === "east" || _dir === "west")){
        throw "invalid_direction";
    }

  //return if already moving
  if(this.moving) return MuEngine.err.INVALID_STATUS;

  //return if there is a wall that prevent movement in the desired dir
  if(this.cell.hasWall(_dir)){
    return MuEngine.err.CELL_UNWALKABLE;
  }

    var col = this.cell.col + ((_dir === "south")?1:((_dir === "north")?-1:0));
    var row = this.cell.row + ((_dir === "west")?1:((_dir === "east")?-1:0));
    this.nextCell = this.grid.getCell(row, col);
    if(!this.nextCell){
        //out of boundaries!
        return MuEngine.err.WORLD_EDGE;
    }
    if(!this.nextCell.isWalkable()){
        this.nextCell = null;
        return MuEngine.err.CELL_UNWALKABLE;
    }
    this.moving = _dir;
    var self = this;

    /* we must transform the coordinates from the cells to the
     * local space of the avatar. */
    var relend = this.nextCell.getRandomPos(false, 0.2);
    var absend = MuEngine.p0; //vec3.create();
    vec3.add(absend, this.nextCell.wp, relend);
    //relend is relative to nextCell.wp, relend2 is relative to current pos of avatar.
    var relend2 = MuEngine.p1; //vec3.create();
    vec3.subtract(relend2, absend, this.wp);
    //duration must be computed from speed!
    var duration = vec3.len(relend2) / (this.speed/1000);

    var relend3 = MuEngine.p2;//vec3.create();
    vec3.add(relend3, this.transform.pos, relend2);


     var animator = new MuEngine.AnimatorPos({
      start: this.transform.pos, // MuEngine.pZero, //
      end: relend3,
      duration: duration,
      loops: 1,
      cb: function(){
        self.cell.removeChild(self);
        self.cell = self.nextCell;
        self.cell.addChild(self);
        self.transform.setPos(relend[0], relend[1], relend[2]);
        self.nextCell = null;
        self.moving = false;
        //play the idle animation..
        var idleanim = self.pickIdleAnimation();
        if(idleanim){
          self.primitive.play(idleanim, true);
        }
        if(cbDone) cbDone();
      }
    });
    this.addAnimator(animator);

    //play sprite animation if available
    if(this.walkanims[_dir]){
      this.primitive.play(this.walkanims[_dir], true);
    }
 return MuEngine.err.OK;
}

/**
 * maps the name of an animation to a specific dir, to play the animation along with the move method.
 * @param animname {string} name of the animation in the animatedsprite associated to this avatar as primitive.
 * @param dir {string} one of 'north', 'south', 'west', 'east'
 */
MuEngine.Avatar.prototype.mapWalkAnimation = function(animname, dir){
  if(dir === "north"){
    this.walkanims.north = animname;
  }
  else if(dir === "south"){
    this.walkanims.south = animname;
  }
  else if(dir === "east"){
    this.walkanims.east = animname;
  }
  else if(dir === "west"){
    this.walkanims.west = animname;
  }
}

/**
 * register a new idle animation in the idleAnimation list.
 * each time the avatar is going to play a idle animation, it will pick a random one from the list.
 * you can also specify a frequency to affect the percentage of use of each anim.
 * @param animname {string} name of the animation
 * @param frequency {number} percentage between 0 and 1
 */
MuEngine.Avatar.prototype.addIdleAnimation = function(animname, frequency){
  this.idleanims.push({
    name: animname,
    frequency: frequency
  });
}

/**
 * randomly picks one of the registered idleanimations, taking into account the frecuency of each one.
 * @return {string} name of the idle animation to play. null if no animations had been registered.
 */
MuEngine.Avatar.prototype.pickIdleAnimation = function(){
  if(!this.idleanims.length){
    return null;
  }
  if(this.idleanims.length === 1){
    return this.idleanims[0].name;
  }
  var r = Math.random();
  var acum = 0;
  for(var i=0; i<this.idleanims.length; ++i){
    var anim = this.idleanims[i];
    acum += anim.frequency;
    if(acum >= r){
      return anim.name;
    }
  }
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
	 * renders the primitive (line)
	 * @param: node: The node this primitive belongs to 
	 */
	MuEngine.Line.prototype.render = function(node, cam){

		vec3.transformMat4(MuEngine.p0, this.ori, node.wm);
		vec3.transformMat4(MuEngine.p1, this.end, node.wm);
		cam.renderLine(MuEngine.p0, MuEngine.p1, this.color);
	};

	/*do nothing*/
	MuEngine.Line.prototype.update = function(dt){
	};

	//-------- IMAGE HANDLER CLASS -----------------

	/**
	 * Image Handler constructor
	 * it will load imgurl, and use g_defimg while imgurl is fully loaded.
	 */ 
	var ImageHandler = function(imgurl){
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
		if(!this["anims"]){
			throw "calling play in sprite without animation data";
		}
		if(!this["animctrl"]){
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
		if(!this['anims']){
			this.anims = {};
		}
		this.anims[name]= {'row': row, 'tiles': tiles, 'duration': duration};
	};



	MuEngine.Sprite.prototype.update = function(dt){
		if(!this.animctrl) return;
		var anim = this.animctrl.curranim;
		if(!anim) return;
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
		//console.log("anim x "+ this.tilex + " y "+ this.tiley + " elapsed "+ this.animctrl.elapsed + " duration "+ anim.duration);
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
  var mat = mat4.create();
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
