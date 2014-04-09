
//------- NODE CLASS ------------

/**
 * Node Constructor
 * implements scene graph.
 * a node has a transform, a primitive and a list of children nodes.  
	*/ 
MuEngine.Node = function(primitive){
	this.transform = new MuEngine.Transform();	
	this.primitive = primitive || null; 
	this.children = [ ];
	//world matrix.
	this.wm = mat4.create(); 
	//world position
	this.wp = vec3.create();
};

MuEngine.Node.prototype.addChild = function(node){
	this.children.push(node);
};

/**
* use the given matrix as parent matrix, compute world transformation using local transform
*/
MuEngine.Node.prototype.updateWorldMat = function(worldmat){
	this.transform.multiply(worldmat, this.wm);
	vec3.transformMat4(this.wp, g_pZero, this.wm); 
};


/**
 * recursive function 
 */ 
MuEngine.Node.prototype.render = function(mat){
	this.updateWorldMat(mat);
	if(this.primitive != null){
			this.primitive.render(this, g_camera);
	};
	for(var i=0; i<this.children.length; ++i){
		this.children[i].render(this.wm);
	};	  
};


/**
* animators are temporal objects. they are added on demand, and once they
* reach the finished status, they are removed from the collection. 
*/
MuEngine.Node.prototype.addAnimator= function (animator){
	if(this.animators == undefined){
		this.animators = [];
	}		
	this.animators.push(animator);
};


MuEngine.Node.prototype.update = function(dt){
	if(this.animators != undefined){
		for(var i=0; i<this.animators.length; ){
			var animator = this.animators[i];
			animator.update(dt, this);
			if(animator.isFinished()){
				this.animators.splice(i, 1);
			}else{
				++i;
			}
		}
	}
	if(this.primitive != null){
		this.primitive.update(dt);
	}
	for(var i=0; i<this.children.length; ++i){
		this.children[i].update(dt);
	};	
}

