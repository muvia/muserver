/**
 * muvia authorization service. offers methods to create and validate an auth token
 */
"use strict";

var btoa = require('btoa');
var phas = require('password-hash-and-salt');
var mudb = require('./mudb');

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
 * login method. if usr, psw are ok, invoke the callback with an authentication token.
 * pass null to the callback in other case.
 * @param {Object} usr
 * @param {Object} psw
 * @param {function} callback with signature function(authtoken).
 */
exports.login = function(usr, psw, cb){
  if(!usr || !psw){
    cb(null);
  }
  else{
    mudb.getUser(usr, function(user){
      if(!user){
        cb(null);
      }else{
        //validate the password
        phas(psw).verifyAgainst(user.pswd, function(error, verified) {
          if(error){
            console.log("muauth.js:login: error validating psw", error);
            cb(null);
          }else if(!verified){
            console.log("muauth.js:login: incorrect password");
            cb(null);
          }
          else{
            //create a token and return to the user
            var data = {
              usr: usr,
              creation: Date.now()
            };
            var token = btoa(JSON.stringify(data));
            console.log('muauth.js:login:loggin in ', JSON.stringify(data));
            g_tokenStore[token] = data;
            cb(token);
          }
        });

      }
    });
  }
};

/**
 *
 * @param authtoken
 */
exports.logout = function(authtoken){

  if(authtoken){
    if(authtoken.indexOf("Basic :") === 0){
      authtoken = authtoken.substring("Basic :".length);
    }
    if(g_tokenStore[authtoken]){
      console.log("loggin out ", authtoken);
      delete g_tokenStore[authtoken];
    }else{
      console.log("nothing to do. the token did not exist.", authtoken, g_tokenStore);
    }
  }else{
    console.log("nothing to do. received undefined token");
  }
};

/**
 * retrieve the userid from the token in the header of a request object.
 * @param request
 * @returns {string} userid
 */
exports.getUserId = function(request){
  var token = request.headers['authorization'];
  if(token){
    var session = g_tokenStore[token];
    if(session)
      return session.usrid;
  }
  return null;
};

/**
 * given an authorization token, returns true if it is valid.
 * false if it does not exist or it exists but it expired.
 * @param authtoken
 */
exports.authorize = function(authtoken){
  var token = g_tokenStore[authtoken];
  if(token){
    if(Date.now() > token.creation + G_EXPIRATION_TIME ){
      //token expired!
      delete g_tokenStore[authtoken];
      console.log("services/muauth.js: token expired ", authtoken);
      return false;
    }else{
      return true;
    }
  }else{
    console.log("services/muauth.js: no token found ", authtoken);
    return false;
  }
};
