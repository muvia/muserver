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
            if(err != null){
                throw "mudb.js: error opening users collection:" + err;
            }else{
                collection.findOne({userid: username}, function(err, userobj){
                    if(err != null){
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

