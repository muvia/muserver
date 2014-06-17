/**
 * muvia authorization service. offers methods to create and validate an auth token
 */
"use strict";

/**
 * tokenStore keeps the valid tokens. each token has the following structure:
 * {
 * 	token
 * 	usrid
 *  creationtime
 * }
 */
var tokenStore = [];

/**
 * login method. if usr, psw are ok, returns an authentication token.
 * returns null in other case. 
 * @param {Object} usr
 * @param {Object} psw
 */
exports.login = function(usr, psw){
  if(usr != undefined && usr != null && 
   psw != undefined && psw != null && 
   usr === psw){
   	console.log('ok '+ usr + ' '+ psw);
   	return "what is the authtoken..";
	}
	else{
		return null;
	}
};
