/**
 * Muserver API
 * World
 * each server runs a single persistent world.
 * a world has nine main regions. (center, north, south, east .. you got it?)
 * each region can contains avatars and objects, and links to secondary regions.
 * for more info about regions, check regions.js
 */
"use strict";


var muWorld = require('../models/world.js');

/**
 * GET /world
 * @returns {{}}
 */
exports.getWorldHandler = function(request, reply){

    var res = {
        id: muWorld.id,
        name: muWorld.name,
        description: muWorld.description,
        max_avatars: muWorld.max_avatars,
        num_avatars: muWorld.num_avatars,
        acceptnew_avatars : muWorld.acceptnew_avatars()
    };

    reply(res);
};