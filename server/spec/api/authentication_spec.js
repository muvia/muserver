/**
 * testing authentication API 
 */
'use strict';
var frisby = require('frisby');

frisby.create('must return 401 if invalid usr,psw  at /login path')
    .post('http://localhost:8080/api/login', {
    	usr:'prueba',
    	psw: 'pruebaX'
    })
    .expectStatus(401)
    .toss();
    
frisby.create('must return 200 and auth token if valid usr, psw at /login path')
    .post('http://localhost:8080/api/login', {
    	usr:'prueba',
    	psw: 'prueba'
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
	.inspectJSON()
    .expectJSONTypes(
        {
         tkn: String
		})
    .toss();