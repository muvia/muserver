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

	 /*
		cam.project(this.ori,pt);
		cam.project(this.end,pt2);
		console.log("line.render: ", this.ori[0],",",this.ori[1],":",this.end[0],",",this.end[1]," to-> ",pt[0], ",",pt[1], ":",pt2[0],",",pt2[1]);
		cam.ctx.beginPath();
		cam.ctx.moveTo(pt[0],pt[1]);
		cam.ctx.lineTo(pt2[0],pt2[1]);
		cam.ctx.closePath();
		cam.ctx.strokeStyle = this.color;
		cam.ctx.stroke();
	*/
	};



