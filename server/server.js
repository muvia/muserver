/**
 * muserver platform
 *
 * authentication:
 * based on passport, integrated to hapi through travelogue with yar
 */
'use strict';

var hapi = require('hapi');

var muAuthHandler = require('./api/auth_handler');
var muWorldHandler = require('./api/world_handler');
var muProfileHandler = require('./api/user_handler');
var muconfig = require('./config');
var mudb = require('./services/mudb');
var MuAuth = require('./services/muauth');


var routes = [

    //api related stuff
    { method: 'GET', path: '/api', handler: function (request, reply) { reply('muserver API version 0.1  copyright 2014 cesarpachon@gmail.com'); }},
    { method: 'POST', path: '/api/login', config:{auth: false}, handler: muAuthHandler.login},
    { method: 'POST', path: '/api/logout', handler: muAuthHandler.logout},
    { method: 'GET', path: '/api/world', config: { auth: 'muauth' }, handler: muWorldHandler.getWorld},
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
            console.log("muchscheme:authenticating..", request.headers['authorization']);
			if(MuAuth.authorize(request.headers['authorization'])){
                console.log("you are in!");
                reply(null, {credentials:true});
            }
            else{
                console.log("get out!");
                var error = hapi.error.unauthorized('authentication failed');
                reply(error);
            }

		}
	};
};

server.auth.scheme("muauth", muscheme);
server.auth.strategy('muauth', 'muauth');




server.route(routes);
server.start();
