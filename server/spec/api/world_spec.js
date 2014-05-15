/**
 * testing world api
 */
'use strict';
var frisby = require('frisby');

frisby.create('Basic frisby-jasmine test')
    .get('http://localhost:8080/api/world')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    /* .expectJSON('0', {
     place: function(val) { expect(val).toMatchOrBeNull("Oklahoma City, OK"); }, // Custom matcher callback
     user: {
     verified: false,
     location: "Oklahoma City, OK",
     url: "http://brightb.it"
     }
     })*/
     .expectJSONTypes('0', {
         id: String,
         name: String, //Boolean
         //in_reply_to_screen_name: function(val) { expect(val).toBeTypeOrNull(String); }, // Custom matcher callback
         status: {
            accept_connections: Boolean,
            total_users: Number,
            max_users: Number
         }
     })
    .toss();