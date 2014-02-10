	//------- LINE CLASS -------------------
	

	/**
	 * Line is a primitive. it holds two points of type Vector3. 
	 */
	MuEngine.Line	= function(ori, end){
		this.ori =ori;
	  this.end = end;
 	};

	/*
	 * renders the primitive (line)
	 * @param ctx: drawing context
	 * @param wm: modelview matrix (with parent node transformations applied if it is the case)
	 */
	MuEngine.Line.prototype.render = function(mat, cam){

		cam.project(this.ori, MuEngine.pt);
		cam.project(this.end, MuEngine.pt2);
		//@TODO: make sure the context is safe to reuse between render calls
		cam.ctx = cam.getContext('2d');

	};



