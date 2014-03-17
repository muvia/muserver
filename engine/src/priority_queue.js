
				//------- PRIORITY QUEUE CLASS ------------

				/**
				 * Priority Queue
				 * Sort nodes by distance to camera 
				 * internal pnode structure is:
				 * pnode{data, next}
				 * @param: comparator: a function to compare elements:
				 * comparator(a, b): return true if a > b, false if a <= b
				 */ 
				MuEngine.PriorityQueue= function(comparator){
					this.size = 0; 
					this.head = null; 	
					this.comparator = comparator;
				};

				MuEngine.PriorityQueue.prototype.push = function(node){
					if(this.head == null){
						this.head = {data: node, next: null }; 
						this.size = 1; 
					}else{
						if(this.comparator(node, this.head.data)){
							var aux = this.head;
							this.head = {data:node, next:aux};
						}else{
							var prev = this.head;
							var curr = this.head.next;
						do{	
							if(curr == null){
								prev.next = {data:node, next:null};	
								this.size += 1;
								return;
							}

							if(this.comparator(node,curr.data)){
								prev.next = {data:node, next:curr};	
								this.size += 1;
								return;
							}
							prev = curr;
							curr = curr.next;
							}while(true);
						}
						this.size += 1;
					}
				};

				MuEngine.PriorityQueue.prototype.dump = function(){
					var pnode = this.head; 
					var out = "";
					while(pnode != null){
						out += pnode.data;
						pnode = pnode.next; 
					}
					return out;
				};
				
				MuEngine.PriorityQueue.prototype.peek = function(){
					if(this.head == null) return null;
					else return this.head.data; 
				}
