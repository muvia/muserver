/**
 * muserver platform
 *
 * authentication:
 * based on passport, integrated to hapi through travelogue with yar
 */
'use strict';

var hapi = require('hapi');
var passport = require('passport');
var UserAppStrategy = require('passport-userapp').Strategy;

//var Travelogue = require('travelogue');

var muWorldHandler = require('./api/world_handler.js');
var muProfileHandler = require('./api/user_handler.js');
var muconfig = require('./config.js');



var routes = [

    //api related stuff
    { method: 'GET', path: '/api', handler: function (request, reply) { reply('muserver API version 0.1  copyright 2014 cesarpachon@gmail.com'); }},
    { method: 'GET', path: '/api/world', handler: muWorldHandler.getWorldHandler},
    { method: 'GET', path: '/api/profile', config: { auth: 'passport' }, handler: muProfileHandler.getProfile },
    { method: 'POST', path: '/api/profile', config: { auth: 'passport' },  handler: muProfileHandler.saveProfile},
    
    //static content, for the portal
    {
        method: 'GET', path: '/{path*}',
        handler: { directory: { path: './portal', listing: true } }
    }
    ];


var travelogue_config = {
    hostname: muconfig.hostname,
    port:muconfig.port,
    urls: {
        failureRedirect: '/login',
        successRedirect: '/'
    }
};


var plugins = {
    yar: {
        cookieOptions: {
            password: muconfig.yar_cookieOptions_password, // cookie secret
            isSecure: false // required for non-https applications
        }
    },
    travelogue: travelogue_config
};


var server = new hapi.Server(muconfig.hostname, muconfig.port);

//console.log(Travelogue);
//Travelogue.configure(server, Passport, plugins);


server.pack.require(plugins, function (err) {
    if (err) {
        throw err;
    }
});


server.auth.strategy('passport', 'passport');

//var Passport = server.plugins.travelogue.passport;

/*
Passport.use(new UserAppStrategy({
        appId: muconfig.passport_UserAppStrategy_appId
    },
    function (userprofile, done) {
    	console.log("hey hey");
        Users.findOrCreate(userprofile, function(err,user) {
            if(err){
            	console.log("UserAppStrategy:error: "+ err);
            	return done(err);
            } else{
            	console.log("UserAppStrategy:success: "+ user);
	            return done(null, user);            	
            }

        });
    }
));
*/
server.route(routes);

server.start();
