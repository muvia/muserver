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
	 * @param: node: The node this primitive belongs to 
	 */
	MuEngine.Line.prototype.render = function(node, cam){

		vec3.transformMat4(this.g_p0, this.ori, node.wm); 
		vec3.transformMat4(this.g_p1, this.end, node.wm); 
		cam.renderLine(this.g_p0, this.g_p1, this.color);
	};

	/*do nothing*/
	MuEngine.Line.prototype.update = function(dt){
	};

