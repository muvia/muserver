	
//-------- CAMERA CLASS -------------
	
	/**
	 * Camera constructor. 
	 * a camera is always attached to a cell. 
	 * it is a polar camera, whose focus is its parent cell.
	 * it performs basic perspective transformation. 
	 */
	MuEngine.Camera = function(canvas){
		this.canvas = canvas;
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
		
	};
	
