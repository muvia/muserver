var g_current_user = null;
var g_canvas = null;
var g_ctx = null;

$(document).bind("mobileinit", function($) {
    //here.. general configuration for jquery mobile, like apply themes
    $.mobile.page.prototype.options.addBackBtn = true;
    //$.mobile.transitionFallbacks.slideout = "slide";
    $.mobile.defaultPageTransition= "slide";

	
});

//helper function to show a dialog
mp_show_dialog = function(title, msg, button_label){
    var $dialog = $('div#generic-dialog');
    $('#generic-dialog-title', $dialog).html(title);
    $('#generic-dialog-msg', $dialog).html(msg);
    $('#generic-dialog-button-label', $dialog).html(button_label);
    $('a#generic-dialog-link').click();
};

//invoke a REST service that is expected to return json, and pass it to the callback. 
//if error, displays a dialog using the error json returned:  {title, message, details}
mp_json = function(action, method, data, callback){
    $.mobile.showPageLoadingMsg();
      $.ajax({
          type: method,
          url: action,
          dataType: 'json',
          data:data,
          success:function(jsonobj) {
              $.mobile.hidePageLoadingMsg(); 
              callback(jsonobj);
          },
          error:function(response) {
                $.mobile.hidePageLoadingMsg();
                console.log('trying to parse:' + response.responseText);
                err = JSON.parse(response.responseText);
                console.log("error: "+ err.title + " "+ err.message + " "+ err.details);
                mp_show_dialog(err.title, err.message, 'continue');
            }
 });
};

mp_add_footer = function(page){
	console.log("adding footer to " + page);
	var footertpl  = Handlebars.compile($("#footer-template").html());
	$footer = $("<div id='footer' class='' data-role='footer' data-position='fixed'  />").html(footertpl({year: new Date().getFullYear()}));
 	$page = $(page);
	$page.append($footer);
	$page.trigger('create'); //some folk say it will produce undesired effects.. like messing up back buttons. but we cant fire this on footer itself!
}

//--- welcome (index) page
$( "div#welcome-page" ).on( "pagecreate", function( event, ui ) {
	console.log("welcome page loaded");
	mp_add_footer(this);
	
	g_canvas = $("canvas#c").get(0);
	console.log(g_canvas);
	g_ctx = g_canvas.getContext('2d');

});



//---menu  page
$( "div#menu-page" ).on( "pageinit", function( event, ui ) {
	console.log("menu page loaded");
} );


