/**
 * testing world api
 */
'use strict';
var config = require('../../config');
var frisby = require('frisby');
var loginHelper = require('./helpers/login.js');

describe("world", function(){

  var token = "wrong token";


  loginHelper
    .login()
    .after(function(err, res, body){
      frisby.create('should return a world ')
        .get(config.fullhostname+'/api/world')
        //.inspectRequest()
        .addHeader("authorization", JSON.parse(body).tkn)
        .expectStatus(200)
        .expectHeaderContains('content-type', 'application/json')
        //.inspectJSON()
        .expectJSONTypes(
        {
          id: String,
          name: String,
          description: String,
          max_avatars: Number,
          num_avatars : Number,
          acceptnew_avatars : Boolean
        }).toss();
    })
    .toss();
});

