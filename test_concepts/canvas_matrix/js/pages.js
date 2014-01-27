var g_current_user = null;
var g_canvas = null;
var g_grid = null;
var g_camera = null; 
var g_line = null;

//--- welcome (index) page
$( "div#welcome-page" ).on( "pagecreate", function( event, ui ) {
	console.log("welcome page loaded");
	mp_add_footer(this);
	g_canvas = $("canvas#c").get(0);
	console.log(g_canvas);

  g_camera = new MuEngine.Camera(g_canvas);
	g_grid = new MuEngine.Grid(4,2);

  MuEngine.setActiveCamera(g_camera);
  MuEngine.setActiveGrid(g_grid);  
  //MuEngine.start();
});



//---menu  page
$( "div#menu-page" ).on( "pageinit", function( event, ui ) {
	console.log("menu page loaded");
} );


