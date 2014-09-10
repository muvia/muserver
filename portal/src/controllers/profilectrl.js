
/**
 * controllers/logoutctrl.js
 * controller for the logout operation. it execute the logout code at construction time.
 */

muPortalApp.controller('profileController', ["$scope", "profilesrv", function($scope, profilesrv) {
  'use strict';

  $scope.profile = {
    sounds: null,
    engine: null,
    controls: null
  };

  profilesrv.getProfile(function(profile){
    $scope.profile = profile;
  });


  $scope.save = function(){
    console.log("saving profile:", $scope.profile);

    /**
     * temporal fix: right now the directive returns the "bindvar" string as the value of the fields that
     * had not changed. we are going to manually check here that everything is a boolean.

    function _checkField(group, item){
      if(($scope.profile[group])[item] !== true){ ($scope.profile[group])[item] = false;}
    }
    _checkField("sounds", "background");
    _checkField("sounds", "effects");
    _checkField("sounds", "narration");
    _checkField("engine", "clicktowalk");
    _checkField("engine", "mouse");
    _checkField("controls", "clickenabled");
    _checkField("controls", "requireconfirmation");

    console.log("cleaned profile:", $scope.profile);
     */
    profilesrv.saveProfile($scope.profile);

  };

  $scope.onChange = function(){
    console.log("something changed");
  };

}]);