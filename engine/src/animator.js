//-------- ANIMATOR CLASS -----------------

/**
 * Animator class constructor
 *
 * @param  loops
 * N > 0: Number of executions
 * N <= 0: infinite loop
 */
Animator = function(target, startVal, endVal, duration, loops ){

    this.target = target;
	this.loops = loops;
    this.startVal = startVal;
    this.endVal = endVal;
    this.duration = duration;

    this.elapsed = 0.0;

	
}

//a few public static constants
Animator.prototype.TARGET_POS = 0;

Animator.prototype.TYPE_LINEAR = 0;


Animator.prototype.update = function(node){
	
}