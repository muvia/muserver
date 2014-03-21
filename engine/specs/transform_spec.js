
/*
 * test transform class. 
 */
describe("Transform: ", function() {

	//global vars for the tests
	var out = vec3.create();
	var p = vec3.fromValues(1, 2, 3);

it("says two vectors 3 are equals", function(){
				
			var p2 = vec3.fromValues(1, 2, 3);
			var p3 = 	vec3.fromValues(10, 2, 3);

			expect(MuEngine.vec3equ(p, p2)).toBe(true);
			expect(MuEngine.vec3equ(p3, p2)).toBe(false);
	});	
				
it("identity keeps a point untouched", function() {
			
			var p_equal = vec3.fromValues(1, 2, 3);
			var transform = new MuEngine.Transform();
			transform.multP(p, out);
			expect(MuEngine.vec3equ(p_equal, out)).toBe(true);
 	});
	
it("translation transforms a point as expected ", function() {
			var p_equal = vec3.fromValues(1, 2, 3);
			vec3.set(p_equal, 1.5, 2.6, 3.7);
			var transform = new MuEngine.Transform();
			transform.setPos(0.5, 0.6, 0.7);
			transform.multP(p, out);
			//console.info("translation: ");
			//MuEngine.vec3log("p_equal", p_equal);
			//MuEngine.vec3log("p",  p);
			//MuEngine.vec3log("out",  out);
			expect(MuEngine.vec3equ(p_equal, out)).toBe(true);
 	});

it("rotation transforms a point as expected ", function() {
			var p_equal = vec3.fromValues(0, 10, 0);
			vec3.set(p, 10, 0, 0);
			var transform = new MuEngine.Transform();
			transform.setRotZ(MuEngine.deg2rad(90), 0.0, 0.0);
			transform.multP(p, out);
			//console.info("rotation: ");
			//MuEngine.vec3log("p_equal", p_equal);
			//MuEngine.vec3log("p",  p);
			//MuEngine.vec3log("out",  out);
			expect(MuEngine.vec3equ(p_equal, out)).toBe(true);
 	});

it("scale transforms a point as expected ", function() {
			var p_equal = vec3.fromValues(5, 10, 15);
			vec3.set(p, 10, 20, 30);
			var transform = new MuEngine.Transform();
			transform.setScale(0.5);
			transform.update();
			transform.multP(p, out);
			//console.info("scaling: ");
			//MuEngine.vec3log("p_equal", p_equal);
			//MuEngine.vec3log("p",  p);
			//MuEngine.vec3log("out",  out);
			expect(MuEngine.vec3equ(p_equal, out)).toBe(true);
 	});


it("accumulate translations through hierarchies", function() {
			var p_equal = vec3.fromValues(0.5, 0, 0.5);
			vec3.set(p, 0, 0, 0);
			var transform1 = new MuEngine.Transform();
			var transform2 = new MuEngine.Transform();
			var transform3 = new MuEngine.Transform();

			transform2.setPos(1, 0, 2);
			transform3.setPos(-0.5, 0, -1.5);

			//MuEngine.vec3log("p starts in:",  p);
			transform1.multP(p, out);
			vec3.copy(p, out);
			//MuEngine.vec3log("p after transform1:",  p);
			transform2.multP(p, out);
			vec3.copy(p, out);
			//MuEngine.vec3log("p after transform2:",  p);
			transform3.multP(p, out);
			vec3.copy(p, out);
			//MuEngine.vec3log("p after transform3:",  p);
			//MuEngine.vec3log("p_equal", p_equal);
			
			expect(MuEngine.vec3equ(p_equal,p)).toBe(true);
 	});


});
