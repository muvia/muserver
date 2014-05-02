	//-------- ANIMATOR CLASS -----------------

/**
 * Animator class constructor
	 parameters as attributes of a config object: 
		target, startVal, endVal, type, duration, loops 
 * @param target: one of Animator.prototype.TARGET_XXX
 * @param type: One of Animator.prototype.TYPE_XXX
 * @param  loops
 * N > 0: Number of executions
 * N <= 0: infinite loop
 */
MuEngine.Animator  = function(config){
//prototype chaining will call this method with empty parameters
  if(config === undefined) return;	
	//configuration parameters
  this.target = config.target ||  "pos";
	this.loops = config.loops || 1;
  this.startVal = config.start || 0.0;
  this.endVal = config.end || 1.0;
  this.duration = config.duration || 1000;
	this.cb = config.cb;

	//internal status variables
  this.starttime = 0;
	this.status = "idle";  
	this.step = 0.0;
};

//a few public static constants
MuEngine.Animator.TARGET_POS ="pos";
MuEngine.Animator.TARGET_ROTY  = "rotY";

MuEngine.Animator.TYPE_LINEAR = "linear";

MuEngine.Animator.STATUS_IDLE = "idle";
MuEngine.Animator.STATUS_RUNNING = "running";
MuEngine.Animator.STATUS_FINISHED = "finished";


MuEngine.Animator.prototype.isFinished = function(){
	return this.status === this.STATUS_FINISHED;
}


MuEngine.Animator.prototype.update = function(dt, node){
//	console.log("status: " + this.status + " step:"+ this.step);
	if(this.status === MuEngine.Animator.STATUS_IDLE){
			this.status = MuEngine.Animator.STATUS_RUNNING;
			this.elapsedtime= 0; 
			this.step = 0;
			this.apply(node);
	}
	else if(this.status === MuEngine.Animator.STATUS_RUNNING){
			this.elapsedtime  += dt;
			if(this.elapsedtime > this.duration){
				this.loops--;
				this.step = 1.0;
				this.status = MuEngine.Animator.STATUS_FINISHED;
				this.cb();
			}else{
				this.step = this.elapsedtime/this.duration;
			}
			this.apply(node);		
	}
	else if(this.status === MuEngine.Animator.STATUS_FINISHED){
	}else throw "unknown animator status: " + this.status; 	
};


//---------------- class AnimatorPos extends Animator ----------------


MuEngine.AnimatorPos  = function(config){
	config.target =  MuEngine.Animator.TARGET_POS;
	MuEngine.Animator.call(this, config);	
	this.val = vec3.clone(this.startVal);
};

//chaining prototypes
MuEngine.AnimatorPos.prototype  = new MuEngine.Animator;

MuEngine.AnimatorPos.prototype.apply = function(node){
	vec3.subtract(this.val, this.endVal, this.startVal);
	vec3.scale(this.val, this.val, this.step); 
	node.transform.setPos(this.val[0], this.val[1], this.val[2]);	
};

//---------------- class AnimatorRotY extends Animator ----------------
MuEngine.AnimatorRotY  = function(config){
	config.target =  MuEngine.Animator.TARGET_ROTY;
	MuEngine.Animator.call(this, config);	
	this.val = this.startVal;
};

//chaining prototypes
MuEngine.AnimatorRotY.prototype = new MuEngine.Animator;

MuEngine.AnimatorRotY.prototype.apply = function(node){
		this.val = this.startVal + this.step*(this.endVal - this.startVal);	
		node.transform.setRotY(this.val);
};


//---------------- class AnimatorMoveCell extends Animator -------------
