/**
 * muvia db service. offers a facade to communicate with the backend DB. 
 */
"use strict";

var config = require('../config.js');
var mongodb = require('mongodb').MongoClient;

mongodb.connect(config.dburl, function(err, db) {
  if(!err) {
	console.log('mudb.js: connected to DB!'); 
  }
});

