/**
 * muserver platform
 *
 * authentication:
 * based on passport, integrated to hapi through travelogue with yar
 */
'use strict';

var hapi = require('hapi');

var muWorldHandler = require('./api/world_handler.js');

var routes = [

    //api related stuff
    {
        method: 'GET', path: '/api', handler: function (request, reply) { reply('ok'); }
    },
    {
        method: 'GET', path: '/api/world', handler: muWorldHandler.getWorldHandler
    },
    //static content, for the portal
    {
        method: 'GET', path: '/{path*}',
        handler: { directory: { path: '../portal', listing: true } }
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
            password: 'TheMuServerCookieSecret', // cookie secret
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
        appId: '53739ca105ab1'
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
