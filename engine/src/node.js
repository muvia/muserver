
				//------- NODE CLASS ------------

				/**
				 * Node Constructor
				 * implements scene graph.
				 * a node has a transform, a primitive and a list of children nodes.  
					*/ 
				MuEngine.Node = function(primitive){
					this.transform = new MuEngine.Transform();	
					this.primitive = primitive || null; 
					this.children = [ ];
					//world matrix.
					this.wm = mat4.create(); 
					//world position
					this.wp = vec3.create();
				};

				MuEngine.Node.prototype.addChild = function(node){
					this.children.push(node);
				};

				/**
				* use the given matrix as parent matrix, compute world transformation using local transform
				*/
				MuEngine.Node.prototype.updateWorldMat = function(worldmat){
					this.transform.multiply(worldmat, this.wm);
					vec3.transformMat4(this.wp, g_pZero, this.wm); 
				};
