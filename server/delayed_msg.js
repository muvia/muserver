/**
 * test of concept: how to implement a game-like loop system in nodejs, with a delayed message delivery system.
 *
 */
EventEmitter = require('events').EventEmitter

fsm = new EventEmitter();

//a queue for delayed messages (messages are notified sometime in the future)
fsm.msgqueue = []


/**
 * add a new message to the queue, to be delivered sometime in the future
 * @param target_time time to deliver the message, starting at current_time (0.0 means send now)
 * @param msg
 */
fsm.sendDelayedMsg = function(target_time, msg){
    target_time = Date.now() + target_time
    console.log("register message "+ msg + " to be delivered at " + target_time )
    this.msgqueue.push({"target_time":target_time, "msg":msg})
}

fsm.checkMsgQueue = function( ctime ){
    var len = this.msgqueue.length;
    while(len--){
        var _msg = this.msgqueue[len];
        if( ctime >= _msg.target_time){
            this.msgqueue.splice(len, 1);
            fsm.emit(_msg.msg);
        }
    }
}


fsm.run = function(){
    var ctime = Date.now();
    //console.log("tick! "+ ctime);
    this.checkMsgQueue(ctime);
}

fsm_run = function(){
    fsm.run();
}


setInterval(fsm_run, 500);

//adding some messages to test
fsm.sendDelayedMsg(6000.0, "second message");
fsm.sendDelayedMsg(3000.0, "first message");
fsm.sendDelayedMsg(9000.0, "third message");


fsm.on("first message", function(){console.log("I got the first message!");});
fsm.on("second message", function(){
    console.log("I got the second message!");
    this.sendDelayedMsg(7000.0, "fourth message");
});
fsm.on("third message", function(){console.log("I got the third message!");});
fsm.on("fourth message", function(){console.log("I got the fourth message!");});
