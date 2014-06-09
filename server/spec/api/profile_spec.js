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
    .inspectJSON()
     .expectJSONTypes(
        {
         id: String,
         name: String,
         description: String,
         max_avatars: Number,
         num_avatars : Number,
         acceptnew_avatars : Boolean
//in_reply_to_screen_name: function(val) { expect(val).toBeTypeOrNull(String); }, // Custom matcher callback

        })
    .toss();