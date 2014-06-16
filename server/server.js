/**
 * muserver platform
 *
 * authentication:
 * based on passport, integrated to hapi through travelogue with yar
 */
'use strict';

var hapi = require('hapi');

var muAuthHandler = require('./api/auth_handler.js');
var muWorldHandler = require('./api/world_handler.js');
var muProfileHandler = require('./api/user_handler.js');
var muconfig = require('./config.js');



var routes = [

    //api related stuff
    { method: 'GET', path: '/api', handler: function (request, reply) { reply('muserver API version 0.1  copyright 2014 cesarpachon@gmail.com'); }},
    { method: 'POST', path: '/api/login', handler: muAuthHandler.login},
    { method: 'GET', path: '/api/world', handler: muWorldHandler.getWorld},
    { method: 'GET', path: '/api/profile', config: { auth: 'muauth' }, handler: muProfileHandler.getProfile },
    { method: 'POST', path: '/api/profile', config: { auth: 'muauth' },  handler: muProfileHandler.saveProfile},
    
    //static content, for the portal
    {
        method: 'GET', path: '/{path*}',
        handler: { directory: { path: './portal', listing: true } }
    }
    ];


var server = new hapi.Server(muconfig.hostname, muconfig.port);


/// muauth module


var muscheme = function(server, options){
	return {
		authenticate: function(request, reply /*function (err, result)*/){
			/*if done, call reply with err= null and result = { credentials : ?? }*/
			console.log('muscheme.authenticate. reply true');
			reply(null, {credentials:true});
			
		}
	};
};

server.auth.scheme("muauth", muscheme);
server.auth.strategy('muauth', 'muauth');




server.route(routes);
server.start();
