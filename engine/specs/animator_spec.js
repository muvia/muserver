
/*
 * test Animator class. 
 */
describe("Animator: ", function() {

	//global vars for the tests
	var out = vec3.create();
	var p = vec3.fromValues(1, 2, 3);

it("transform node position linearly with single loop and absolute position", function() {
			var p_equal = vec3.fromValues(10, 20, 30);
			vec3.set(p, 10, 20, 30);
			var node = new MuEngine.Node();
			
			var target = MuEngine.Animator.prototype.TARGET_POS;
			var startVal = vec3.fromValues(0, 0, 0);
			var endVal = vec3.fromValues(10, 20, 30); 
			var type = MuEngine.Animator.prototype.TYPE_LINEAR;
			var duration = 100;
			var loop = 1;
			var anim = new MuEngine.Animator(target, startVal, endVal, type, duration, loop);
			
			anim.update(0, node);	
			expect(anim.status).toBe(anim.STATUS_IDLE);
			expect(anim.step).toBe(0);

			/*anim.update(10, node);
			expect(anim.status).toBe(anim.STATUS_RUNNING);
			expect(anim.step).toBe(0.1);
			expect(MuEngine.vec3equ(vec3.fromValues(1, 2, 3), node.transform.pos)).toBe(true);
			*/
 	});


});
