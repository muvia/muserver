/**
 * muvia authorization service. offers methods to create and validate an auth token
 */
"use strict";

var btoa = require('btoa');

/**
 * tokenStore keeps the valid tokens. each token has the following structure:
 * {
 * 	token
 * 	usrid
 *  creationtime
 * }
 */
var g_tokenStore = {};

/**
 * token expiration time in milliseconds. remember to move it to config.js!
 * @type {login}
 */
var G_EXPIRATION_TIME = 60*1000; //60 seconds

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
    var data = {
        usr: usr,
        creation: Date.now()
    };
    var token = btoa(JSON.stringify(data));
    g_tokenStore[token] = data;
   	return token;
	}
	else{
		return null;
	}
};

/**
 * given an authorization token, returns true if it is valid.
 * false if it does not exist or it exists but it expired.
 * @param authtoken
 */
exports.authenticate = function(authtoken){
    var token = g_tokenStore[authtoken];
    if(token != undefined){
        if(Date.now() > token.creation + G_EXPIRATION_TIME ){
            //token expired!
            delete g_tokenStore[authtoken];
            return false;
        }else{
            return true;
        }
    }else{
        return false;
    }
};
