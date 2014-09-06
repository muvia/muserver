/**
 * testing world api
 */
'use strict';
var config = require('../../config');
var frisby = require('frisby');
var loginHelper = require('./helpers/login.js');

describe("accesibility profile", function(){

  loginHelper
    .login()
    .after(function(err, res, body) {
      frisby.create('should return a valid profile')
        .get(config.fullhostname + '/api/profile')
        .addHeader("authorization", JSON.parse(body).tkn)
        .inspectRequest()
        .expectStatus(200)
        .expectHeaderContains('content-type', 'application/json')
        .inspectJSON()
        .expectJSON(
        {
          sound:{
            background: true,
            effects: true,
            narration: true
          },
          controller:{
            requireconfirmation:true,
            clickenabled: true
          },
          engine:{
            clicktowalk: true,
            mouse: true,
            assetdetail: 'high'
          }
        }).toss();
    })
    .toss();
});
