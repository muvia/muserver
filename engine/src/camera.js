				
	//-------- CAMERA CLASS -------------
	/**
	 * Camera constructor. 
	 * a camera is always attached to a cell. 
	 * it is a polar camera, whose focus is its parent cell.
	 * it performs basic perspective transformation. 
	 */
	MuEngine.Camera = function(){
		this.eye = vec3.create();
		this.fixed_eye = true; 
		vec3.set(this.eye, 0, 0, -10);
		this.center = vec3.create();
		vec3.set(this.center, 0, 0, 0);
		this.up = vec3.create();
		vec3.set(this.up, 0, 1, 0);
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

	/**
	 * given a point in world space, multiply by view_mat and proj_mat and store 
	 * result in pointout
	 */ 
	MuEngine.Camera.prototype.project = function(point, pointout){
		if(this.dirty) this.update();
		
		//transform world to camera coords.. 

	 var aux = vec3.create();
	 var aux2 = vec3.create();

		/* this is a workable, unoptimized version
		* it uses TWO separate matrix multiplication, and intermediate auxiliar points
		vec3.transformMat4(aux, point, this.view_mat);		
		console.log("Camera.project: view: ",point,"->",aux);
		vec3.transformMat4(aux2, aux, this.proj_mat);		
		console.log("Camera.project: proj: ",aux,"->",aux2);
		*/

		//transform from world space to normalized device coords..
		vec3.transformMat4(pointout, point, this.view_proj_mat); 

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
	* @param: ori: center of the sprite, world coordinates
	* @param: imghandler: a image handler 
	*/
	MuEngine.Camera.prototype.renderSprite = function(ori, imghandler){
		this.project(ori, this.g_p0);
		g_ctx.drawImage(imghandler.img, this.g_p0[0], this.g_p0[1]);
	}
