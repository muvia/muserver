var config = require('../../config');

var mudb = require('../../services/mudb');

describe("profiles", function(){
  'use strict';

  it("can get and save profile", function(done){

    mudb.getProfile(config.test.user, function(profile){
      console.log("getProfile1: ", profile);

      profile.sounds.background = false;
      mudb.saveProfile(config.test.user, profile, function(profile){
        console.log("saveProfile1: ", profile);

        expect(profile).not.toBe(null);
        expect(profile.sounds.background).toBe(false);

        //query again..
        mudb.getProfile(config.test.user, function(profile){

          console.log("getProfile2: ", profile);
          expect(profile.sounds.background).toBe(false);

          //change the value again..
          profile.sounds.background = true;
          mudb.saveProfile(config.test.user, profile, function(profile){
            console.log("saveProfile2: ", profile);
            expect(profile).not.toBe(null);
            expect(profile.sounds.background).toBe(true);

            //query once again..
            mudb.getProfile(config.test.user, function(profile){
              console.log("getProfile3: ", profile);
              expect(profile.sounds.background).toBe(true);
              done();

            });

          });

        });

      });

    });

    ///pending();
  });



});