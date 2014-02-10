    
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
