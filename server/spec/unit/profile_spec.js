var config = require('../../config');

var mudb = require('../../services/mudb');

describe("profiles", function(){
  'use strict';

  it("can get", function(){

    mudb.getProfile(config.test.user, function(profile){
      console.log("profile is: ",profile);
      expect(true).toBe(false);
    });

    ///pending();
  });

  it("can save", function(){
    //pending();
  });


});