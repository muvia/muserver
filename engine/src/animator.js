//-------- ANIMATOR CLASS -----------------

/**
 * Animator class constructor
 * @param target: one of Animator.prototype.TARGET_XXX
 * @param type: One of Animator.prototype.TYPE_XXX
 * @param  loops
 * N > 0: Number of executions
 * N <= 0: infinite loop
 */
MuEngine.Animator = function(target, startVal, endVal, type, duration, loops ){
	
	//configuration parameters
    this.target = target;
		this.loops = loops;
    this.startVal = startVal;
    this.endVal = endVal;
    this.duration = duration;

	//internal status variables
    this.starttime = 0;
	this.status = "idle";  
	if(target === "pos"){
		this.val = vec3.fromValues(startVal[0], startVal[1], startVal[2]);
	}
	else
		this.val = startVal;
	this.step = 0.0;
};

//a few public static constants
MuEngine.Animator.prototype.TARGET_POS ="pos";
MuEngine.Animator.prototype.TARGET_ROTY  = "rotY";  

MuEngine.Animator.prototype.TYPE_LINEAR = "linear";

MuEngine.Animator.prototype.STATUS_IDLE = "idle";
MuEngine.Animator.prototype.STATUS_RUNNING = "running";
MuEngine.Animator.prototype.STATUS_FINISHED = "finished"; 

MuEngine.Animator.prototype.update = function(dt, node){
	if(this.status === this.STATUS_IDLE){
			this.status = this.STATUS_RUNNING; 
			this.elapsedtime= 0; 
			this.step = 0;
			this.apply(node);
	}
	else if(this.status === this.STATUS_RUNNING){ 
			this.elapsedtime  += dt;
			if(this.elapsedtime > this.duration){
				this.loops--;
				this.step = 1.0;
				this.status = this.STATUS_FINISHED;	
			}else{
				this.step = this.elapsedtime/this.duration;
			}
			this.apply(node);		
	}
	else if(this.status === this.STATUS_FINISHED){
	}else throw "unknown animator status: " + this.status; 	
};

/**
* private method. apply the current value to the node
*/
MuEngine.Animator.prototype.apply = function(node){
	if(this.target === this.TARGET_POS){
		vec3.subtract(this.val, this.endVal, this.startVal);
		vec3.scale(this.val, this.val, this.step); 
		node.transform.setPos(this.val[0], this.val[1], this.val[2]);	
	}else if(this.target === this.TARGET_ROTY){
		this.val = this.startVal + this.step*(this.endVal - this.startVal);	
		node.transform.rotY(this.val);
	}else{
		throw "unknown animator target: " + this.target ;
	}		
};
