    
	//------- TRANSFORM CLASS --------
	
	MuEngine.Transform = function(){
		this.pos = vec3.create();
		this.rot = quat.create();
		this.mat = mat4.create();
		this.update();
	};

	/**
	 * call whenever pos or rot changes to update matrix
	 */
	MuEngine.Transform.prototype.update = function(){
		mat4.fromRotationTranslation(this.mat, this.rot, this.pos);
	};

	/**
	 * multiply given matrix by this.mat, store result in out
	 */
	MuEngine.Transform.prototype.multiply = function(mat, out){
		
	};

 /**
	* multiply a given point for this.mat, store the result in out
	*/
	MuEngine.Transform.prototype.multP = function(p, out){
		vec3.transformMat4(out, p, this.mat); 
	};
