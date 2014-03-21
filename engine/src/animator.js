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
	this.status = 0; //idle
	this.val = null;
	this.step = 0.0;
};

//a few public static constants
MuEngine.Animator.prototype.TARGET_POS = 0;
MuEngine.Animator.prototype.TARGET_ROTY  = 1;  

MuEngine.Animator.prototype.TYPE_LINEAR = 0;

MuEngine.Animator.prototype.STATUS_IDLE = 0;
MuEngine.Animator.prototype.STATUS_RUNNING = 1;
MuEngine.Animator.prototype.STATUS_FINISHED = 2; 

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
//		node.transform.	
	}else if(this.target === this.TARGET_ROTY){
		
	}else{
		throw "unknown animator target: " + this.target ;
	}		
};
