/**
 * World
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	_regions: null,

  attributes: {
  	 name: 'string',
	 status: 'string',

	 //initialize regions
	 getRegions: function(){
		if (_regions == null){
		  _regions = [];
		}
		return _regions;
	 }
  }

};
