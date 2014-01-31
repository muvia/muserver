
//------- NODE CLASS ------------

/**
 * Node Constructor
 * implements scene graph.
 * a node has a transform, a primitive and a list of children nodes.  
  */ 
MuEngine.Node = function(primitive){
	this.transform = new MuEngine.transform();	
	this.primitive = primitive; 
	this.children = [ ];
};


