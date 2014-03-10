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
	 * @param ctx: drawing context
	 * @param wm: modelview matrix (with parent node transformations applied if it is the case)
	 */
	MuEngine.Line.prototype.render = function(mat, cam){

		vec3.transformMat4(this.g_p0, this.ori, mat); 
		vec3.transformMat4(this.g_p1, this.end, mat); 
		cam.renderLine(this.g_p0, this.g_p1, this.color);
	};



