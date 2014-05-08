/**
 * muserver platform
 *
 *
 */

var hapi = require('hapi');
var routes = [
    {
        method: 'GET', path: '/api', handler: function (request, reply) { reply('ok'); }
    },
    {   method: 'GET', path: '/{path*}',
        handler: { directory: { path: '../portal', listing: true } }
    }
    ];

var config = { };
var server = new hapi.Server('0.0.0.0', 8080, config); // 8080 is the port to listen on

server.route(routes);

server.start();