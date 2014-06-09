/**
 * Muserver API
 * Profile
 * each user has an accesibility profile associated to it.
 * the profile may exist or not, and if exist, it may be completed or not. 
 * profile may be retrived and posted for update, but it must be validated against an schema. 
 */
"use strict";


/**
 * GET /profile
 * @returns {{}}
 */
exports.getProfile = function(request, reply){

    var res = {
    };

    reply(res);
};

/**
 * PUT /profile
 * @param {Object} request
 * @param {Object} reply
 */
exports.saveProfile = function(request, reply){
    var res = {
    };

    reply(res);
};
