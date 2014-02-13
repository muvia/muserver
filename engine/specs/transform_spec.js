
/*
 * test transform class. 
 */
describe("Transform: ", function() {

	//global vars for the tests
	var out = vec3.create();
	var p = vec3.fromValues(1, 2, 3);
	var transform = new MuEngine.Transform();

it("says two vectors 3 are equals", function(){
				
			var p2 = vec3.fromValues(1, 2, 3);
			var p3 = 	vec3.fromValues(10, 2, 3);

			expect(MuEngine.vec3equ(p, p2)).toBe(true);
			expect(MuEngine.vec3equ(p3, p2)).toBe(false);
	});	
				
it("identity transform a point as expected ", function() {
			
			var p_equal = vec3.fromValues(1, 2, 3);
			transform.multP(p, out);
			expect(MuEngine.vec3equ(p_equal, out)).toBe(true);
	
			//test a translate transform			
			vec3.set(p_equal, 1.5, 2.6, 3.7);
			vec3.set(transform.pos, 0.5, 0.6, 0.7);
			transform.update();
			transform.multP(p, out);
			expect(MuEngine.vec3equ(p_equal, out)).toBe(true);
			MuEngine.vec3log("p_equal", p_equal);
			MuEngine.vec3log("p",  p);
			MuEngine.vec3log("out",  out);
 	});
});
