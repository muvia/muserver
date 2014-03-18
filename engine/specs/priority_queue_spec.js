
/*
 * test priority_queue class. 
 */
describe("Priority Queue: ", function() {


	it("insert a element at the header if the queue is empty", function() {
					var queue = new MuEngine.PriorityQueue(function(a, b){return a<b;});
					queue.push("a");
					expect(queue.peek()).toBe("a");
					expect(queue.size).toBe(1);
 	});

	
	it("insert a pair of ordered elements and keep order", function() {
					var queue = new MuEngine.PriorityQueue(function(a, b){return a<b;});
					queue.push(1);
					queue.push(2);
					expect(queue.dump()).toBe("12");
					expect(queue.size).toBe(2);
 	});

	
	it("insert a pair of unordered elements and order them", function() {
					var queue = new MuEngine.PriorityQueue(function(a, b){return a<b;});
					queue.push(2);
					queue.push(1);
					expect(queue.dump()).toBe("12");
					expect(queue.size).toBe(2);
 	});

	it("insert a serie of ordered elements and keep order", function() {
					var queue = new MuEngine.PriorityQueue(function(a, b){return a<b;});
					queue.push(1);
					queue.push(2);
					queue.push(3);
					queue.push(4);
					queue.push(5);
					queue.push(6);
					expect(queue.dump()).toBe("123456");
					expect(queue.size).toBe(6);
 	});

	it("insert a serie of  unordered elements and sort them", function() {
					var queue = new MuEngine.PriorityQueue(function(a, b){return a<b;});
					queue.push(6);
					queue.push(1);
					queue.push(3);
					queue.push(4);
					queue.push(2);
					queue.push(5);
					expect(queue.dump()).toBe("123456");
					expect(queue.size).toBe(6);
 	});



});
