
/*
 * test node class. 
 */
describe("Node: ", function() {

	//global vars for the tests
	var out = vec3.create();
	var p = vec3.fromValues(1, 2, 3);

it("accumulate transformations through hierarchies", function() {
			var p_equal = vec3.fromValues(0.5, 0, 0.5);
			vec3.set(p, 0, 0, 0);
			var node1 = new MuEngine.Node();
			var node2 = new MuEngine.Node();
			var node3 = new MuEngine.Node();

			node2.transform.setPos(1, 0, 2);
			node3.transform.setPos(-0.5, 0, -1.5);

			mat = mat4.create();

			//MuEngine.vec3log("p starts in:",  p);
			node1.transform.multP(p, out);
			vec3.copy(p, out);
			//MuEngine.vec3log("p after node1:",  p);
			node2.updateWorldMat(node1.wm);
			node2.transform.multP(p, out);
			vec3.copy(p, out);
			//MuEngine.vec3log("p after node2:",  p);
			node3.updateWorldMat(node2.wm);
			node3.transform.multP(p, out);
			vec3.copy(p, out);
			//MuEngine.vec3log("p after node3:",  p);
			//MuEngine.vec3log("p_equal", p_equal);
			
			expect(MuEngine.vec3equ(p_equal,p)).toBe(true);
 	});


});
