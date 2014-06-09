/**
 * testing world api
 */
'use strict';
var frisby = require('frisby');

frisby.create('Basic frisby-jasmine test')
    .get('http://localhost:8080/api/world')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .inspectJSON()
     .expectJSONTypes(
        {
         id: String,
         name: String,
         description: String,
         max_avatars: Number,
         num_avatars : Number,
         acceptnew_avatars : Boolean
        })
    .toss();