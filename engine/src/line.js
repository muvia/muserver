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
		cam.project(this.ori,pt);
		cam.project(this.end,pt2);
		console.log("line: ",pt,pt2);
		cam.ctx.beginPath();
		cam.ctx.moveTo(pt.x,pt.y);
		cam.ctx.lineTo(pt2.x,pt2.y);
		cam.ctx.closePath();
		cam.ctx.stroke();
	};



