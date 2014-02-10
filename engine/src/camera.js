	
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
		vec3.set(this.eye, 0, 0, -10);
		this.center = vec3.create();
		vec3.set(this.center, 0, 0, 0);
		this.up = vec3.create();
		vec3.set(this.up, 0, 1, 0);
		this.view_mat = mat4.create();
		mat4.lookAt(this.view_mat, this.eye, this.center, this.up); 
		this.proj_mat = mat4.create();
		this.fovy = Math.PI / 180.0;
	    this.aspect = this.canvas.width / this.canvas.height;
		this.near = 0.0; 
		this.far = 10000.0;
		mat4.perspective(this.proj_mat, this.fovy, this.aspect, this.near, this.far);
		//store the view and proj matrix product to avoid constant multiplication of them.
		this.view_proj_mat = mat4.create();
		mat4.multiply(this.view_proj_mat, this.view_mat, this.proj_mat);		
	};

  /**
	 * given a point in world space, multiply by view_mat and proj_mat and store 
	 * result in pointout
	 */ 
	MuEngine.Camera.prototype.project = function(point, pointout){
		vec4.transformMat4(pointout, point, this.view_proj_mat);  
	};


