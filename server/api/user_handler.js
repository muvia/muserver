/**
 * Muserver API
 * Profile
 * each user has an accesibility profile associated to it.
 * the profile may exist or not, and if exist, it may be completed or not.
 * profile may be retrived and posted for update, but it must be validated against an schema.
 */
"use strict";
var Hapi = require('hapi');
var MuAuth = require('../services/muauth');
var mudb = require('../services/mudb');


/**
 * GET /profile
 * @returns {
    sound:{
            background: true,
            effects: true,
            narration: true
          },
    controls:{
            requireconfirmation:true,
            clickenabled: true
          },
    engine:{
            clicktowalk: true,
            mouse: true,
            assetdetail: 'high'}
    }
 */
exports.getProfile = function(request, reply){

  var usrid = MuAuth.getUserId(request);

  mudb.getProfile(usrid, function(profile){
    if(profile){
      reply(profile);
    }else{
      var error = Hapi.error.badRequest(err);
      error.output.statusCode = 500;
      reply(error);
    }
  });

};

/**
 * PUT /profile
 * @param {Object} request
 * @param {Object} reply
 */
exports.saveProfile = function(request, reply){

  var usrid = MuAuth.getUserId(request);
  var profile = request.payload;
  console.log("user_handler.js:saveProfile for ", usrid, profile);
  mudb.saveProfile(usrid, profile, function(err, w){
    if(!err){
      reply(profile);
    }else{
      console.log("saveProfile: error:", err);
      var error = Hapi.error.badRequest(err);
      error.output.statusCode = 500;
      reply(error);
    }
  });
};
