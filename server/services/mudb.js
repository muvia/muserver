/**
 * muvia db service. offers a facade to communicate with the backend DB. 
 */
"use strict";

var config = require('../config.js');
var mongodbclient = require('mongodb').MongoClient;
var mongodb = null;


mongodbclient.connect(config.dburl, function(err, db) {
  console.log("connecting to db..");
  if(!err) {
	console.log('mudb.js: connected to DB!'); 
	mongodb = db;
  }else{
  	console.log("mudb.js: error connecting to db:", err); 
  }
});

/**
 * This functions delay the execution of the given callback until db connection is available.
 * @param fn
 */
var retrieveConnection = function(fn){
    if(mongodb === null){
        setTimeout(function(){
           retrieveConnection(fn);
        }, 1000);
    } else {
        fn();
    }
};

/**
 * retrieves the user structure from DB, given the username.
 * @param username
 * @param cb callback with signature cb(userStructure)
 */
exports.getUser = function(username, cb){
    var fn = function(){
        mongodb.collection("users", function(err, collection){
            if(err){
                throw "mudb.js: error opening users collection:" + err;
            }else{
                collection.findOne({userid: username}, function(err, userobj){
                    if(err){
                        console.log("mudb.js: error getting user ", username, err);
                        cb(null);
                    }else{
                        cb(userobj);
                    }
                });
            }
        });
    };
    retrieveConnection(fn);
};


/**
 * retrieves the profile structure from DB, given the user name
 * @param username
 * @param cb callback with signature cb(err, profileStructure)
 */
exports.getProfile = function(username, cb){
  var fn = function(){
    mongodb.collection("profiles", function(err, collection){
      if(err){
        throw "mudb.js: error opening profiles collection:" + err;
      }else{
        collection.findOne({userid: username}, function(err, profileobj){
          if(err){
            console.log("mudb.js: error getting profile for user ", username, err);
            cb(null);
          }else{
            console.log("mudb.js: found: ", profileobj);
            if(!profileobj) {
              //console.log("mudb.js: no error, it is just that there is no records in the db!", profileobj);
              profileobj = {
                sounds: {
                  background: true,
                  effects: true,
                  narration: true
                },
                controls: {
                  requireconfirmation: true,
                  clickenabled: true
                },
                engine: {
                  clicktowalk: true,
                  mouse: true,
                  assetdetail: 'high'
                }
              };
            }
            cb(profileobj);
          }
        });
      }
    });
  };
  retrieveConnection(fn);
};

/**
 * saves the profile structure to DB, given the user name
 * @param username
 * @param cb callback with signature cb(err, profileStructure)
 */
exports.saveProfile = function(username, profile, cb){
  var fn = function(){
    mongodb.collection("profiles", function(err, collection){
      if(err){
        throw "mudb.js: error opening profiles collection:" + err;
      }else{
        collection.save({userid: username}, profile, function(err, profile){
          if(err){
            console.log("mudb.js: error saving profile for user ", username, err);
            cb(null);
          }else{
            cb(profile);
          }
        });
      }
    });
  };
  retrieveConnection(fn);
};