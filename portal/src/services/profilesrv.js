/**
 * this service encapsulate the /profile api endpoint 
 * and keeps the user profile in memory
 */
muPortalApp.service("profilesrv", ["$http", function($http){
  'use strict';

  var _profile = null;

	this.getProfile = function(cb){
		if(_profile){
      cb(_profile);
    }else{
      $http.get('api/profile')
        .success(function(data) {
          console.log("profilesrv.js:getProfile:", data);
          _profile = data;
          cb(_profile);
        });
    }
	};
	
	this.saveProfile = function(){
		
	};
	
}]);
