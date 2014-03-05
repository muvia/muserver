MuEngine  = (function(){
	
	MuEngine = {};

	//--- INTERNAL ATTRIBUTES ----
	
	//active grid
	var g_grid = null;

	//active camera
	var g_camera = null;

	//target fps
	var g_fps = 2;

	//the interval for the event loop
	var g_interval = null;

	var g_start_time = null;


	/**
	 * last result of invoking MuEngine.transformPoint.
	 * it is also used to store the first coord when
	 * invoking MuEngine.transformLine. 
	 */ 
	var pt = vec3.create();
	/**
	 * when invoking MuEngine.transformLine, pt will store
	 * the first coord of the line, and pt2 the last one. 
	 */
	var pt2 = vec3.create();
	
	/**
	* cache of MuEngine.imageHandler.
	*/
	var g_images ={}; 

 /**
  * default image to be used while the imageHandlers are fully loaded.
	* it is initializaded in lazy-load by MuEngine.getImage method.
 */
	var g_defimg = null;
	
	//--- CONSTRUCTORS AND METHODS ---

 
