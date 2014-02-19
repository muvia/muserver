						
	//------- TRANSFORM CLASS --------
	
	MuEngine.Transform = function(){
		this._dirty = true;
		this.pos = vec3.create();
		this.rot = quat.create();
		this.mat = mat4.create();
		this.scale = 1.0; //we assume a uniform scale
		this.update();
	};

	/**
	 * call whenever pos or rot changes to update matrix
	 */
	MuEngine.Transform.prototype.update = function(){
		mat4.fromRotationTranslation(this.mat, this.rot, this.pos);
	
	/*instead of using glmatrix scale method, we implement a direct transform
  to take adventage of the uniform scale feature*/
		this.mat[0] = this.mat[0] * this.scale;
    this.mat[1] = this.mat[1] * this.scale;
    this.mat[2] = this.mat[2] * this.scale;
    this.mat[3] = this.mat[3] * this.scale;
    this.mat[4] = this.mat[4] * this.scale;
    this.mat[5] = this.mat[5] * this.scale;
    this.mat[6] = this.mat[6] * this.scale;
    this.mat[7] = this.mat[7] * this.scale;
    this.mat[8] = this.mat[8] * this.scale;
    this.mat[9] = this.mat[9] * this.scale;
    this.mat[10] = this.mat[10] * this.scale;
    this.mat[11] = this.mat[11] * this.scale;

		this._dirty = false;
	};

	/**
	 * multiply given matrix by this.mat, store result in out
	 */
	MuEngine.Transform.prototype.multiply = function(mat, out){
		mat4.multiply(out, this.mat, mat);
	};

 /**
	* multiply a given point for this.mat, store the result in out
	*/
	MuEngine.Transform.prototype.multP = function(p, out){
		if(this._dirty) this.update();
		vec3.transformMat4(out, p, this.mat); 		
	};

 /*
 * 
 */
 MuEngine.Transform.prototype.setPos= function(x, y, z){
 	vec3.set(this.pos, x, y, z); 
  this._dirty = true;
 };

 /**
 * rotation over axis Z is the usual rotation used to 
 * rotate in 2d. we expect it to be the most used (maybe the unique?)
 * kind of rotation employed in this engine.
 */
 MuEngine.Transform.prototype.setRotZ= function(anglerad){
 	quat.rotateZ(this.rot, this.rot, anglerad); 

	this._dirty = true; 
};

/**
* we assume uniform scale
*/
MuEngine.Transform.prototype.setScale = function(scale){
	this.scale = scale; 
  this._dirty = true;
};


