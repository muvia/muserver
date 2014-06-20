/**
 * muvia db service. offers a facade to communicate with the backend DB. 
 */
"use strict";

var config = require('../config.js');
var mongodbclient = require('mongodb').MongoClient;
var mongodb = null;

mongodbclient.connect(config.dburl, function(err, db) {
  if(!err) {
	console.log('mudb.js: connected to DB!'); 
	mongodb = db; 
  }else{
  	console.log("mudb.js: error connecting to db:", err); 
  }
});

