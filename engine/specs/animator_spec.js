
/*
 * test Animator class. 
 */
describe("Animator: ", function() {


it("anim position single loop and absolute position", function() {
			var p_equal = vec3.fromValues(10, 20, 30);
			var node = new MuEngine.Node();
			
			var target = MuEngine.Animator.prototype.TARGET_POS;
			var startVal = vec3.fromValues(0, 0, 0);
			var endVal = vec3.fromValues(10, 20, 30); 
			var type = MuEngine.Animator.prototype.TYPE_LINEAR;
			var duration = 100;
			var loop = 1;
			var anim = new MuEngine.Animator(target, startVal, endVal, type, duration, loop);
			
			expect(anim.status).toBe(anim.STATUS_IDLE);
			expect(anim.step).toBe(0);

			anim.update(0, node);	
			expect(anim.status).toBe(anim.STATUS_RUNNING);

			anim.update(10, node);
			expect(anim.status).toBe(anim.STATUS_RUNNING);
			expect(anim.step).toBe(0.1);
			expect(MuEngine.vec3equ(vec3.fromValues(1, 2, 3), node.transform.pos)).toBe(true);
			
			anim.update(40, node);
			expect(anim.status).toBe(anim.STATUS_RUNNING);
			expect(anim.step).toBe(0.5);
			expect(MuEngine.vec3equ(vec3.fromValues(5, 10, 15), node.transform.pos)).toBe(true);

			anim.update(60, node);
			expect(anim.status).toBe(anim.STATUS_FINISHED);
			expect(anim.step).toBe(1.0);
			expect(MuEngine.vec3equ(vec3.fromValues(10, 20, 30), node.transform.pos)).toBe(true);
			

 	});


it("anim rotationY infinite loop ", function() {
			var p_equal = vec3.fromValues(10, 20, 30);
			var node = new MuEngine.Node();
			
			var target = MuEngine.Animator.prototype.TARGET_POS;
			var startVal = vec3.fromValues(0, 0, 0);
			var endVal = vec3.fromValues(10, 20, 30); 
			var type = MuEngine.Animator.prototype.TYPE_LINEAR;
			var duration = 100;
			var loop = 1;
			var anim = new MuEngine.Animator(target, startVal, endVal, type, duration, loop);
			
			expect(anim.status).toBe(anim.STATUS_IDLE);
			expect(anim.step).toBe(0);

			anim.update(0, node);	
			expect(anim.status).toBe(anim.STATUS_RUNNING);

			anim.update(10, node);
			expect(anim.status).toBe(anim.STATUS_RUNNING);
			expect(anim.step).toBe(0.1);
			expect(MuEngine.vec3equ(vec3.fromValues(1, 2, 3), node.transform.pos)).toBe(true);
			
			anim.update(40, node);
			expect(anim.status).toBe(anim.STATUS_RUNNING);
			expect(anim.step).toBe(0.5);
			expect(MuEngine.vec3equ(vec3.fromValues(5, 10, 15), node.transform.pos)).toBe(true);

			anim.update(60, node);
			expect(anim.status).toBe(anim.STATUS_FINISHED);
			expect(anim.step).toBe(1.0);
			expect(MuEngine.vec3equ(vec3.fromValues(10, 20, 30), node.transform.pos)).toBe(true);
			

 	});


});
