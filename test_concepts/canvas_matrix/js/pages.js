var g_current_user = null;
var g_canvas = null;

//--- welcome (index) page
$( "div#welcome-page" ).on( "pagecreate", function( event, ui ) {
	console.log("welcome page loaded");
	mp_add_footer(this);
	
	g_canvas = $("canvas#c").get(0);
	console.log(g_canvas);

	MuEngine.start();

});



//---menu  page
$( "div#menu-page" ).on( "pageinit", function( event, ui ) {
	console.log("menu page loaded");
} );


