var config = require('../../config');

var mudb = require('../../services/mudb');

describe("users", function(){
  'use strict';

  it("can get and save a user", function(done){

    mudb.getUser(config.test.user, function(user){
      console.log("getUser1: ", user);
      done();
    });

  });

});
