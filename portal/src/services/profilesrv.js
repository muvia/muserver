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
	
	this.saveProfile = function(profile){
		console.log("profilesrv.js saving profile", profile);

    $http({
      url: 'api/profile',
      method: "POST",
      data: profile
    }).success(function (data, status, headers, config) {
        _profile = profile;
    }).error(function (data, status, headers, config) {
      console.log("profilesrv.js error saving profile", data, status);
    });



  };
	
}]);
