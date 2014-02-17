	
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
		console.log("camera: creating view_mat from eye: ", this.eye, ", center:  ", this.center, ", up: ", this.up);
		mat4.lookAt(this.view_mat, this.eye, this.center, this.up); 
		console.log("camera: view_mat: ", this.view_mat);
		this.proj_mat = mat4.create();
		this.fovy = Math.PI / 180.0;
	  this.aspect = this.canvas.width / this.canvas.height;
		this.near = 0.0; 
		this.far = 10000.0;
		console.log("camera: proj from: fovy: ", this.fovy, ", aspect: ", this.aspect, ", near: ", this.near, ", far:", this.far);
		mat4.perspective(this.proj_mat, this.fovy, this.aspect, this.near, this.far);
		//store the view and proj matrix product to avoid constant multiplication of them.
		console.log("camera: proj_mat: ", this.proj_mat);
		this.view_proj_mat = mat4.create();
		mat4.multiply(this.view_proj_mat, this.view_mat, this.proj_mat);		
		console.log("camera: view_proj_mat: ", this.view_proj_mat);
		console.log("camera done!");
	};

  /**
	 * given a point in world space, multiply by view_mat and proj_mat and store 
	 * result in pointout
	 */ 
	MuEngine.Camera.prototype.project = function(point, pointout){
		//transform from world space to normalized device coords..
		vec3.transformMat4(pointout, point, this.view_proj_mat);  
		//transform from normalized device coords to viewport coords..
		//@todo: the zeroes at the end are the viewport origin coordinates
		pointout[0] = (point[0]+1)*(this.canvas.width >> 1) + 0;
		pointout[1] = (point[1]+1)*(this.canvas.height >> 1) + 0;
		//invert Y!
		pointout[1] = this.canvas.height - pointout[1];
	};


