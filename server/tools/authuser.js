/**
 * utility method to check the authentication for a given user.
 * use in the command line (from the root folder, not inside tools!) passing the username and password as parameters.
 * it will print to console the JSON structure stored in DB.
 * @type {*}
 */
'use strict';

var phas = require('password-hash-and-salt');
var config = require('../config');
var mudb = require('../services/mudb');

var username = process.argv[2];
var password = process.argv[3];


console.log("retrieving auth for user: ", username, password);


mudb.getUser(username, function(user){
    console.log("retrieved user: ", user);

});


/*
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
            created_at: Date.now(),
            profile:{
                renderer: "default",
                controller: "default"
            }
        };

        console.log(JSON.stringify(user));
    }
});*/