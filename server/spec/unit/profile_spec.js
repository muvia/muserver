var config = require('../../config');

var mudb = require('../../services/mudb');

describe("profiles", function(){
  'use strict';

  it("can get and save profile", function(done){

    var profile = null;

    var callback = function(err, w){
      console.log("callback: error:", err,"w:", w);
    }


    mudb.getProfile(config.test.user, function(profile1){
      console.log("getProfile1: ", profile1);

      profile1.sounds.background = false;
      mudb.saveProfile(config.test.user, profile1, function(err, w){

        //query again..
        mudb.getProfile(config.test.user, function(profile3){
          console.log("getProfile2: ", profile3);
          expect(profile3.sounds.background).toBe(false);

          //change the value again..
          profile3.sounds.background = true;

          mudb.saveProfile(config.test.user, profile3, function(err, w){

            //query once again..
            mudb.getProfile(config.test.user, function(profile5){
              console.log("getProfile3: ", profile5);
              expect(profile5.sounds.background).toBe(true);
              done();
            });
          });
        });
      });
    });
  });


});
