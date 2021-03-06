/**
 * utility method to generate the user profile.
 * use in the command line (from the root folder, not inside tools!) passing the username and password as parameters.
 * it will print to console the JSON structure to store in DB.
 * @type {*}
 */
'use strict';

var phas = require('password-hash-and-salt');
//var config = require('../config');

var username = process.argv[2];
var password = process.argv[3];


console.log("creating user record for: ", username, password);

phas(password).hash(function(error, hash) {
    if(error)
        throw new Error('Something went wrong!');
    else{

        var user = {
            userid: username,
            pswd: hash,
            firstname: "first name here",
            lastname: "last name here",
            email: "email here",
            created_at: Date.now()
        };

        console.log(JSON.stringify(user));
    }
});
