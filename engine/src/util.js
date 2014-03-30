
/**
* common utilities.
* added as static methods to MuEngine module
*/

/**
 * utility method to check for vector equality.
 */
MuEngine.vec3equ = function(a, b){
	return vec3.squaredDistance(a, b) < 0.0001;
};


MuEngine.vec3log = function(label, p){
	console.info("MuEngine.vec3log: "+label+":"+p[0].toFixed(2)+", "+p[1].toFixed(2)+", "+p[2].toFixed(2));
};

//calculate the matrix center and dump to console
MuEngine.mat4centerLog= function(label, mat){
	p = vec3.fromValues(0, 0, 0);
	vec3.transformMat4(p, p, mat);
	console.info("MuEngine.mat4centerLog: "+label+":"+p[0].toFixed(2)+", "+p[1].toFixed(2)+", "+p[2].toFixed(2));
};

/**
* utility method 
*/
MuEngine.deg2rad = function(deg){
  return  deg * (Math.PI / 180);
};


MuEngine.rad2deg= function(rad){
  return  rad * 180 / Math.PI;
};


