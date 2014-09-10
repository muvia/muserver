/**
 * @type {*}
 */
'use strict';

var mudb = require('../services/mudb');

var username = process.argv[2];

mudb.getProfile(username, function(profile){

  console.log("profile:", profile);

  profile.sounds.background = false;

  mudb.saveProfile(username, profile, function(profile){
    console.log("saved profile:", profile);
  });

});
