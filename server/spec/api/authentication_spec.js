/**
 * testing authentication API 
 */
'use strict';
var config = require('../../config');
var frisby = require('frisby');
var loginHelper = require('./helpers/login');

describe("authentication", function(){

/*
frisby.create('must return 401 if invalid usr,psw  at /login path')
    .post(config.fullhostname+'/api/login', {
    	usr:'prueba',
    	psw: 'pruebaX'
    })
    .expectStatus(401)
    .toss();



frisby.create('must return 200 and auth token if valid usr, psw at /login path')
    .post(config.fullhostname+'/api/login', {
    	usr:config.test.user,
    	psw: config.test.pass
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
	  //.inspectJSON()
    .expectJSONTypes({
         tkn: String
		  })
    .toss();
 */
});
