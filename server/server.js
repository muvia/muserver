/**
 * muserver platform
 *
 * authentication:
 * based on passport, integrated to hapi through travelogue with yar
 */
'use strict';

var hapi = require('hapi');

var muWorldHandler = require('./api/world_handler.js');
var muProfileHandler = require('./api/user_handler.js');
var muconfig = require('./config.js');

var path_auth_config = { 
	auth: { strategies: ['passport'], mode: 'required' } 
};


var routes = [

    //api related stuff
    { method: 'GET', path: '/api', handler: function (request, reply) { reply('muserver API version 0.1  copyright 2014 cesarpachon@gmail.com'); }},
    { method: 'GET', path: '/api/world', handler: muWorldHandler.getWorldHandler, config: path_auth_config},
    { method: 'GET', path: '/api/profile', handler: muProfileHandler.getProfile, config: path_auth_config},
    { method: 'POST', path: '/api/profile', handler: muProfileHandler.saveProfile, config: path_auth_config},
    
    //static content, for the portal
    {
        method: 'GET', path: '/{path*}',
        handler: { directory: { path: './portal', listing: true } }
    }
    ];

var config = {
    hostname: "0.0.0.0",
    port:8080,
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
    travelogue: config
};

var server = new hapi.Server(config.hostname, config.port);


server.pack.require(plugins, function (err) {
    if (err) {
        throw err;
    }
});


server.auth.strategy('passport', 'passport');

var Passport = server.plugins.travelogue.passport;


var UserAppStrategy = require('passport-userapp').Strategy;

Passport.use(new UserAppStrategy({
        appId: muconfig.passport_UserAppStrategy_appId
    },
    function (userprofile, done) {
        Users.findOrCreate(userprofile, function(err,user) {
            if(err) return done(err);
            return done(null, user);
        });
    }
));

server.route(routes);

server.start();
