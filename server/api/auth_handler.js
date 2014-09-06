/**
 * Muserver API
 * Auth: manages authorization and authentication
 * offers post paths for login and logout, auth based on auth token on http header. 
 */
"use strict";

var Hapi = require('hapi');
var MuAuth = require('../services/muauth');

/**
 * POST /login
 * expects a payload with usr and psw fields. 
 * @returns {{authtoken}}
 */
exports.login = function(request, reply){

	var usr = request.payload.usr;
	var psw = request.payload.psw;
	
	MuAuth.login(usr, psw, function(token){

    console.log("Muauth.login ", usr, psw, token);

    if(token){
        reply({tkn:token});
    }else{
        var error = Hapi.error.badRequest('auth error');
        //return 401 if authorization fails
        error.output.statusCode = 401;
        error.reformat();
        reply(error);
    }
  });
};

/**
 * POST /logout
 * @param {Object} request
 * @param {Object} reply
 */
exports.logout = function(request, reply){

    MuAuth.logout(request.headers['authorization']);
    var res = {
    };

    reply(res);
};
