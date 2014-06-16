/**
 * Muserver API
 * Auth: manages authorization and authentication
 * offers post paths for login and logout, auth based on auth token on http header. 
 */
"use strict";

var Hapi = require('hapi');

/**
 * POST /login
 * expects a payload with usr and psw fields. 
 * psw is unencrypted by now. 
 * @returns {{authtoken}}
 */
exports.login = function(request, reply){

	var usr = request.payload.usr;
	var psw = request.payload.psw;

	if(usr != undefined && usr != null && 
	   psw != undefined && psw != null && 
	   usr === psw){
	   	console.log('ok '+ usr + ' '+ psw);
	   	reply("what is the authtoken..");
	}else{
		var error = Hapi.error.badRequest('auth error');
		//return 401 if authorization fails
		error.output.statusCode = 401;
	    error.reformat();
		reply(error);		
	}

};

/**
 * POST /logout
 * @param {Object} request
 * @param {Object} reply
 */
exports.logout = function(request, reply){
    var res = {
    };

    reply(res);
};
