/**
 * factory for the class World01
 */
//muPortalApp.factory("world01factory", function(){
  'use strict';
  /**
   *
   * @constructor
   */
  var World01 = function(){
    this.name = "world 01";
  };

  World01.prototype.test = function(){
    console.log("this is a test from ", this.name);
  };

//  return World01;

//});