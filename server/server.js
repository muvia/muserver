/**
 * muserver platform
 *
 * authentication:
 * based on passport, integrated to hapi through travelogue with yar
 */
'use strict';

var hapi = require('hapi');


var routes = [

    //api related stuff
    {
        method: 'GET', path: '/api', handler: function (request, reply) { reply('ok'); }
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


var LocalStrategy = require('passport-local').Strategy;

Passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));


Passport.serializeUser(function(user, done) {
    done(null, user.id);
});

Passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

server.route(routes);

server.start();