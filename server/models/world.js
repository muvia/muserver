/**
 * muserver world module
 * main bussiness object.
 * it "is" the status of the server, provides its update mechanism.
 *
*/
"use strict";

/**
 * constructor
 * we must load these data from a file or something?
 */
var MuWorld = function(){
    console.log("constructor of MuWorld");
    this.id = "world01";
    this.name = "The World 01";
    this.description = "the first world";
    this.max_avatars = 100;
    this.num_avatars = 0;
};

MuWorld.prototype.acceptnew_avatars = function(){
  return this.max_avatars > this.num_avatars;
};



module.exports = new MuWorld();