	
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
		pointout[0] = (point[0]+1)*(this.canvas.width >> 1) + 0;
		pointout[1] = (point[1]+1)*(this.canvas.height >> 1) + 0;
		//invert Y!
		pointout[1] = this.canvas.height - pointout[1];
	};

  /**
	 * set the center of the camera at the given point. 
	 * if the eyefixed flag is false, the eye will be updated to keep his relative position to the center.
	 */
	MuEngine.Camera.prototype.setCenter = function(pos){
		if(!this.fixed_eye){
			diff = vec3.create();
			vec3.substract(diff, this.center, this.eye);
			vec3.add(this.eye, pos, diff);			
		}
		this.center = pos;
		this.dirty = true;	
	};
