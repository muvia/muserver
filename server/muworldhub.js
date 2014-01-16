/**
 * muWorldHub: hub for network coordination with clients
 * through websockets.
 * it handles: rooms, regions, chat.
 * the status of the world itself is managed in another server
 * (muWorldServer). that is conected to the Hub through a single
 * websocket instance. 
 * the hub is event-driven, while the worldServer is game-loop based. 
 */

socketio = require('socket.io');

module.exports = function(){
    return {
        _io: null,

            /**
             * start to listen for websocket connections in the given port
             */
            start : function(port){
                console.log("muworldhub.start listening at port "+ port);
                this._io = socketio.listen(port);
            },

            getRegions: function(port, cb){
                console.log("numworldhub.getRegions: not implemented yet");
            }

    };
}

